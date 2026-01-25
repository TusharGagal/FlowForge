import { requireAuth } from "@/lib/auth-utils";

interface PageProps{
    params:Promise<{
        executionId:string;
    }>
};

const Page=async ({params}:PageProps)=>{
    await requireAuth();
    const {executionId}=await params;
    return (
        <div className="p-6">
            <h1 className="text-foreground">executionId Id: {executionId}</h1>
        </div>
    )
}

export default Page;
