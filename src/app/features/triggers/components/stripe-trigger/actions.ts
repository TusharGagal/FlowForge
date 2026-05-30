"use server"

import { getSubscriptionToken, type Realtime } from "@inngest/realtime"
import { inngest } from "@/inngest/client"
import { stripeTriggerChannel } from "@/inngest/channels/stripeTriggerChannel";

export type stripeTriggerToken = Realtime.Token<
    typeof stripeTriggerChannel,
    ["status"]
>;

export async function fetchStripeTriggerRealtimeToken(): Promise<stripeTriggerToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: stripeTriggerChannel(),
        topics: ["status"]
    });

    return token;
}