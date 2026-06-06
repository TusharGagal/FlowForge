import type { NodeExecutor } from "@/app/features/executions/types";
import Handlebars from "handlebars";
import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai";
import { NonRetriableError } from "inngest";
import { openAiChannel } from "@/inngest/channels/openAiChannel";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
})

export type OpenAiData = {
    variableName?: string,
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
}


export const OpenAiExecutor: NodeExecutor<OpenAiData> = async ({
    data,
    nodeId,
    context,
    step,
    publish
}) => {

    await publish(
        openAiChannel().status({
            nodeId,
            status: "loading"
        })
    )
    if (!data.variableName) {
        await publish(
            openAiChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("OpenAi node: Variable name is missing.")
    }
    if (!data.userPrompt) {
        await publish(
            openAiChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("OpenAi node: user prompt is missing.")
    }

    // TODO: throw if credential is missing

    const systemPrompt = data.systemPrompt
        ? Handlebars.compile(data.systemPrompt)(context)
        : "You are a helpful assistance";
    const userPrompt = Handlebars.compile(data.userPrompt)(context);

    // TODO: Fetch credentials that are user selected.

    const credentialValue = process.env.OPENAI_API_KEY!;

    const openai = createOpenAI({
        apiKey: credentialValue,
    });

    try {
        const { steps } = await step.ai.wrap(
            "openai-generate-text",
            generateText,
            {
                model: openai(data.model || "gpt-5.5"),
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
            openAiChannel().status({
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
            openAiChannel().status({
                nodeId,
                status: "error"
            })
        );
        throw error;
    }



}