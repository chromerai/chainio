"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";

import { StripeTriggerChannel } from "@/inngest/channels/stripe-trigger";

export type StripeTriggerToken = Realtime.Token<
    typeof StripeTriggerChannel,
    ["status"]
>;

export async function fetchStripeTriggerRealtimeToken(): Promise<StripeTriggerToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: StripeTriggerChannel(),
        topics: ["status"],
    });

    return token;
};