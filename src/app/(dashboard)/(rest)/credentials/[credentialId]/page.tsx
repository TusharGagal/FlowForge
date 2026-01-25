import { requireAuth } from "@/lib/auth-utils";

interface PageProps{
    params:Promise<{
        credentialId:string;
    }>
};

const Page=async ({params}:PageProps)=>{
    await requireAuth();

    const {credentialId}=await params;
    return (
        <div className="p-6">
            <h1 className="text-foreground">credential Id: {credentialId}</h1>
        </div>
    )
}

export default Page;
