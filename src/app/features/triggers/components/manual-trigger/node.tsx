"use client";
import type { NodeProps } from "@xyflow/react"
import { MousePointerIcon } from "lucide-react";
import { memo } from "react";
import { BaseTriggerNode } from "../base-trigger-node"

export const ManualTriggerNode = memo((props: NodeProps) => {
    return (
        <>
            <BaseTriggerNode
                {...props}
                id={props.id}
                icon={MousePointerIcon}
                name="Manual Trigger"
                // status={nodeStatus} TODO
                description="When clicking 'Execute Workflow'"
                onSettings={() => { }}
                onDoubleClick={() => { }}
            />
        </>
    )
})

ManualTriggerNode.displayName = "ManualTriggerNode"