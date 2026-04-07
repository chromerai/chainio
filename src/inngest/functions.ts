// src/inngest/functions.ts
import prisma from "@/lib/db";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from "@ai-sdk/anthropic"



const google = createGoogleGenerativeAI()
const openai = createOpenAI()
const anthropic = createAnthropic()

export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    await step.sleep("pretend", "5s")
    const { steps: geminiSteps } = await step.ai.wrap(
      "gemini-generate-text",
      generateText, 
      {
        model: google("gemini-2.5-flash"),
        system: "You are a helpful assistant.",
        prompt: "What is the importance of life! Give a concise answer!",
        experimental_telemetry: {
          isEnabled: true,
          functionId: "joke_agent",
          recordInputs: true,
          recordOutputs: true,
        },
      }
    );

    const { steps: openAiSteps } = await step.ai.wrap(
      "openai-generate-text",
      generateText, 
      {
        model: openai("gpt-4o"),
        system: "You are a helpful assistant.",
        prompt: "What is the importance of life! Give a concise answer!",
        experimental_telemetry: {
        isEnabled: true,
        functionId: "joke_agent",
        recordInputs: true,
        recordOutputs: true,
      },
      }
    );

    const { steps: anthropicSteps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText, 
      {
        model: anthropic("claude-sonnet-4-5"),
        system: "You are a helpful assistant.",
        prompt: "What is the importance of life! Give a concise answer!",
        experimental_telemetry: {
        isEnabled: true,
        functionId: "joke_agent",
        recordInputs: true,
        recordOutputs: true,
      },
      }
    );

    return {
      geminiSteps,
      openAiSteps,
      anthropicSteps
    };
  },
);