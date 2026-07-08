"use server"
import { getSubscriptionToken, type Realtime } from "@inngest/realtime"
import { inngest } from "@/inngest/client"
import { gmailChannel } from "@/inngest/channels/gmailChannel";

export type gmailToken = Realtime.Token<
    typeof gmailChannel,
    ["status"]
>;

export async function fetchGmailRealtimeToken(): Promise<gmailToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: gmailChannel(),
        topics: ["status"]
    });

    return token;
}