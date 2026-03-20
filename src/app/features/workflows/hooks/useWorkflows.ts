import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWorkflowsParams } from "./useWorkflows-params";

// Hook to fetch all workflows using suspense
export const useSuspenseWorkflows = () => {
    const trpc = useTRPC();
    const [params] = useWorkflowsParams();
    return useSuspenseQuery(trpc.workflows.getMany.queryOptions(params));
}

// Hook to fetch specific workflows based on id using suspense
export const useSuspenseWorkflow = (id: string) => {
    const trpc = useTRPC();
    return useSuspenseQuery(trpc.workflows.getOne.queryOptions({ id }));
}

//Hook to create a workflow
export const useCreateWorkflows = () => {

    const queryClient = useQueryClient();
    const trpc = useTRPC();

    return useMutation(trpc.workflows.create.mutationOptions({
        onSuccess: (data) => {
            toast.success(`Workflow "${data.name}" created`);
            queryClient.invalidateQueries(
                trpc.workflows.getMany.queryOptions({}),
            )
        },
        onError: (error) => {
            toast.error(`Failed to create workflow: ${error.message}`);
        }
    }))
}

//Hook to remove a workflow
export const useRemoveWorkflows = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();
    return useMutation(trpc.workflows.remove.mutationOptions({
        onSuccess: (data) => {
            toast.success(`workflow ${data.name} removed`);
            queryClient.invalidateQueries(
                trpc.workflows.getMany.queryOptions({}),
            )
            queryClient.invalidateQueries(
                trpc.workflows.getOne.queryFilter({ id: data.id })
            )
        }
    }))
}

// Hook to update name of a workflow
export const useUpdateWorkflowName = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();
    return useMutation(
        trpc.workflows.updateName.mutationOptions({
            onSuccess: (data) => {
                toast.success(`Workflow ${data.name} updated`)
                queryClient.invalidateQueries(
                    trpc.workflows.getMany.queryOptions({}),
                )
                queryClient.invalidateQueries(
                    trpc.workflows.getOne.queryFilter({ id: data.id })
                )
            },
            onError: (error) => {
                toast.error(`Failed to update workflow name: ${error.message}`)
            }
        })
    );
}

export const useUpdateWorkflow = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();
    return useMutation(
        trpc.workflows.update.mutationOptions({
            onSuccess: (data) => {
                toast.success(`Workflow ${data.name} saved`)
                queryClient.invalidateQueries(
                    trpc.workflows.getMany.queryOptions({}),
                )
                queryClient.invalidateQueries(
                    trpc.workflows.getOne.queryFilter({ id: data.id })
                )
            },
            onError: (error) => {
                toast.error(`Failed to save workflow: ${error.message}`)
            }
        })
    );
}