import { requireAuth } from "@/lib/auth-utils";

 const Page= async ()=>{
    await requireAuth();
    return (
        <div className="p-6">
            <h1 className="text-foreground">Execution Page</h1>
        </div>
    )
};

export default Page;