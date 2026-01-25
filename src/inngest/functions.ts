import { inngest } from "./client";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import {createOpenAI } from '@ai-sdk/openai'
import {createAnthropic} from '@ai-sdk/anthropic'
import {generateText} from "ai"

const google=createGoogleGenerativeAI();
const openai=createOpenAI();
const anthropic=createAnthropic();


export const testAI = inngest.createFunction(
  { id: "testAI" },
  { event: "test/test.AI" },
  async ({ event, step }) => {
    const {steps:geminiSteps}=await step.ai.wrap("gemini-generate-text",generateText,{
      model:google("gemini-2.5-flash"),
      system:"You are helpful assistance.",
      prompt:"Write a vegetarian lasagna recipe for 4 people.",
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    })
    const {steps:openaiSteps}=await step.ai.wrap("openai-generate-text",generateText,{
      model:openai("gpt-4o"),
      system:"You are helpful assistance.",
      prompt:"Write a vegetarian lasagna recipe for 4 people.",
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    })
    const {steps:anthropicSteps}=await step.ai.wrap("anthropic-generate-text",generateText,{
      model:anthropic("claude-sonnet-4-5"),
      system:"You are helpful assistance.",
      prompt:"Write a vegetarian lasagna recipe for 4 people.",
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    })

    
    return {geminiSteps,openaiSteps,anthropicSteps};
  },

);