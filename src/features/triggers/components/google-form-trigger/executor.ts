import type { NodeExecutor } from "@/features/executions/types";
import { GoogleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";


type GoogleFormTriggerData = Record<string, unknown>;

export const GoogleFormTriggerExecutor: NodeExecutor<GoogleFormTriggerData> = async ({
    nodeId,
    context,
    step,
    publish,
}) => {
    await publish(
        GoogleFormTriggerChannel().status({
            nodeId,
            status: "loading",
        }),
    );

    const result = await step.run("google-form-trigger",  async () => context);

    await publish(
        GoogleFormTriggerChannel().status({
            nodeId,
            status: "success",
        }),
    );

    return result;
};
