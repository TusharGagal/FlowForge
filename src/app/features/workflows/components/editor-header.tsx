// /* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SaveIcon } from "lucide-react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import Link from "next/link"
import { useSuspenseWorkflow, useUpdateWorkflow, useUpdateWorkflowName } from "../hooks/useWorkflows"
import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { useReactFlow } from "@xyflow/react"

export const EditorSavebutton = ({ workflowId }: { workflowId: string }) => {

    const { getNodes, getEdges } = useReactFlow();
    const saveWorkflow = useUpdateWorkflow();

    const handleSave = () => {
        const nodes = getNodes();
        const edges = getEdges();
        if (nodes.length === 0 && edges.length === 0) {
            return;
        }

        saveWorkflow.mutate({
            id: workflowId,
            nodes,
            edges
        })

    }

    return (
        <div className="ml-auto">
            <Button size="sm" onClick={handleSave} disabled={saveWorkflow.isPending}>
                <SaveIcon className="size-4" />
                Save
            </Button>
        </div>
    )
}


export const EditorBreadCrumbs = ({ workflowId }: { workflowId: string }) => {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink>
                        <Link prefetch href="/workflows">
                            Workflows
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <EditorNameInput workflowId={workflowId} />
            </BreadcrumbList>
        </Breadcrumb>
    )
}

export const EditorNameInput = ({ workflowId }: { workflowId: string }) => {
    const { data: workflow } = useSuspenseWorkflow(workflowId);
    const updateWorkflow = useUpdateWorkflowName();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(workflow.name);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (workflow.name) {
            setName(workflow.name);
        }
    }, [workflow.name])

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing])

    const handleSave = async () => {
        if (name === workflow.name) {
            setIsEditing(false);
            return;
        }
        try {
            await updateWorkflow.mutateAsync({ id: workflowId, name });
        } catch {
            setName(workflow.name);
        } finally {
            setIsEditing(false);
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSave();
        }
        else if (e.key === "Escape") {
            setName(workflow.name);
            setIsEditing(false);
        }
    }

    if (isEditing) {
        return (
            <Input
                disabled={updateWorkflow.isPending}
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="h-7 w-auto min-w-[100px] px-2"
            />
        )
    }
    return (
        <Breadcrumb onClick={() => setIsEditing(true)} className="cursor-pointer hover:text-foreground transition-colors">
            {workflow.name}
        </Breadcrumb>
    )
}

export const EditorHeader = ({ workflowId }: { workflowId: string }) => {
    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background">
            <SidebarTrigger />
            <EditorBreadCrumbs workflowId={workflowId} />
            <EditorSavebutton workflowId={workflowId} />
        </header>
    )
}