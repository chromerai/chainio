"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { anthropicChannel } from "@/inngest/channels/anthropic";
import prisma from "@/lib/db";

export type AnthropicToken = Realtime.Token<
    typeof anthropicChannel,
    ["status"]
>;

export async function fetchAnthropicRealtimeToken(): Promise<AnthropicToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: anthropicChannel(),
        topics: ["status"],
    });

    return token;
};

/**
 * 
 * @param credentialId 
 * To get a list of models!
 */
export async function getAnthropicModels(credentialId: string = "temp"){
  const apiKey = await prisma.credential.findUnique({
    where: {
      id: credentialId,
    },
    select: {value: true},
  });

  if(!apiKey) {
      throw new Error(`Missing ANTHROPIC_API_KEY - timestamp: ${new Date().toISOString()}`)
  }
        
  const res = await fetch('https://api.anthropic.com/v1/models', {
    method: 'GET', // Default, but good for clarity
    headers: {
      'anthropic-version': '2023-06-01',
      'X-Api-Key': `${apiKey.value}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
    const { data } = await res.json();
    
    return data
      .filter((m: any) => m?.id?.includes("claude"))
      .map((m: any) => ({
        name: m.display_name,
        value: m.id,
    }))
}


