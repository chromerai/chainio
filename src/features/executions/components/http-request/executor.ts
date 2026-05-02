import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import Handlebars from "handlebars";

Handlebars.registerHelper("json" , (context) => {
    const stringified = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(stringified);

    return safeString;
});


type HttpRequestData = {
    variableName: string;
    endpoint: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
    data,
    nodeId,
    context,
    step,
}) => {
    //Publish "Loading" state for htpp - request. 

    if(!data.endpoint) {
        // TODO: publish "error" state for http-request
        throw new NonRetriableError("HTTP REQUEST NODE -  no exdpoint configured")
    }

    if(!data.variableName) {
        // TODO: publish "error" state for http-request
        throw new NonRetriableError("HTTP REQUEST NODE -  no variableName configured")
    }

    if(!data.method) {
        // TODO: publish "error" state for http-request
        throw new NonRetriableError("HTTP REQUEST NODE -  no method configured")
    }

    const result = await step.run("http-request", async () => {
        const endpoint = Handlebars.compile(data.endpoint)(context);
        const method = data.method;

        const options: KyOptions = { method }

        if (["POST", "PUT", "PATCH"].includes(method)) {
            const resolved = Handlebars.compile(data.body || "{}")(context);
            JSON.parse(resolved);
            options.body = resolved;
            options.headers = {
                "Content-Type": "application/json",
            }
        }

        const response = await ky(endpoint, options);
        const contentType = response.headers.get("content-type");
        const responseData = contentType?.includes("application/json") 
            ? await response.json()
            : await response.text()
        
        const responsePayload = {
            httpResponse: {
                status: response.status,
                statusText: response.statusText,
                data: responseData,
            }
        };

        
        return {
        ...context,
        [data.variableName]: responsePayload,
        }
    });

    //const result = await step.run("http-request",  async () => context);

    //TODO: publish "success" state for http request

    return result;
};
