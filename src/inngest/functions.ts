import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils";
import { ExecutionStatus, NodeType } from "@/generated/prisma/enums";
import { getExecutor } from "@/app/features/executions/lib/executor-registry";
import { httpRequestChannel } from "./channels/httpRequestChannel";
import { manualTriggerChannel } from "./channels/manualTriggerChannel";
import { googleFormTriggerChannel } from "./channels/googleFormTriggerChannel";
import { stripeTriggerChannel } from "./channels/stripeTriggerChannel";
import { geminiChannel } from "./channels/geminiChannel";
import { openAiChannel } from "./channels/openAiChannel";
import { slackChannel } from "./channels/slackChannel";
import { anthropicChannel } from "./channels/anthropicChannel";
import { discordChannel } from "./channels/discordChannel";
import { gmailChannel } from "./channels/gmailChannel";
import { NonRetriableError } from "inngest";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: 0, //Todo: need to remove in production 
    onFailure: async ({ event, step }) => {
      return prisma.execution.update({
        where: { inngestEventId: event.data.event.id },
        data: {
          status: ExecutionStatus.FAILED,
          completedAt: new Date(),
          error: event.data.error.message,
          errorStack: event.data.error.stack,
        }
      })
    }
  },
  {
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
      openAiChannel(),
      slackChannel(),
      anthropicChannel(),
      discordChannel(),
      gmailChannel(),
    ]
  },
  async ({ event, step, publish }) => {

    const inngestEventId = event.id;
    const workflowId = event.data.workflowId;

    if (!inngestEventId || !workflowId) {
      throw new NonRetriableError("Event ID or workflow ID is missing.");
    }

    await step.run("create-execution", async () => {
      return prisma.execution.create({
        data: {
          workflowId,
          inngestEventId
        }
      })
    })

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

    const userId = await step.run("find-user-id", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        select: {
          userId: true,
        }
      });

      return workflow.userId;
    })

    // Initialize the context with any inital data from trigger
    let context = event.data.intialData || {};
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        userId,
        step,
        publish,
      })
    }

    await step.run("update-execution", async () => {
      return prisma.execution.update({
        where: { inngestEventId, workflowId },
        data: {
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          output: context,
        }
      })
    })

    return {
      workflowId,
      result: context
    };
  },

);