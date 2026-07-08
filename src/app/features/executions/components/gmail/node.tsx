"use client";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node"
import { GmailDialog, GmailFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchGmailRealtimeToken } from "./actions";
import { GMAIL_CHANNEL_NAME } from "@/inngest/channels/gmailChannel";


type GmailNodeData = {
    variableName?: string,
    to?: string,
    cc?: string,
    subject?: string,
    body?: string,
}
type GmailNodeType = Node<GmailNodeData>;
export const GmailNode = memo((props: NodeProps<GmailNodeType>) => {
    const nodeData = props.data;
    const [dialogOpen, setDialogOpen] = useState(false);

    const { setNodes } = useReactFlow();

    const handleSubmit = (values: GmailFormValues) => {
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
        channel: GMAIL_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchGmailRealtimeToken
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const description = nodeData?.subject
        ? `Send: ${nodeData.subject.slice(0, 50)}...`
        : "Not Configured";

    return (
        <>
            <GmailDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/logos/gmail.svg"
                name="Gmail"
                status={nodeStatus}
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})

GmailNode.displayName = "GmailNode"