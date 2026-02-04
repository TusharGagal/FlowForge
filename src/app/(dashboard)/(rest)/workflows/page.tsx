
import { WorkflowList, WorkflowsContainer } from "@/app/features/workflows/components/workflows";
import { workflowsParamsLoader } from "@/app/features/workflows/server/params-loader";
import { prefetchWorkflows } from "@/app/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary"

type props = {
    searchParams: Promise<SearchParams>;
}
const Page = async ({ searchParams }: props) => {
    await requireAuth();
    const params = await workflowsParamsLoader(searchParams);
    prefetchWorkflows(params);
    return (
        <WorkflowsContainer>
            <HydrateClient>
                <ErrorBoundary fallback={<p>!Error</p>}>
                    <Suspense fallback={<p>Loading .... </p>}>
                        <WorkflowList />
                    </Suspense>
                </ErrorBoundary>
            </HydrateClient>
        </WorkflowsContainer>
    )
};

export default Page;