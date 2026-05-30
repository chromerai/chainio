import type { NodeExecutor } from "@/features/nodes/lib/types";
import { NonRetriableError } from "inngest";
import { waitChannel } from "@/inngest/channels/wait";

type WaitUnit = "seconds" | "minutes" | "hours" | "days";

type WaitData = {
    duration?: number;
    unit?: WaitUnit;
    mode?: "After Time Interval" | "At Specific Time";
    datetime?: string;
};

// Inngest's step.sleep accepts a duration string like "1h", "30m", "2d"
const toInngestDuration = (duration: number, unit: WaitUnit): string => {
    const unitMap: Record<WaitUnit, string> = {
        seconds: "s",
        minutes: "m",
        hours: "h",
        days: "d",
    };

    return `${duration}${unitMap[unit]}`;
};

export const waitExecutor: NodeExecutor<WaitData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {
    await publish(
        waitChannel().status({
            nodeId,
            status: "loading",
        }),
    );

    if(data.mode === "At Specific Time") {
        if(!data.datetime) {
            await publish(
                waitChannel().status({
                    nodeId,
                    status: "error",
                }),
            );
            throw new NonRetriableError("Wait node: Datetime information is missing");
        }

        await step.sleepUntil("wait-delay", new Date(data.datetime))
    } else {

        if (!data.duration || data.duration <= 0) {
            await publish(
                waitChannel().status({
                    nodeId,
                    status: "error",
                }),
            );
            throw new NonRetriableError("Wait node: duration is missing or invalid");
        }

        if (!data.unit) {
            await publish(
                waitChannel().status({
                    nodeId,
                    status: "error",
                }),
            );
            throw new NonRetriableError("Wait node: unit is missing");
        }

        const inngestDuration = toInngestDuration(data.duration, data.unit);
    
        await step.sleep("wait-delay", inngestDuration);
    }

    await publish(
        waitChannel().status({
            nodeId,
            status: "success",
        }),
    );
    return context;
};