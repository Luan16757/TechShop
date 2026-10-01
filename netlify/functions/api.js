const { connectLambda } = require("@netlify/blobs");
const serverless = require("serverless-http");
const app = require("../../server.js");

const proxy = serverless(app);

exports.handler = async (event, context) => {
    connectLambda(event);
    return proxy(event, context);
};
