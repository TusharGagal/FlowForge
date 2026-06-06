import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils";
import { NodeType } from "@/generated/prisma/enums";
import { getExecutor } from "@/app/features/executions/lib/executor-registry";
import { httpRequestChannel } from "./channels/httpRequestChannel";
import { manualTriggerChannel } from "./channels/manualTriggerChannel";
import { googleFormTriggerChannel } from "./channels/googleFormTriggerChannel";
import { stripeTriggerChannel } from "./channels/stripeTriggerChannel";
import { geminiChannel } from "./channels/geminiChannel";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: 0 //Todo: need to remove in production 
  },
  {
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel()
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