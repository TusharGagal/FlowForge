"use client"
import { useSuspenseWorkflow } from "@/app/features/workflows/hooks/useWorkflows"
import { ErrorView, LoadingView } from "./entity-components"

export const EditorLoading = () => {
    return <LoadingView message="Loading Editor..." />
}
export const EditorError = () => {
    return <ErrorView message="Error while loading editor" />
}

export const Editor = ({ workflowId }: { workflowId: string }) => {
    const { data: workflow } = useSuspenseWorkflow(workflowId);
    return (
        <p>
            {JSON.stringify(workflow, null, 2)}
        </p>
    )
}