import type { NodeExecutor } from "@/app/features/executions/types";
import Handlebars from "handlebars";
import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai";
import { NonRetriableError } from "inngest";
import { openAiChannel } from "@/inngest/channels/openAiChannel";
import prisma from "@/lib/db";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
})

export type OpenAiData = {
    variableName?: string,
    credentialId?: string
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
}


export const OpenAiExecutor: NodeExecutor<OpenAiData> = async ({
    data,
    nodeId,
    context,
    userId,
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
    if (!data.credentialId) {
        await publish(
            openAiChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("OpenAi node: Credential is required.")
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


    const systemPrompt = data.systemPrompt
        ? Handlebars.compile(data.systemPrompt)(context)
        : "You are a helpful assistance";
    const userPrompt = Handlebars.compile(data.userPrompt)(context);


    const credential = await step.run("get-credential", () => {
        return prisma.credential.findUnique({
            where: {
                id: data.credentialId,
                userId,
            }
        })
    })

    if (!credential) {
        await publish(
            openAiChannel().status({
                nodeId,
                status: "error"
            })
        );
        throw new NonRetriableError("OpenAi Node: Credential Not found");
    }
    const openai = createOpenAI({
        apiKey: credential.value,
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

        const text =
            steps?.[0]?.content?.[0]?.type === "text"
                ? steps[0].content[0].text
                : "";

        if (!text && steps?.[0]?.content?.length === 0) {
            throw new Error("OpenAI API returned empty response");
        }
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