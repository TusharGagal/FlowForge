import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    //fetching a video
    await step.sleep("Fetching-a-video", "5s");
    // transcribing Video
    await step.sleep("transcribing", "5s");
    // sending to AI
    await step.sleep("sending-to-ai", "5s");
    // generating summary by AI
    await step.sleep("summary-generation", "5s");
    return { message: `Hello ${event.data.name}!` };
  },
);