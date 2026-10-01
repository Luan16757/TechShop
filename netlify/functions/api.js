const serverless = require("serverless-http");
const { connectLambda } = require("@netlify/blobs");

const app = require("../../server.js");
const handler = serverless(app);

exports.handler = async (event, context) => {
    try {
        // serverless-http roda em modo Lambda compatível (Functions v1).
        // Nesse modo, o Netlify Blobs precisa receber o contexto da função
        // antes que getStore() seja chamado pelo Express.
        if (event && event.blobs) {
            connectLambda(event);
        }

        return await handler(event, context);
    } catch (error) {
        console.error("Erro na função API:", error);

        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json; charset=utf-8"
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
