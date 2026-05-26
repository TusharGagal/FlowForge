import { NodeType } from "@/generated/prisma/enums";
import { NodeExecutor } from "../types";
import { manualTriggerExecutor } from "../../triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import type { HttpRequestData } from "../../executions/components/http-request/executor"
import { GoogleFormTriggerExecutor } from "../../triggers/components/google-form-trigger/executor";


type NodeDataMap = {
    [NodeType.INITIAL]: Record<string, unknown>,
    [NodeType.MANUAL_TRIGGER]: Record<string, unknown>,
    [NodeType.HTTP_REQUEST]: HttpRequestData,
    [NodeType.GOOGLE_FORM_TRIGGER]: Record<string, unknown>
}

export const executorRegistry: { [K in NodeType]: NodeExecutor<NodeDataMap[K]> } = {
    [NodeType.INITIAL]: manualTriggerExecutor,
    [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
    [NodeType.HTTP_REQUEST]: httpRequestExecutor,
    [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerExecutor,
}

export const getExecutor = <T extends NodeType>(type: T): NodeExecutor<NodeDataMap[T]> => {
    const executor = executorRegistry[type];
    if (!executor) {
        throw new Error(`No Executor found for node type: ${type}`);
    }

    return executor;
}