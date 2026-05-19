"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { geminiChannel } from "@/inngest/channels/gemini";
import prisma from "@/lib/db";

export type GeminiToken = Realtime.Token<
    typeof geminiChannel,
    ["status"]
>;

export async function fetchGeminiRealtimeToken(): Promise<GeminiToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: geminiChannel(),
        topics: ["status"],
    });

    return token;
};


/**
 * 
 * @param credentialId 
 * To get a list of models!
 */
export async function getGeminiModels(credentialId: string = "temp"){
    const apiKey = await prisma.credential.findUnique({
      where: {
        id: credentialId,
      },
      select: {value: true},
    });

    if(!apiKey) {
        throw new Error(`Missing GOOGLE_GENERATIVE_AI_API_KEY - timestamp: ${new Date().toISOString()}`)
    }
    
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.value}`,
      {cache: "no-store"}
    );

    if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
    }

    const { models } = await res.json();
    
    return models
      .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: any) => ({
        name: m.displayName,
        value: m.name.replace('models/', ''),
      }))
      .filter((model: any, index: number, self: any[]) => 
    index === self.findIndex((m) => m.value === model.value && m.name === model.name)
  );
  } 
