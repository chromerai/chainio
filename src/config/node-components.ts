import { InitialNode } from "@/components/initial-node";
import { AnthropicNode } from "@/features/nodes/executors/anthropic/node";
import { DiscordNode } from "@/features/nodes/executors/discord/node";
import { GeminiNode } from "@/features/nodes/executors/gemini/node";
import { HttpRequestNode } from "@/features/nodes/executors/http-request/node";
import { OpenAiNode } from "@/features/nodes/executors/openai/node";
import { SlackNode } from "@/features/nodes/executors/slack/node";
import { TelegramNode } from "@/features/nodes/executors/telegram/node";
import { WaitNode } from "@/features/nodes/executors/wait/node";
import { GoogleFormTriggerNode } from "@/features/nodes/triggers/google-form-trigger/node";
import { ManualTriggerNode } from "@/features/nodes/triggers/manual-trigger/node";
import { StripeTriggerNode } from "@/features/nodes/triggers/stripe-trigger/node";
import { NodeType } from "@/generated/prisma/enums";
import { NodeTypes } from "@xyflow/react";

export const nodeComponents = {
    [NodeType.INITIAL]: InitialNode,
    [NodeType.HTTP_REQUEST]: HttpRequestNode,
    [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
    [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
    [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
    [NodeType.GEMINI]: GeminiNode,
    [NodeType.OPENAI]: OpenAiNode,
    [NodeType.ANTHROPIC]: AnthropicNode,
    [NodeType.DISCORD]: DiscordNode,
    [NodeType.SLACK]: SlackNode,
    [NodeType.WAIT]: WaitNode,
    [NodeType.TELEGRAM]: TelegramNode
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;

