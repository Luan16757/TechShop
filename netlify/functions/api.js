const serverless = require("serverless-http");
const { connectLambda } = require("@netlify/blobs");

// Garante que o Express entre no modo Netlify antes de ser carregado.
process.env.NETLIFY = "true";

const app = require("../../server.js");
const handler = serverless(app);

exports.handler = async (event, context) => {
    try {
        // A documentação do Netlify exige connectLambda(event)
        // antes de qualquer getStore/getDeployStore.
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
