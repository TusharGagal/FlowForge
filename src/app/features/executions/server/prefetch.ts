import { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";


type input = inferInput<typeof trpc.executions.getMany>

// prefetch all executions

export const prefetchExecutions = (params: input) => {
    return prefetch(trpc.executions.getMany.queryOptions(params));
}

// prefetch a single execution
export const prefetchExecution = (id: string) => {
    return prefetch(trpc.executions.getOne.queryOptions({ id }));
}