import type { NodeExecutor } from "@/app/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import Handlebars from "handlebars";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
})

export type HttpRequestData = {
    variableName: string,
    endpoint: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: string;
}

const parseResponseData = async (response: Response) => {
    const contentType = response.headers.get("content-type");
    return contentType?.includes("application/json") ? await response.json() : await response.text();
}

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
    data,
    nodeId,
    context,
    step,
}) => {
    // TODO: publish "loading" state for HTTP request.

    if (!data.endpoint) {
        // TODO: publish "error" state for manual trigger
        throw new NonRetriableError("HTTP request node: No endpoint configured.")
    }
    if (!data.variableName) {
        // TODO: publish "error" state for manual trigger
        throw new NonRetriableError("HTTP request node: Variable name not configured")
    }
    if (!data.method) {
        // TODO: publish "error" state for manual trigger
        throw new NonRetriableError("HTTP request node: Method not configured")
    }

    const result = await step.run(`http-request-${nodeId}`, async () => {
        const method = data.method || "GET";
        //   https://.../{{sampleapicall.httpresponse.data.userId}}
        const endpoint = Handlebars.compile(data.endpoint)(context);
        const options: KyOptions = { method };

        if (["POST", "PUT", "PATCH"].includes(method)) {
            const resolved = Handlebars.compile(data.body || "{}")(context);
            options.body = resolved;
            options.headers = {
                "content-type": "application/json",
            }
        }
        options.throwHttpErrors = false;

        const response = await ky(endpoint, options);
        const responseData = await parseResponseData(response);

        if (!response.ok) {
            const errorBody = typeof responseData === "string" ? responseData : JSON.stringify(responseData);
            const errorBodyMessage = errorBody ? ` Response body: ${errorBody}` : "";
            throw new Error(
                `HTTP request node failed for ${method} ${endpoint}: ${response.status} ${response.statusText}.${errorBodyMessage}`,
            );
        }

        const responsePayload = {
            httpResponse: {
                status: response.status,
                statusText: response.statusText,
                data: responseData,
            }
        }
        return {
            ...context,
            [data.variableName]: responsePayload,
        }

    });

    // TODO: publish "success" state for manual trigger
    return result;
}