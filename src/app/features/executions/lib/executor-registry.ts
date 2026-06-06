import { NodeType } from "@/generated/prisma/enums";
import { NodeExecutor } from "../types";
import { manualTriggerExecutor } from "../../triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import type { HttpRequestData } from "../../executions/components/http-request/executor"
import { GoogleFormTriggerExecutor } from "../../triggers/components/google-form-trigger/executor";
import { StripeTriggerExecutor } from "../../triggers/components/stripe-trigger/executor";
import { GeminiData, GeminiExecutor } from "../components/gemini/executor";
import { AnthropicData, AnthropicExecutor } from "../components/anthropic/executor";
import { OpenAiData, OpenAiExecutor } from "../components/openAI/executor";


type NodeDataMap = {
    [NodeType.INITIAL]: Record<string, unknown>,
    [NodeType.MANUAL_TRIGGER]: Record<string, unknown>,
    [NodeType.HTTP_REQUEST]: HttpRequestData,
    [NodeType.GOOGLE_FORM_TRIGGER]: Record<string, unknown>,
    [NodeType.STRIPE_TRIGGER]: Record<string, unknown>
    [NodeType.GEMINI]: GeminiData,
    [NodeType.ANTHROPIC]: AnthropicData,
    [NodeType.OPENAI]: OpenAiData,

}

export const executorRegistry: { [K in NodeType]: NodeExecutor<NodeDataMap[K]> } = {
    [NodeType.INITIAL]: manualTriggerExecutor,
    [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
    [NodeType.HTTP_REQUEST]: httpRequestExecutor,
    [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerExecutor,
    [NodeType.STRIPE_TRIGGER]: StripeTriggerExecutor,
    [NodeType.GEMINI]: GeminiExecutor,
    [NodeType.ANTHROPIC]: AnthropicExecutor,
    [NodeType.OPENAI]: OpenAiExecutor,

}

export const getExecutor = <T extends NodeType>(type: T): NodeExecutor<NodeDataMap[T]> => {
    const executor = executorRegistry[type];
    if (!executor) {
        throw new Error(`No Executor found for node type: ${type}`);
    }

    return executor;
}