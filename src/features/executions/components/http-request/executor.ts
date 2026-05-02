import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

type HttpRequestData = {
    variableName?: string;
    endpoint?: string;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
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

    const result = await step.run("http-request", async () => {
        const endpoint = data.endpoint!;
        const method = data.method || "GET";

        const options: KyOptions = { method }

        if (["POST", "PUT", "PATCH"].includes(method)) {
            if( data.body) {
                options.body = data.body;
                options.headers = {
                    "Content-Type": "application/json",
                };
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

        if ( data.variableName) {
            return {
            ...context,
            [data.variableName]: responsePayload,
            }
        }

        //Fallback to direct httpResponse for backward compatibility.
        return {
            ...context,
            ...responsePayload,
        }
    });

    //const result = await step.run("http-request",  async () => context);

    //TODO: publish "success" state for http request

    return result;
};
