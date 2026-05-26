import type { NodeExecutor } from "@/app/features/executions/types";
import { googleFormTriggerChannel } from "@/inngest/channels/googleFormTriggerChannel";

type GoogleFormTriggerData = Record<string, unknown>;

export const GoogleFormTriggerExecutor: NodeExecutor<GoogleFormTriggerData> = async ({
    nodeId,
    context,
    step,
    publish
}) => {
    try {

        await publish(
            googleFormTriggerChannel().status({
                nodeId,
                status: "loading"
            })
        )
        const result = await step.run("google-form-trigger", async () => context);

        await publish(
            googleFormTriggerChannel().status({
                nodeId,
                status: "success"
            })
        )
        return result;
    }
    catch (error) {
        await publish(
            googleFormTriggerChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw error;
    }
}