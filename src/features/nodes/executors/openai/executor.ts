import type { NodeExecutor } from "@/features/nodes/lib/types";
import { NonRetriableError } from "inngest";
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import Handlebars from "handlebars";
import { openAiChannel } from "@/inngest/channels/openai";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

Handlebars.registerHelper("json" , (context) => {
    const stringified = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(stringified);

    return safeString;
});


type OpenAiData = {
    variableName?: string;
    credentialId?: string;
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

export const openAiExecutor: NodeExecutor<OpenAiData> = async ({
    data,
    nodeId,
    userId,
    context,
    step,
    publish,
}) => {
    //Publish "Loading" state for htpp - request. 
    await publish(
        openAiChannel().status({
            nodeId,
            status: "loading",
        }),
    );

    if(!data.variableName) {
        await publish(
            openAiChannel().status({
                nodeId,
                status: "error",
            }),
        )
        throw new NonRetriableError("OpenAi node: Variable name is missing")
    }

    if(!data.userPrompt) {
        await publish(
            openAiChannel().status({
                nodeId,
                status: "error",
            }),
        )
        throw new NonRetriableError("OpenAi node: User Prompt is missing")
    }

    if(!data.credentialId) {
        await publish(
            openAiChannel().status({
                nodeId,
                status: "error",
            }),
        )
        throw new NonRetriableError("OpenAi node: Credential is missing")
    }

    const systemPrompt = data.systemPrompt
        ? Handlebars.compile(data.systemPrompt)(context)
        : "you are a helpful assistant."
    
    const userPrompt = Handlebars.compile(data.userPrompt)(context)

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
            openAiChannel().status({
                nodeId,
                status: "error",
            }),
        )
        throw new NonRetriableError("OpenAi node: No credential found")
    }

    const openai = createOpenAI({
        apiKey: decrypt(credential.value),
    })

    try {
        const { steps } = await step.ai.wrap(
            "openai-generate-text",
            generateText,
            {
                model: openai(data.model || "gpt-4o-mini"),
                system: systemPrompt,
                prompt: userPrompt,
                experimental_telemetry: {
                    isEnabled: true,
                    recordInputs: true,
                    recordOutputs: true,
                },
            },
        );

        const text = steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

        await publish(
            openAiChannel().status({
                nodeId,
                status: "success",
            }),
        );

        return {
            ...context,
            [data.variableName]: {
                text,
            },
        }

    } catch(error) {
        await publish(
            openAiChannel().status({
                nodeId,
                status: "error",
            }),
        );

        throw error;
    }

};
