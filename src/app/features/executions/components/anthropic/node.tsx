"use client";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node"
import { AnthropicDialog, AnthropicFormValues, AVAILABLE_MODELS } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchAnthropicRealtimeToken } from "./actions";
import { ANTHROPIC_CHANNEL_NAME } from "@/inngest/channels/anthropicChannel";


type AnthropicNodeData = {
    variableName?: string,
    model?: string;
    systemPrompt?: string,
    userPrompt?: string;
}
type AnthropicNodeType = Node<AnthropicNodeData>;
export const AnthropicNode = memo((props: NodeProps<AnthropicNodeType>) => {
    const nodeData = props.data;
    const [dialogOpen, setDialogOpen] = useState(false);

    const { setNodes } = useReactFlow();

    const handleSubmit = (values: AnthropicFormValues) => {
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
        channel: ANTHROPIC_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchAnthropicRealtimeToken
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const description = nodeData?.model
        ? `${nodeData.model || AVAILABLE_MODELS[0]}:${nodeData.userPrompt?.slice(0, 50)}...`
        : "Not Configured";

    return (
        <>
            <AnthropicDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/logos/anthropic.svg"
                name="Anthropic"
                status={nodeStatus}
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})

AnthropicNode.displayName = "AnthropicNode"