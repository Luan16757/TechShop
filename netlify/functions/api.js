const serverless = require("serverless-http");
const app = require("../../server.cjs");

exports.handler = serverless(app);
