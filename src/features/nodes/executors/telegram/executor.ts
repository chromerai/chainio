import type { NodeExecutor } from "@/features/nodes/lib/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { decode } from "html-entities"
import ky, { isHTTPError, isNetworkError } from "ky";
import { telegramChannel } from "@/inngest/channels/telegram";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

Handlebars.registerHelper("json" , (context) => {
    const stringified = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(stringified);

    return safeString;
});


type TelegramData = {
    variableName?: string;
    credentialId?: string;
    chatId?: string;
    parseMode?: "none" | "Markdown" | "HTML";
    content?: string;
};

export const telegramExecutor: NodeExecutor<TelegramData> = async ({
    data,
    nodeId,
    userId,
    context,
    step,
    publish,
}) => {
    //Publish "Loading" state for htpp - request. 
    await publish(
        telegramChannel().status({
            nodeId,
            status: "loading",
        }),
    );

    if(!data.content) {
        await publish(
            telegramChannel().status({
                nodeId,
                status: "error",
            }),
        )
        throw new NonRetriableError("Telegram node: content is missing")
    }

    const rawContent = Handlebars.compile(data.content)(context);
    const content = decode(rawContent)

    if(!data.chatId) {
        await publish(
            telegramChannel().status({
                nodeId,
                status: "error",
            }),
        )
        throw new NonRetriableError("Telegram node: chatId is missing")
    }
    if(!data.variableName) {
        await publish(
            telegramChannel().status({
                nodeId,
                status: "error",
            }),
        )
        throw new NonRetriableError("Telegram node: Variable name is missing")
    }

    const varName = data.variableName;

    if(!data.credentialId) {
        await publish(
            telegramChannel().status({
                nodeId,
                status: "error",
            }),
        )
        throw new NonRetriableError("Telegram node: CredentialId is missing")
    }

    const credential = await step.run("get-credential", () => {
        return prisma.credential.findUnique({
            where: {
                id: data.credentialId,
                userId,
            },
        });
    });

    if(!credential) {
        await publish(
            telegramChannel().status({
                nodeId,
                status: "error",
            }),
        )
        throw new NonRetriableError("Telegram node: No credential found")
    }

    try {
        const result = await step.run("telegram-bot", async () => {

            const url = `https://api.telegram.org/bot${decrypt(credential.value)}/sendMessage`;

            const telegramParseMode = data.parseMode === "Markdown" 
                ? "MarkdownV2" 
                : data.parseMode === "HTML" ? "HTML" : undefined;
            
            try {
                await ky.post(url, {
                    json: {
                        chat_id: data.chatId,
                        text: content.slice(0, 4096),
                        parse_mode: telegramParseMode,
                    },
                });
            } catch (error) {
                if(isNetworkError(error)) {
                    throw new NonRetriableError(
                        `Telegram Node: Request failed due to network error - ${error.cause}`,
                        { cause: error }
                    )
                }

                if(isHTTPError(error)) {
                    throw new NonRetriableError(
                        `Telegram Node: Webhook returned ${error.response.status}`,
                        { cause: error }
                    );
                }

                if(error instanceof Error) {
                    throw new NonRetriableError(
                        `Telegram Node: ${error.name} - ${error.cause}`,
                        { cause: error }
                    );
                }

                throw new NonRetriableError(`Telegram Node: Unknown Error `, { cause: error });
            }

            return {
                ...context,
                [varName]: {
                    messageContent: content.slice(0, 4096),
                    telegramMessageSent: true, 
                }
            }
        })

        await publish(
            telegramChannel().status({
                nodeId,
                status: "success",
            }),
        );

        return result;

    } catch(error) {
        await publish(
            telegramChannel().status({
                nodeId,
                status: "error",
            }),
        );

        throw error;
    }

};
