// import Sidebar from "@/components/Sidebar";
// import { File } from "lucide-react";
// import Link from "next/link";
import { getQueryClient, trpc } from "@/trpc/server";
import { Client } from "./client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

/**
 * Server component that prefetches users, hydrates React Query state, and renders the client UI.
 *
 * Prefetches the `trpc.getUsers` query on the server and supplies its dehydrated state to the client via
 * a HydrationBoundary. Renders the client-side `Client` component inside a `Suspense` boundary with a
 * "Loading..." fallback, centered to fill the viewport.
 *
 * @returns A React element that centers a HydrationBoundary containing a Suspense-wrapped `Client` component; the Suspense fallback displays `"Loading..."`.
 */
export default async function Home() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.getUsers.queryOptions());
  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<div>Loading...</div>}>
          <Client />
        </Suspense>
      </HydrationBoundary>
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