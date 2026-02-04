"use client"
import { EntityContainer, EntityHeader, EntityPagination, EntitySearch } from "@/components/entity-components";
import { useCreateWorkflows, useSuspenseWorkflows } from "../hooks/useWorkflows"
import { useRouter } from "next/navigation";
import { useWorkflowsParams } from "../hooks/useWorkflows-params";
import { useEntitySearch } from "@/hooks/use-entity-search";

export const WorkflowsSearch = () => {
    const [params, setParams] = useWorkflowsParams();
    const { searchValue, onSearchChange } = useEntitySearch({ params, setParams });
    return (
        <EntitySearch
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search Workflows"
        />
    )
}

export const WorkflowList = () => {
    const workflows = useSuspenseWorkflows();

    return (
        <p>
            {JSON.stringify(workflows.data, null, 2)}
        </p>
    )
}

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
    const createWorkflow = useCreateWorkflows();
    const router = useRouter();

    const handleCreateWorkflow = () => {
        createWorkflow.mutate(undefined, {
            onSuccess: (data) => {
                router.push(`/workflows/${data.id}`)
            },
            onError: (error) => {
                // If we add Paid subscription then we can add here accordingly.
                console.log(error)
            }
        });
    }
    return (
        <>
            <EntityHeader
                title="Workflows"
                description="Create and manage your workflows"
                onNew={handleCreateWorkflow}
                // newButtonHref="123"
                newButtonLabel="New Workflow"
                disabled={disabled}
                isCreating={createWorkflow.isPending}
            />
        </>
    )
}

export const WorkflowsPagination = () => {
    const workflows = useSuspenseWorkflows();
    const [params, setParams] = useWorkflowsParams();
    return (
        <EntityPagination
            disabled={workflows.isFetching}
            totalPages={workflows.data.totalPages}
            page={workflows.data.page}
            onPageChange={(page) => setParams({ ...params, page })}
        />
    )
}

export const WorkflowsContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <EntityContainer
            header={<WorkflowsHeader />}
            search={<WorkflowsSearch />}
            pagination={<WorkflowsPagination />}
        >
            {children}
        </EntityContainer>
    )
}

