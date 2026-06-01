"use client"

import {Node, NodeProps, useReactFlow} from "@xyflow/react";
import {memo, useState} from "react";
import { BaseExecutionNode } from "../components/base-execution-node";
import { TelegramDialog, TelegramFormValues } from "./dialog";
import { useNodeStatus } from "@/features/nodes/lib/use-node-status";
import { fetchTelegramRealtimeToken } from "./actions";
import { TELEGRAM_CHANNEL_NAME } from "@/inngest/channels/telegram";

type TelegramNodeData = {
    variableName?: string;
    credentialId?: string;
    chatId?: string;
    parseMode?: "none" | "Markdown" | "HTML";
    content?: string;
};

type TelegramNodeType = Node<TelegramNodeData>;

export const TelegramNode = memo((props: NodeProps<TelegramNodeType>) => {

    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow()

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: TELEGRAM_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchTelegramRealtimeToken,
    });
    const handleOpenSettings = () => setDialogOpen(true);

    const handleSubmit = (values: TelegramFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        ...values
                    },
                }
            }

            return node;
        }))
    };

    
    const nodeData = props.data;
    const description = nodeData?.content
        ? `Send: ${nodeData.content.slice(0, 50)}...`
        : "Not Configured";

    

    return (
        <>
            <TelegramDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/logos/telegram.svg"
                name="Telegram"
                status={nodeStatus}
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
});

TelegramNode.displayName = "TelegramNode"