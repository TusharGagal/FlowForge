import type { NodeExecutor } from "@/app/features/executions/types";
import Handlebars from "handlebars";
import { geminiChannel } from "@/inngest/channels/geminiChannel";
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai";
import { NonRetriableError } from "inngest";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
})

export type GeminiData = {
    variableName?: string,
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
}


export const GeminiExecutor: NodeExecutor<GeminiData> = async ({
    data,
    nodeId,
    context,
    step,
    publish
}) => {

    await publish(
        geminiChannel().status({
            nodeId,
            status: "loading"
        })
    )
    if (!data.variableName) {
        await publish(
            geminiChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("Gemini node: Variable name is missing.")
    }
    if (!data.userPrompt) {
        await publish(
            geminiChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("Gemini node: user prompt is missing.")
    }

    // TODO: throw if credential is missing

    const systemPrompt = data.systemPrompt
        ? Handlebars.compile(data.systemPrompt)(context)
        : "You are a helpful assistance";
    const userPrompt = Handlebars.compile(data.userPrompt)(context);

    // TODO: Fetch credentials that are user selected.

    const credentialValue = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;

    const google = createGoogleGenerativeAI({
        apiKey: credentialValue,
    });

    try {
        const { steps } = await step.ai.wrap(
            "gemini-generate-text",
            generateText,
            {
                model: google(data.model || "gemini-3.5-flash"),
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
            geminiChannel().status({
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
            geminiChannel().status({
                nodeId,
                status: "error"
            })
        );
        throw error;
    }



}