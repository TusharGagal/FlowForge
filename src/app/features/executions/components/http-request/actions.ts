"use server"


import { getSubscriptionToken, type Realtime } from "@inngest/realtime"
import { httpRequestChannel } from "@/inngest/channels/httpRequestChannel"
import { inngest } from "@/inngest/client"

export type httpRequestToken = Realtime.Token<
    typeof httpRequestChannel,
    ["status"]
>;

export async function fetchHttpRequestRealtimeToken(): Promise<httpRequestToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: httpRequestChannel(),
        topics: ["status"]
    });

    return token;
}