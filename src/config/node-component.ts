import { HttpRequestNode } from "@/app/features/executions/components/http-request/node";
import { GoogleFormTrigger } from "@/app/features/triggers/components/google-form-trigger/node";
import { ManualTriggerNode } from "@/app/features/triggers/components/manual-trigger/node";
import { InitialNode } from "@/components/initial-node";
import { NodeType } from "@/generated/prisma/enums";
import { NodeTypes } from "@xyflow/react";


export const nodeComponents = {
    [NodeType.INITIAL]: InitialNode,
    [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
    [NodeType.HTTP_REQUEST]: HttpRequestNode,
    [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTrigger,
} as const satisfies NodeTypes


export type RegisteredNodeType = keyof typeof nodeComponents;