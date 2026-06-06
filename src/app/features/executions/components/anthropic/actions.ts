"use server"
import { getSubscriptionToken, type Realtime } from "@inngest/realtime"
import { inngest } from "@/inngest/client"
import { anthropicChannel } from "@/inngest/channels/anthropicChannel";

export type anthropicToken = Realtime.Token<
    typeof anthropicChannel,
    ["status"]
>;

export async function fetchAnthropicRealtimeToken(): Promise<anthropicToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: anthropicChannel(),
        topics: ["status"]
    });

    return token;
}