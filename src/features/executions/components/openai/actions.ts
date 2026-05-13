"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { openAiChannel } from "@/inngest/channels/openai";

export type OpenAiToken = Realtime.Token<
    typeof openAiChannel,
    ["status"]
>;

export async function fetchOpenAiRealtimeToken(): Promise<OpenAiToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: openAiChannel(),
        topics: ["status"],
    });

    return token;
};

// ============================================
// TODO: Replace with user credentials later
// credentials.googleApiKey
// ============================================
export async function getOpenAIModels(credentialId: string = "temp"){
    const apiKey = credentialId === "temp" ? process.env.OPENAI_API_KEY: "";
    if(!apiKey) {
        throw new Error(`Missing OPENAI_API_KEY - timestamp: ${new Date().toISOString()}`)
    }
    
    try {    
      const res = await fetch('https://api.openai.com/v1/models', {
    method: 'GET', // Default, but good for clarity
    headers: { 
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
    const { data } = await res.json();
    
    return data
      .filter((m: any) => m?.id?.includes("gpt"))
      .map((m: any) => ({
        name: m.id
          .split("-")
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        value: m.id,
    }))
  } catch (error) {
    console.error(error);
  }
  } 
