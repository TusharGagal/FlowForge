import { google } from "googleapis";

export const gmailOauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_GMAIL_REDIRECT_URI!,
);