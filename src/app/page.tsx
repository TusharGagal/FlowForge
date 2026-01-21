"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import Sidebar from "@/components/Sidebar";
// import { File } from "lucide-react";
// import Link from "next/link";

// import { caller } from "@/trpc/server";
import { LogoutButton } from "./logout";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
// import { requireAuth } from "@/lib/auth-utils";

export default function Home() {
  // await requireAuth();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());
  const create = useMutation(
    trpc.createWorkflow.mutationOptions({
      onSuccess: () => {
          toast.message("Job queued")
        },
    })
  );
  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center flex-col gap-y-6">
      protected server component
      <div>{JSON.stringify(data, null, 2)}</div>
      <Button disabled={create.isPending} onClick={() => create.mutate()}>
        create workflow
      </Button>
      <LogoutButton />
    </div>

    // <div className="flex h-screen">
    //   <Sidebar />
    //   {/* Main Content */}
    //   <main className="flex-1 flex flex-col items-center justify-center px-8">
    //     <div className="text-center mb-12">
    //       <h1 className="text-3xl font-semibold">Welcome Name</h1>
    //       <p className="mt-2 text-gray-300">Create your first workflow</p>
    //     </div>

    //     <Link
    //       href="/workflow"
    //       className="flex flex-col items-center justify-center gap-4 w-48 h-48 bg-gray-600 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition cursor-pointer"
    //     >
    //       <File size={38} className="text-gray-100" />
    //       <p className="text-sm font-medium text-center text-gray-100">
    //         Start from scratch
    //       </p>
    //     </Link>
    //   </main>
    // </div>
  );
}
