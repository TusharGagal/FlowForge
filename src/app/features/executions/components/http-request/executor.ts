import type { NodeExecutor } from "@/app/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import Handlebars from "handlebars";
import { httpRequestChannel } from "@/inngest/channels/httpRequestChannel";

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
    publish
}) => {

    await publish(
        httpRequestChannel().status({
            nodeId,
            status: "loading"
        })
    )

    if (!data.endpoint) {
        await publish(
            httpRequestChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("HTTP request node: No endpoint configured.")
    }
    if (!data.variableName) {
        await publish(
            httpRequestChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("HTTP request node: Variable name not configured")
    }
    if (!data.method) {
        await publish(
            httpRequestChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("HTTP request node: Method not configured")
    }

    try {

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

        await publish(
            httpRequestChannel().status({
                nodeId,
                status: "success"
            })
        )
        return result;

    } catch (error) {
        await publish(
            httpRequestChannel().status({
                nodeId,
                status: "error"
            })
        )

        throw error;
    }
}