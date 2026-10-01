const serverless = require("serverless-http");
const { connectLambda } = require("@netlify/blobs");

const app = require("../../server.js");
const handler = serverless(app);

exports.handler = async (event, context) => {
    // serverless-http usa o modo Lambda compatibility.
    // O Netlify Blobs precisa receber o evento Lambda antes do getStore().
    connectLambda(event);
    return handler(event, context);
};
