import serverless from "serverless-http";
import app from "../../server.js";

// Adaptador equivalente ao @netlify/aws-lambda-compat, mantido localmente
// para não adicionar nenhuma dependência nova ao projeto.
function shouldBase64Encode(contentType = "") {
  if (!contentType) return true;
  const normalized = contentType.split(";")[0].trim().toLowerCase();
  const textTypes = new Set([
    "application/csp-report",
    "application/graphql",
    "application/json",
    "application/javascript",
    "application/x-www-form-urlencoded",
    "application/x-ndjson",
    "application/xml",
  ]);
  if (normalized.startsWith("text/")) return false;
  if (normalized.endsWith("+json") || normalized.endsWith("+xml")) return false;
  return !textTypes.has(normalized);
}

async function requestToLambdaEvent(request) {
  const url = new URL(request.url);
  const headers = {};
  const multiValueHeaders = {};

  request.headers.forEach((value, key) => {
    headers[key] = value;
    multiValueHeaders[key] = value.split(",").map((v) => v.trim());
  });

  const queryStringParameters = {};
  const multiValueQueryStringParameters = {};
  url.searchParams.forEach((value, key) => {
    queryStringParameters[key] = value;
    (multiValueQueryStringParameters[key] ||= []).push(value);
  });

  let body = null;
  let isBase64Encoded = false;

  if (request.body) {
    const contentType = request.headers.get("content-type") || "";
    if (shouldBase64Encode(contentType)) {
      const buffer = Buffer.from(await request.arrayBuffer());
      body = buffer.toString("base64");
      isBase64Encoded = true;
    } else {
      body = await request.text();
    }
  }

  return {
    rawUrl: url.toString(),
    rawQuery: url.search.replace(/^\?/, ""),
    path: url.pathname,
    httpMethod: request.method,
    headers,
    multiValueHeaders,
    queryStringParameters:
      Object.keys(queryStringParameters).length ? queryStringParameters : null,
    multiValueQueryStringParameters:
      Object.keys(multiValueQueryStringParameters).length
        ? multiValueQueryStringParameters
        : null,
    body,
    isBase64Encoded,
  };
}

function modernContextToLambdaContext(context) {
  return {
    awsRequestId: context.requestId,
    callbackWaitsForEmptyEventLoop: true,
    functionName: "",
    functionVersion: "",
    invokedFunctionArn: "",
    memoryLimitInMB: "",
    logGroupName: "",
    logStreamName: "",
    getRemainingTimeInMillis: () => 0,
    done: () => {
      throw new Error("context.done() não é suportado no Netlify Functions moderno.");
    },
    fail: () => {
      throw new Error("context.fail() não é suportado no Netlify Functions moderno.");
    },
    succeed: () => {
      throw new Error("context.succeed() não é suportado no Netlify Functions moderno.");
    },
  };
}

function lambdaResultToResponse(result) {
  const headers = new Headers();

  if (result?.headers) {
    for (const [name, value] of Object.entries(result.headers)) {
      headers.set(name, String(value));
    }
  }

  if (result?.multiValueHeaders) {
    for (const [name, values] of Object.entries(result.multiValueHeaders)) {
      for (const value of values) {
        headers.append(name, String(value));
      }
    }
  }

  let body = null;
  if (result?.body != null) {
    if (result.isBase64Encoded) {
      body = Buffer.from(result.body, "base64");
    } else {
      body = result.body;
    }
  }

  return new Response(body, {
    status: Number(result?.statusCode || 200),
    headers,
  });
}

const lambdaHandler = serverless(app);

export default async function handler(request, context) {
  try {
    const event = await requestToLambdaEvent(request);
    const lambdaContext = modernContextToLambdaContext(context);
    const result = await lambdaHandler(event, lambdaContext);
    return lambdaResultToResponse(result);
  } catch (error) {
    console.error("TECHSHOP API ERROR:", error?.stack || error);
    return Response.json(
      { erro: "Erro interno da API.", detalhe: error?.message || String(error) },
      { status: 500 }
    );
  }
}
