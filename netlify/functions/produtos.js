import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const produtos = require("../../data/produtos.json");
import { json, corsHeaders } from "./_http.js";

export async function handler(event) {
  const headers = corsHeaders(event.headers?.origin || "");
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "GET") return json(405, { erro: "Método não permitido." }, headers);
  return json(200, { produtos }, headers);
}
