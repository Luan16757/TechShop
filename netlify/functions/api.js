const { connectLambda } = require("@netlify/blobs");
const serverless = require("serverless-http");

// Marca explicitamente o processo como Netlify antes de carregar o Express.
// Isso impede qualquer tentativa de escrita em /var/task, que é somente leitura.
process.env.TECHSHOP_NETLIFY_FUNCTION = "1";
process.env.NETLIFY = process.env.NETLIFY || "true";

const app = require("../../server.js");

const proxy = serverless(app);

exports.handler = async (event, context) => {
    connectLambda(event);
    return proxy(event, context);
};
