import { channel, topic } from "@inngest/realtime"

export const OPENAI_CHANNEL_NAME = "gemini-execution";

export const openAiChannel = channel(OPENAI_CHANNEL_NAME)
    .addTopic(
        topic('status').type<{
            nodeId: string;
            status: "loading" | "error" | "success";
        }>(),
    );
