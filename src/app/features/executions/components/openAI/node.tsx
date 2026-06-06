"use client";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node"
import { AVAILABLE_MODELS, OpenAiDialog, OpenAiFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchOpenAiRealtimeToken } from "./actions";
import { OPENAI_CHANNEL_NAME } from "@/inngest/channels/openAiChannel";


type OpenAiNodeData = {
    variableName?: string,
    model?: string;
    systemPrompt?: string,
    userPrompt?: string;
}
type OpenAiNodeType = Node<OpenAiNodeData>;
export const OpenAiNode = memo((props: NodeProps<OpenAiNodeType>) => {
    const nodeData = props.data;
    const [dialogOpen, setDialogOpen] = useState(false);

    const { setNodes } = useReactFlow();

    const handleSubmit = (values: OpenAiFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        ...values
                    }
                }
            }

            return node;
        }));
        setDialogOpen(false);
    }

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: OPENAI_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchOpenAiRealtimeToken
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const description = nodeData?.model
        ? `${nodeData.model || AVAILABLE_MODELS[0]}:${nodeData.userPrompt?.slice(0, 50)}...`
        : "Not Configured";

    return (
        <>
            <OpenAiDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/logos/openai.svg"
                name="Open Ai"
                status={nodeStatus}
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})

OpenAiNode.displayName = "OpenAiNode"