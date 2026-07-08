import { NextResponse } from "next/server";
import { gmailOauth2Client } from "@/lib/gmail-oauth";

export async function GET() {
    const url = gmailOauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: [
            "email",
            "https://www.googleapis.com/auth/gmail.send",
        ],
    });

    return NextResponse.redirect(url);
}