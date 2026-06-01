import { NodeType } from "@/generated/prisma/enums";
import { NodeExecutor } from "./types";
import { manualTriggerExecutor } from "@/features/nodes/triggers/manual-trigger/executor";
import { httpRequestExecutor } from "@/features/nodes/executors/http-request/executor";
import { googleFormTriggerExecutor } from "@/features/nodes/triggers/google-form-trigger/executor";
import { stripeTriggerExecutor } from "@/features/nodes/triggers/stripe-trigger/executor";
import { geminiExecutor } from "@/features/nodes/executors/gemini/executor";
import { openAiExecutor } from "@/features/nodes/executors/openai/executor";
import { anthropicExecutor } from "@/features/nodes/executors/anthropic/executor";
import { discordExecutor } from "@/features/nodes/executors/discord/executor";
import { slackExecutor } from "@/features/nodes/executors/slack/executor";
import { waitExecutor } from "@/features/nodes/executors/wait/executor";
import { telegramExecutor } from "../executors/telegram/executor";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
    [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
    [NodeType.INITIAL]:  manualTriggerExecutor,
    [NodeType.HTTP_REQUEST]:  httpRequestExecutor,
    [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
    [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
    [NodeType.GEMINI]: geminiExecutor,
    [NodeType.OPENAI]: openAiExecutor,
    [NodeType.ANTHROPIC]: anthropicExecutor,
    [NodeType.DISCORD]: discordExecutor,
    [NodeType.SLACK]: slackExecutor,
    [NodeType.WAIT]: waitExecutor,
    [NodeType.TELEGRAM]: telegramExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
    const executor = executorRegistry[type];

    if(!executor){
        throw new Error(`No executor found for node type: ${type}`)
    }

    return executor;

}