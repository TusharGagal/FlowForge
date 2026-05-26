"use server"

import { getSubscriptionToken, type Realtime } from "@inngest/realtime"
import { inngest } from "@/inngest/client"
import { googleFormTriggerChannel } from "@/inngest/channels/googleFormTriggerChannel";

export type googleFormTriggerToken = Realtime.Token<
    typeof googleFormTriggerChannel,
    ["status"]
>;

export async function fetchGoogleFormTriggerRealtimeToken(): Promise<googleFormTriggerToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: googleFormTriggerChannel(),
        topics: ["status"]
    });

    return token;
}