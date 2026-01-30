"use client"
import { EntityContainer, EntityHeader } from "@/components/entity-components";
import { useCreateWorkflows, useSuspenseWorkflows } from "../hooks/useWorkflows"
import { useRouter } from "next/navigation";

export const WorkflowList=()=>{
    const workflows=useSuspenseWorkflows();

    return(
        <p>
            {JSON.stringify(workflows.data,null,2)}
        </p>
    )
}

export const WorkflowsHeader=({disabled}:{disabled?:boolean})=>{
    const createWorkflow=useCreateWorkflows();
    const router = useRouter();

    const handleCreateWorkflow=()=>{
        createWorkflow.mutate(undefined,{
            onSuccess:(data)=>{
                router.push(`/workflows/${data.id}`)
            },
            onError:(error)=>{
                // If we add Paid subscription then we can add here accordingly.
                console.log(error)
            }
        });
    }
    return(
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

export const WorkflowsContainer =({children}:{children:React.ReactNode})=>{
    return(
        <EntityContainer
            header={<WorkflowsHeader/>}
            search={<></>}
            pagination={<></>}
        >
            {children}
        </EntityContainer>
    )
}

