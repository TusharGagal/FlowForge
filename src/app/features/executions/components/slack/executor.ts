import type { NodeExecutor } from "@/app/features/executions/types";
import { decode } from "html-entities"
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import ky from "ky";
import { slackChannel } from "@/inngest/channels/slackChannel";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
})

export type SlackData = {
    variableName?: string,
    content?: string,
    webhookUrl?: string,
    payloadKey?: string,
}


export const SlackExecutor: NodeExecutor<SlackData> = async ({
    data,
    nodeId,
    context,
    step,
    publish
}) => {

    await publish(
        slackChannel().status({
            nodeId,
            status: "loading"
        })
    )

    if (!data.content) {
        await publish(
            slackChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("Slack node: Message content is required.")
    }


    try {
        const rawContent = Handlebars.compile(data.content)(context);
        const content = decode(rawContent);

        const result = await step.run("slack-webhook", async () => {
            if (!data.variableName) {
                await publish(
                    slackChannel().status({
                        nodeId,
                        status: "error"
                    })
                )
                throw new NonRetriableError("Slack node: variable name is required.")
            }
            if (!data.webhookUrl) {
                await publish(
                    slackChannel().status({
                        nodeId,
                        status: "error"
                    })
                )
                throw new NonRetriableError("Slack node: Webhook URL is required.")
            }
            if (!data.payloadKey) {
                await publish(
                    slackChannel().status({
                        nodeId,
                        status: "error"
                    })
                );

                throw new NonRetriableError(
                    "Slack node: Payload key is required."
                );
            }
            const payload = {
                [data.payloadKey]: content,
            };

            await ky.post(data.webhookUrl, {
                json: payload,
            });



            return {
                ...context,
                [data.variableName]: {
                    messageContent: content,
                }
            }
        })
        await publish(
            slackChannel().status({
                nodeId,
                status: "success"
            })
        );

        return result;

    } catch (error) {
        await publish(
            slackChannel().status({
                nodeId,
                status: "error"
            })
        );
        throw error;
    }



}