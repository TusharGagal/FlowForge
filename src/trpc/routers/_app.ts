// import { z } from "zod";
import { credentialsRouter } from "@/app/features/credentials/server/route";
import { createTRPCRouter } from "../init";
import { workflowsRouter } from "@/app/features/workflows/server/route";
import { executionsRouter } from "@/app/features/executions/server/routers";

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  credentials: credentialsRouter,
  executions: executionsRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;
