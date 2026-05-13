"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { anthropicChannel } from "@/inngest/channels/anthropic";

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

// ============================================
// TODO: Replace with user credentials later
// credentials.googleApiKey
// ============================================
export async function getAnthropicModels(credentialId: string = "temp"){
  console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY);
    const apiKey = credentialId === "temp" ? process.env.ANTHROPIC_API_KEY: "";
    if(!apiKey) {
        throw new Error(`Missing ANTHROPIC_API_KEY - timestamp: ${new Date().toISOString()}`)
    }
    
    try {    
      const res = await fetch('https://api.anthropic.com/v1/models', {
    method: 'GET', // Default, but good for clarity
    headers: {
      'anthropic-version': '2023-06-01',
      'X-Api-Key': `${apiKey}`,
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
  } catch (error) {
    console.error(error);
  }
  } 
