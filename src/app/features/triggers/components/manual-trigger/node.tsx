"use client";
import type { NodeProps } from "@xyflow/react"
import { MousePointerIcon } from "lucide-react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node"
import { ManualTriggerDialog } from "./dialog";

export const ManualTriggerNode = memo((props: NodeProps) => {
    const [dialogOpen, SetDialogOpen] = useState(false);
    const nodeStatus = "initial";

    const handleOpenSettings = () => {
        SetDialogOpen(true);
    }

    return (
        <>
            <ManualTriggerDialog open={dialogOpen} onOpenChange={SetDialogOpen} />
            <BaseTriggerNode
                {...props}
                id={props.id}
                icon={MousePointerIcon}
                name="Manual Trigger"
                status={nodeStatus}
                description="When clicking 'Execute Workflow'"
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})

ManualTriggerNode.displayName = "ManualTriggerNode"