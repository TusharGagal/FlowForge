import type { NodeExecutor } from "@/app/features/executions/types";
import { stripeTriggerChannel } from "@/inngest/channels/stripeTriggerChannel";

type StripeTriggerData = Record<string, unknown>;

export const StripeTriggerExecutor: NodeExecutor<StripeTriggerData> = async ({
    nodeId,
    context,
    step,
    publish
}) => {
    try {

        await publish(
            stripeTriggerChannel().status({
                nodeId,
                status: "loading"
            })
        )
        const result = await step.run("stripe-trigger", async () => context);

        await publish(
            stripeTriggerChannel().status({
                nodeId,
                status: "success"
            })
        )
        return result;
    }
    catch (error) {
        await publish(
            stripeTriggerChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw error;
    }
}