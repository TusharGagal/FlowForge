import { requireAuth } from "@/lib/auth-utils";

interface PageProps{
    params:Promise<{
        workflowId:string;
    }>
};

const Page=async ({params}:PageProps)=>{
    await requireAuth();

    const {workflowId}=await params;
    return (
        <div className="p-6">
            <h1 className="text-foreground">workflow Id: {workflowId}</h1>
        </div>
    )
}

export default Page;
