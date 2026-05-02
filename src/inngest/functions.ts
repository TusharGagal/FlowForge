import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils";
import { NodeType } from "@/generated/prisma/enums";
import { getExecutor } from "@/app/features/executions/lib/executor-registry";
import { httpRequestChannel } from "./channels/httpRequestChannel";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: 0 //Todo: need to remove in production 
  },
  {
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
    ]
  },
  async ({ event, step, publish }) => {
    const workflowId = event.data.workflowId;

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        include: {
          nodes: true,
          connections: true
        }
      });

      return topologicalSort(workflow.nodes, workflow.connections);
    })

    // Initialize the context with any inital data from trigger
    let context = event.data.intialData || {};
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
        publish,
      })
    }

    return {
      workflowId,
      result: context
    };
  },

);