import type { NodeExecutor } from "@/features/nodes/lib/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { decode } from "html-entities"
import ky, { isHTTPError, isNetworkError, NetworkError } from "ky";
import { slackChannel } from "@/inngest/channels/slack";

Handlebars.registerHelper("json" , (context) => {
    const stringified = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(stringified);

    return safeString;
});


type SlackData = {
    variableName?: string;
    webhookUrl?: string;
    content?: string;
};

export const slackExecutor: NodeExecutor<SlackData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {
    //Publish "Loading" state for htpp - request. 
    await publish(
        slackChannel().status({
            nodeId,
            status: "loading",
        }),
    );

    if(!data.content) {
        await publish(
            slackChannel().status({
                nodeId,
                status: "error",
            }),
        )
        throw new NonRetriableError("Slack node: content is missing")
    }

    const rawContent = Handlebars.compile(data.content)(context);
    const content = decode(rawContent)

    try {
        const result = await step.run("slack-webhook", async () => {

            if(!data.webhookUrl) {
                await publish(
                    slackChannel().status({
                        nodeId,
                        status: "error",
                    }),
                )
                throw new NonRetriableError("Slack Node: webhook URL is missing")
            }

            try {
                await ky.post(data.webhookUrl, {
                    json: {
                        content: content, // Key depends on workflow config
                    },
                });
            } catch (error) {
                if(isNetworkError(error)) {
                    throw new NonRetriableError(
                        `Slack Node: Request failed due to network error - ${error.cause}`,
                        { cause: error }
                    )
                }

                if(isHTTPError(error)) {
                    throw new NonRetriableError(
                        `Slack Node: Webhook returned ${error.response.status}`,
                        { cause: error }
                    );
                }

                if(error instanceof Error) {
                    throw new NonRetriableError(
                        `Slack Node: ${error.name} - ${error.cause}`,
                        { cause: error }
                    );
                }

                throw new NonRetriableError(`Slack Node: Unknown Error `,{ cause: error });
            }

            if(!data.variableName) {
                await publish(
                    slackChannel().status({
                        nodeId,
                        status: "error",
                    }),
                )
                throw new NonRetriableError("Slack node: Variable name is missing")
            }


            return {
                ...context,
                [data.variableName]: {
                    messageContent: content.slice(0, 2000),
                }
            }
        })

        await publish(
            slackChannel().status({
                nodeId,
                status: "success",
            }),
        );

        return result;

    } catch(error) {
        await publish(
            slackChannel().status({
                nodeId,
                status: "error",
            }),
        );

        throw error;
    }

};
