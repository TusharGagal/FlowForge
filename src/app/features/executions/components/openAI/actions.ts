"use server"
import { getSubscriptionToken, type Realtime } from "@inngest/realtime"
import { inngest } from "@/inngest/client"
import { openAiChannel } from "@/inngest/channels/openAiChannel";

export type openaiToken = Realtime.Token<
    typeof openAiChannel,
    ["status"]
>;

export async function fetchOpenAiRealtimeToken(): Promise<openaiToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: openAiChannel(),
        topics: ["status"]
    });

    return token;
}