import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

type HttpRequestData = {
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

    const result = await step.run("http-request", async () => {
        const endpoint = data.endpoint!;
        const method = data.method || "GET";

        const options: KyOptions = { method }

        if (["POST", "PUT", "PATCH"].includes(method)) {
            if( data.body) {
                options.body = data.body;
            }
        }

        const response = await ky(endpoint, options);
        const contentType = response.headers.get("content-type");
        const responseData = contentType?.includes("application/json") 
            ? await response.json()
            : await response.text()

        return {
            ...context,
            httpResponse: {
                status: response.status,
                statusText: response.statusText,
                data: responseData,
            }
        }
    });

    //const result = await step.run("http-request",  async () => context);

    //TODO: publish "success" state for http request

    return result;
};
