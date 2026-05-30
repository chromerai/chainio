"use client"

import {Node, NodeProps, useReactFlow} from "@xyflow/react";
import { GlobeIcon, HourglassIcon } from "lucide-react";
import {memo, useState} from "react";
import { BaseExecutionNode } from "../components/base-execution-node";
import { WaitDialog, WaitFormValues } from "./dialog";
import { useNodeStatus } from "@/features/nodes/lib/use-node-status";
import { fetchWaitRealtimeToken } from "./actions";
import { WAIT_CHANNEL_NAME } from "@/inngest/channels/wait";


type WaitNodeData = {
    duration?: number;
    unit?: "seconds" | "minutes" | "hours" | "days";
    mode?: "After Time Interval" | "At Specific Time";
    datetime?: string;
};

type WaitNodeType = Node<WaitNodeData>;

const unitLabel: Record<string, string> = {
    seconds: "sec",
    minutes: "min",
    hours: "hr",
    days: "day",
};

export const WaitNode = memo((props: NodeProps<WaitNodeType>) => {

    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow()

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: WAIT_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchWaitRealtimeToken,
    });
    const handleOpenSettings = () => setDialogOpen(true);

    const handleSubmit = (values: WaitFormValues) => {
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
    const description =
        nodeData?.mode === "At Specific Time" && nodeData?.datetime
        ? `Until ${new Date(nodeData.datetime).toLocaleString()}`
        : nodeData?.duration && nodeData?.unit
            ? `Wait ${nodeData.duration.toFixed(2)} ${nodeData.unit}`
            : "Not Configured";

    

    return (
        <>
            <WaitDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon={HourglassIcon}
                name="Wait"
                status={nodeStatus}
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
});

WaitNode.displayName = "WaitNode"