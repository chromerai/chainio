import type { NodeExecutor } from "@/features/nodes/lib/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { discordChannel } from "@/inngest/channels/discord";
import { decode } from "html-entities"
import ky, { isHTTPError, isNetworkError } from "ky";

Handlebars.registerHelper("json" , (context) => {
    const stringified = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(stringified);

    return safeString;
});


type DiscordData = {
    variableName?: string;
    webhookUrl?: string;
    content?: string;
    username?: string;
};

export const discordExecutor: NodeExecutor<DiscordData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {
    //Publish "Loading" state for htpp - request. 
    await publish(
        discordChannel().status({
            nodeId,
            status: "loading",
        }),
    );

    if(!data.content) {
        await publish(
            discordChannel().status({
                nodeId,
                status: "error",
            }),
        )
        throw new NonRetriableError("Discord node: content is missing")
    }

    const rawContent = Handlebars.compile(data.content)(context);
    const content = decode(rawContent)
    const username = data.username ? decode(Handlebars.compile(data.username)(context)): undefined;

    try {
        const result = await step.run("discord-webhook", async () => {

            if(!data.webhookUrl) {
                await publish(
                    discordChannel().status({
                        nodeId,
                        status: "error",
                    }),
                )
                throw new NonRetriableError("Discord Node: webhook URL is missing")
            }


            try {
                await ky.post(data.webhookUrl, {
                    json: {
                        content: content.slice(0, 2000),
                        username,
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

                throw new NonRetriableError(`Slack Node: Unknown Error `, { cause: error });
            }

            if(!data.variableName) {
                await publish(
                    discordChannel().status({
                        nodeId,
                        status: "error",
                    }),
                )
                throw new NonRetriableError("Discord node: Variable name is missing")
            }


            return {
                ...context,
                [data.variableName]: {
                    messageContent: content.slice(0, 2000),
                    discordMessageSent: true, 
                }
            }
        })

        await publish(
            discordChannel().status({
                nodeId,
                status: "success",
            }),
        );

        return result;

    } catch(error) {
        await publish(
            discordChannel().status({
                nodeId,
                status: "error",
            }),
        );

        throw error;
    }

};
