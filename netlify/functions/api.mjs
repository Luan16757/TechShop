import serverless from "serverless-http";
import { setEnvironmentContext } from "@netlify/blobs";

import app from "../../server.js";

const lambdaHandler = serverless(app);

function prepararContextoBlobs() {
    const encoded = String(
        process.env.NETLIFY_BLOBS_CONTEXT || ""
    ).trim();

    if (!encoded) {
        return;
    }

    try {
        const contexto = JSON.parse(
            Buffer.from(encoded, "base64").toString("utf8")
        );

        if (contexto?.siteID && contexto?.token) {
            setEnvironmentContext(contexto);
        }
    } catch (erro) {
        console.error(
            "Falha ao preparar contexto do Blobs:",
            erro?.message || erro
        );
    }
}

function toLambdaEvent(request) {
    const url = new URL(request.url);
    const headers = {};
    const multiValueHeaders = {};

    request.headers.forEach((value, key) => {
        headers[key] = value;
        multiValueHeaders[key] = [value];
    });

    const queryStringParameters = {};
    const multiValueQueryStringParameters = {};

    url.searchParams.forEach((value, key) => {
        queryStringParameters[key] = value;
        if (!multiValueQueryStringParameters[key]) {
            multiValueQueryStringParameters[key] = [];
        }
        multiValueQueryStringParameters[key].push(value);
    });

    return request.arrayBuffer().then((buffer) => ({
        rawUrl: url.toString(),
        rawQuery: url.search.replace(/^\?/, ""),
        path: url.pathname,
        httpMethod: request.method,
        headers,
        multiValueHeaders,
        queryStringParameters: Object.keys(queryStringParameters).length
            ? queryStringParameters
            : null,
        multiValueQueryStringParameters:
            Object.keys(multiValueQueryStringParameters).length
                ? multiValueQueryStringParameters
                : null,
        body: buffer.byteLength
            ? Buffer.from(buffer).toString("base64")
            : null,
        isBase64Encoded: Boolean(buffer.byteLength),
    }));
}

function toLambdaContext(context) {
    return {
        awsRequestId: context?.requestId || "netlify-modern",
        callbackWaitsForEmptyEventLoop: false,
        getRemainingTimeInMillis: () => 0,
    };
}

function toResponse(result) {
    const responseHeaders = new Headers();

    if (result?.headers) {
        for (const [name, value] of Object.entries(result.headers)) {
            const values = Array.isArray(value) ? value : [value];
            for (const item of values) {
                responseHeaders.append(name, String(item));
            }
        }
    }

    if (result?.multiValueHeaders) {
        for (const [name, values] of Object.entries(result.multiValueHeaders)) {
            for (const value of values || []) {
                responseHeaders.append(name, String(value));
            }
        }
    }

    let body = null;
    if (result?.body != null) {
        body = result.isBase64Encoded
            ? Buffer.from(result.body, "base64")
            : result.body;
    }

    return new Response(body, {
        status: Number(result?.statusCode || 200),
        headers: responseHeaders,
    });
}

export default async function handler(request, context) {
    prepararContextoBlobs();

    try {
        const event = await toLambdaEvent(request);
        const result = await lambdaHandler(
            event,
            toLambdaContext(context)
        );

        return toResponse(result);
    } catch (error) {
        console.error(
            "TECHSHOP API ERROR:",
            error?.stack || error
        );

        return Response.json(
            {
                erro: "Erro interno da API.",
                detalhe: error?.message || String(error),
            },
            { status: 500 }
        );
    }
}
