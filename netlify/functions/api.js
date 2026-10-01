import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
<<<<<<< HEAD
const api = require("./api.cjs");

=======

const api = require("./api.cjs");

>>>>>>> 868d558b70318d3025aea3f8470d86b8ce0b1a52
export const handler = api.handler;
