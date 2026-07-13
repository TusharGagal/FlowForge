import type { NodeExecutor } from "@/app/features/executions/types";
import { decode } from "html-entities";
import { google } from "googleapis";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { gmailChannel } from "@/inngest/channels/gmailChannel";
import prisma from "@/lib/db";
import { gmailOauth2Client } from "@/lib/gmail-oauth";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    return new Handlebars.SafeString(jsonString);
});

export type GmailData = {
    variableName?: string;
    credentialId?: string;
    to?: string;
    cc?: string;
    subject?: string;
    body?: string;
};

export const GmailExecutor: NodeExecutor<GmailData> = async ({
    data,
    nodeId,
    context,
    userId,
    step,
    publish,
}) => {
    await publish(
        gmailChannel().status({
            nodeId,
            status: "loading",
        })
    );

    try {
        // ----------------------------
        // Validation
        // ----------------------------

        if (!data.variableName) {
            throw new NonRetriableError(
                "Gmail node: Variable name is required."
            );
        }

        if (!data.credentialId) {
            throw new NonRetriableError(
                "Gmail node: Credential is required."
            );
        }

        if (!data.to) {
            throw new NonRetriableError(
                "Gmail node: Recipient email is required."
            );
        }

        if (!data.subject) {
            throw new NonRetriableError(
                "Gmail node: Subject is required."
            );
        }

        if (!data.body) {
            throw new NonRetriableError(
                "Gmail node: Body is required."
            );
        }

        // ----------------------------
        // Compile Handlebars
        // ----------------------------

        const to = decode(
            Handlebars.compile(data.to)(context)
        );

        const subject = decode(
            Handlebars.compile(data.subject)(context)
        );

        const body = decode(
            Handlebars.compile(data.body)(context)
        );

        const cc = data.cc
            ? decode(Handlebars.compile(data.cc)(context))
            : undefined;

        // ----------------------------
        // Fetch Credential
        // ----------------------------

        const credential = await step.run(
            "get-credential",
            () =>
                prisma.credential.findUnique({
                    where: {
                        id: data.credentialId,
                        userId,
                    },
                })
        );

        if (!credential) {
            throw new NonRetriableError(
                "Gmail node: Credential not found."
            );
        }

        const config = credential.config as {
            access_token: string;
            refresh_token: string;
            expiry_date?: number;
        };

        gmailOauth2Client.setCredentials({
            access_token: config.access_token,
            refresh_token: config.refresh_token,
            expiry_date: config.expiry_date,
        });

        const result = await step.run(
            "gmail-send-email",
            async () => {
                // ----------------------------
                // Refresh access token if needed
                // ----------------------------

                await gmailOauth2Client.getAccessToken();

                const refreshed =
                    gmailOauth2Client.credentials;

                // Save refreshed token if Google returned one
                if (
                    refreshed.access_token &&
                    refreshed.access_token !==
                    config.access_token
                ) {
                    await prisma.credential.update({
                        where: {
                            id: credential.id,
                        },
                        data: {
                            config: {
                                ...(credential.config as object),
                                access_token:
                                    refreshed.access_token,
                                refresh_token:
                                    refreshed.refresh_token ??
                                    config.refresh_token,
                                expiry_date:
                                    refreshed.expiry_date,
                            },
                        },
                    });
                }

                // ----------------------------
                // Gmail Client
                // ----------------------------

                const gmail = google.gmail({
                    version: "v1",
                    auth: gmailOauth2Client,
                });

                // ----------------------------
                // Build MIME Email
                // ----------------------------
                const sanitizeHeader = (value: string) => value.replace(/[\r\n]/g, "");

                const message = [
                    `To: ${sanitizeHeader(to)}`,
                    ...(cc ? [`Cc: ${sanitizeHeader(cc)}`] : []),
                    "MIME-Version: 1.0",
                    "Content-Type: text/html; charset=UTF-8",
                    `Subject: ${sanitizeHeader(subject)}`, "",
                    body,
                ].join("\r\n");


                // ----------------------------
                // Base64URL Encode
                // ----------------------------

                const raw = Buffer.from(message)
                    .toString("base64")
                    .replace(/\+/g, "-")
                    .replace(/\//g, "_")
                    .replace(/=+$/, "");

                // ----------------------------
                // Send Email
                // ----------------------------

                await gmail.users.messages.send({
                    userId: "me",
                    requestBody: {
                        raw,
                    },
                });

                if (!data.variableName) {
                    throw new NonRetriableError("Variable name is required.");
                }

                return {
                    ...context,
                    [data.variableName]: {
                        to,
                        cc,
                        subject,
                        body,
                        status: "sent",
                    },
                };
            }
        );

        await publish(
            gmailChannel().status({
                nodeId,
                status: "success",
            })
        );

        return result;
    } catch (error) {
        await publish(
            gmailChannel().status({
                nodeId,
                status: "error",
            })
        );

        throw error;
    }
};