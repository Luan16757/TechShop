const serverless = require("serverless-http");
const { connectLambda } = require("@netlify/blobs");

// Em Functions v1/Lambda compatibility, o contexto do Blobs não é
// preenchido automaticamente. Inicialize-o SEMPRE antes do Express
// tocar no getStore().
const app = require("../../server.js");
const handler = serverless(app);

exports.handler = async (event, context) => {
    try {
        connectLambda(event);
        return await handler(event, context);
    } catch (error) {
        console.error("Erro na função API:", error);

        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Cache-Control": "no-store"
            },
            body: JSON.stringify({
                erro: "Erro interno da API.",
                detalhe: process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined
            })
        };
    }
};
