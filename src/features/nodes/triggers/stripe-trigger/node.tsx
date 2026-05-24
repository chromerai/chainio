import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "@/features/nodes/triggers/components/base-trigger-node";
import { StripeTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/nodes/lib/use-node-status";
import { fetchStripeTriggerRealtimeToken } from "./actions";
import { STRIPE_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/stripe-trigger";

export const StripeTriggerNode = memo((props: NodeProps) => {

    const nodeStatus = useNodeStatus({
            nodeId: props.id,
            channel: STRIPE_TRIGGER_CHANNEL_NAME,
            topic: "status",
            refreshToken: fetchStripeTriggerRealtimeToken,
        });

    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpenSettings = () => setDialogOpen(true);
    return (
        <>
            <StripeTriggerDialog 
                open={dialogOpen} 
                onOpenChange={setDialogOpen}
            />
            <BaseTriggerNode
                {...props}
                icon="/logos/stripe.svg"
                name="Stripe"
                description="When Stripe event is captured"
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})