const serverless = require("serverless-http");

const app = require("../../server.cjs");

let connectLambdaPromise = null;

async function prepararBlobs(event) {
    if (!connectLambdaPromise) {
        connectLambdaPromise = import("@netlify/blobs")
            .then(({ connectLambda }) => connectLambda)
            .catch((erro) => {
                connectLambdaPromise = null;
                throw erro;
            });
    }

    const connectLambda = await connectLambdaPromise;

    if (event && typeof connectLambda === "function") {
        connectLambda(event);
    }
}

const handlerExpress = serverless(app);

exports.handler = async (event, context) => {
    try {
        await prepararBlobs(event);
    } catch (erro) {
        console.error(
            "Falha ao preparar Netlify Blobs:",
            erro?.stack || erro
        );

        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                erro: "Falha ao inicializar o armazenamento da TECHSHOP.",
                detalhe: erro?.message || "Erro interno."
            })
        };
    }

    return handlerExpress(event, context);
};
