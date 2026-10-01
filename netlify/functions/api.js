const { connectLambda } = require("@netlify/blobs");
const serverless = require("serverless-http");
const app = require("../../server.js");

const proxy = serverless(app);

exports.handler = async (event, context) => {
    // O projeto usa serverless-http (Functions v1 / Lambda compatibility).
    // O Netlify Blobs precisa receber o contexto do evento antes de getStore().
    connectLambda(event);

    return proxy(event, context);
};
