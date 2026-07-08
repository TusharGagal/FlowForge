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

        gmailOauth2Client.setCredentials(tokens);

        // Get Gmail account information
        const oauth2 = google.oauth2({
            version: "v2",
            auth: gmailOauth2Client,
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

        if (!existingCredential) {
            await prisma.credential.create({
                data: {
                    userId: session.user.id,
                    name: data.email,
                    type: CredentialType.GMAIL,
                    config: {
                        email: data.email,
                        access_token: tokens.access_token,
                        refresh_token: tokens.refresh_token,
                        expiry_date: tokens.expiry_date,
                        token_type: tokens.token_type,
                        scope: tokens.scope,
                    },
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