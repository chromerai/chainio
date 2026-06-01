"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";;
import { telegramChannel } from "@/inngest/channels/telegram";

export type telegramToken = Realtime.Token<
    typeof telegramChannel,
    ["status"]
>;

export async function fetchTelegramRealtimeToken(): Promise<telegramToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: telegramChannel(),
        topics: ["status"],
    });

    return token;
};
