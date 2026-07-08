"use server"
import { getSubscriptionToken, type Realtime } from "@inngest/realtime"
import { inngest } from "@/inngest/client"
import { discordChannel } from "@/inngest/channels/discordChannel";

export type discordToken = Realtime.Token<
    typeof discordChannel,
    ["status"]
>;

export async function fetchDiscordRealtimeToken(): Promise<discordToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: discordChannel(),
        topics: ["status"]
    });

    return token;
}