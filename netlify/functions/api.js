import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const api = require("./api.cjs");

export const handler = api.handler;
