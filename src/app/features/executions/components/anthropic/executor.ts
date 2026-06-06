import type { NodeExecutor } from "@/app/features/executions/types";
import Handlebars from "handlebars";
import { createAnthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai";
import { NonRetriableError } from "inngest";
import { anthropicChannel } from "@/inngest/channels/anthropicChannel";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
})

export type AnthropicData = {
    variableName?: string,
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
}


export const AnthropicExecutor: NodeExecutor<AnthropicData> = async ({
    data,
    nodeId,
    context,
    step,
    publish
}) => {

    await publish(
        anthropicChannel().status({
            nodeId,
            status: "loading"
        })
    )
    if (!data.variableName) {
        await publish(
            anthropicChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("Anthropic node: Variable name is missing.")
    }
    if (!data.userPrompt) {
        await publish(
            anthropicChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("Anthropic node: user prompt is missing.")
    }

    // TODO: throw if credential is missing

    const systemPrompt = data.systemPrompt
        ? Handlebars.compile(data.systemPrompt)(context)
        : "You are a helpful assistance";
    const userPrompt = Handlebars.compile(data.userPrompt)(context);

    // TODO: Fetch credentials that are user selected.

    const credentialValue = process.env.ANTHROPIC_API_KEY!;

    const anthropic = createAnthropic({
        apiKey: credentialValue,
    });

    try {
        const { steps } = await step.ai.wrap(
            "anthropic-generate-text",
            generateText,
            {
                model: anthropic(data.model || "claude-opus-4-8"),
                system: systemPrompt,
                prompt: userPrompt,
                experimental_telemetry: {
                    isEnabled: true,
                    recordInputs: true,
                    recordOutputs: true
                },
            },
        );

        const text = steps[0].content[0].type === "text"
            ? steps[0].content[0].text
            : ""

        await publish(
            anthropicChannel().status({
                nodeId,
                status: "success"
            })
        );

        return {
            ...context,
            [data.variableName]: {
                aiResponse: text,
            }
        }

    } catch (error) {
        await publish(
            anthropicChannel().status({
                nodeId,
                status: "error"
            })
        );
        throw error;
    }



}