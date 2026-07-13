import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

import prisma from "@/lib/db";
import { gmailOauth2Client } from "@/lib/gmail-oauth";
import { requireAuth } from "@/lib/auth-utils";
import { CredentialType } from "@/generated/prisma/enums";

export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth();

        const { searchParams } = new URL(request.url);

        const code = searchParams.get("code");

        if (!code) {
            return NextResponse.json(
                {
                    error: "Authorization code missing",
                },
                {
                    status: 400,
                }
            );
        }

        // Exchange authorization code for tokens
        const { tokens } = await gmailOauth2Client.getToken(code);

        // Create a per-request client to avoid race conditions on the shared singleton
        const requestClient = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID!,
            process.env.GOOGLE_CLIENT_SECRET!,
            process.env.GOOGLE_GMAIL_REDIRECT_URI!,
        );
        requestClient.setCredentials(tokens);

        const oauth2 = google.oauth2({
            version: "v2",
            auth: requestClient,
        });
        const { data } = await oauth2.userinfo.get();

        if (!data.email) {
            return NextResponse.json(
                {
                    error: "Unable to retrieve Gmail account.",
                },
                {
                    status: 400,
                }
            );
        }

        // Prevent duplicate Gmail credentials
        const existingCredential = await prisma.credential.findFirst({
            where: {
                userId: session.user.id,
                type: CredentialType.GMAIL,
                name: data.email,
            },
        });

        const tokenConfig = {
            email: data.email,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expiry_date: tokens.expiry_date,
            token_type: tokens.token_type,
            scope: tokens.scope,
        };

        if (existingCredential) {
            await prisma.credential.update({
                where: { id: existingCredential.id },
                data: { config: tokenConfig },
            });
        } else {
            await prisma.credential.create({
                data: {
                    userId: session.user.id,
                    name: data.email,
                    type: CredentialType.GMAIL,
                    config: tokenConfig,
                },
            });
        }

        return NextResponse.redirect(
            new URL("/credentials", request.url)
        );
    } catch (error) {
        console.error("Gmail OAuth Error:", error);

        return NextResponse.json(
            {
                error: "Failed to connect Gmail account.",
            },
            {
                status: 500,
            }
        );
    }
}