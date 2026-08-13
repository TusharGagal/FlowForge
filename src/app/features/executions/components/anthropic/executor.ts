import type { NodeExecutor } from "@/app/features/executions/types";
import Handlebars from "handlebars";
import { createAnthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai";
import { NonRetriableError } from "inngest";
import { anthropicChannel } from "@/inngest/channels/anthropicChannel";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
})

export type AnthropicData = {
    variableName?: string,
    credentialId?: string,
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
}


export const AnthropicExecutor: NodeExecutor<AnthropicData> = async ({
    data,
    nodeId,
    context,
    userId,
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
    if (!data.credentialId) {
        await publish(
            anthropicChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("Anthropic node: Credential is required.")
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
            anthropicChannel().status({
                nodeId,
                status: "error"
            })
        );
        throw new NonRetriableError("Anthropic Node: Credential Not found");
    }

    const config = credential.config as {
        apiKey: string;
    };
    const anthropic = createAnthropic({
        apiKey: decrypt(config.apiKey),
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

        const text =
            steps?.[0]?.content?.[0]?.type === "text"
                ? steps[0].content[0].text
                : "";

        if (!text && steps?.[0]?.content?.length === 0) {
            throw new Error("Anthropic API returned empty response");
        }


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