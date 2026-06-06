import { AnthropicNode } from "@/app/features/executions/components/anthropic/node";
import { GeminiNode } from "@/app/features/executions/components/gemini/node";
import { HttpRequestNode } from "@/app/features/executions/components/http-request/node";
import { OpenAiNode } from "@/app/features/executions/components/openAI/node";
import { GoogleFormTrigger } from "@/app/features/triggers/components/google-form-trigger/node";
import { ManualTriggerNode } from "@/app/features/triggers/components/manual-trigger/node";
import { StripeTrigger } from "@/app/features/triggers/components/stripe-trigger/node";
import { InitialNode } from "@/components/initial-node";
import { NodeType } from "@/generated/prisma/enums";
import { NodeTypes } from "@xyflow/react";


export const nodeComponents = {
    [NodeType.INITIAL]: InitialNode,
    [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
    [NodeType.HTTP_REQUEST]: HttpRequestNode,
    [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTrigger,
    [NodeType.STRIPE_TRIGGER]: StripeTrigger,
    [NodeType.GEMINI]: GeminiNode,
    [NodeType.OPENAI]: OpenAiNode,
    [NodeType.ANTHROPIC]: AnthropicNode,
} as const satisfies NodeTypes


export type RegisteredNodeType = keyof typeof nodeComponents;