import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const produtos = require("../../data/produtos.json");
import crypto from "node:crypto";
import { json, corsHeaders } from "./_http.js";

function clean(value) {
  return String(value ?? "").trim();
}

function cpfValido(cpf) {
  const n = clean(cpf).replace(/\D/g, "");
  if (n.length !== 11 || /^([0-9])\1+$/.test(n)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(n[i]) * (10 - i);
  let d1 = 11 - (sum % 11);
  if (d1 >= 10) d1 = 0;
  if (d1 !== Number(n[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(n[i]) * (11 - i);
  let d2 = 11 - (sum % 11);
  if (d2 >= 10) d2 = 0;
  return d2 === Number(n[10]);
}

function idProduto(p) {
  return String(p?.id ?? p?._id ?? p?.codigo ?? p?.slug ?? "");
}

export async function handler(event) {
  const headers = corsHeaders(event.headers?.origin || "");
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST") return json(405, { erro: "Método não permitido." }, headers);

  const token = clean(process.env.MERCADOPAGO_ACCESS_TOKEN);
  if (!token) {
    return json(500, {
      erro: "Mercado Pago não configurado no servidor.",
      detalhe: "Cadastre MERCADOPAGO_ACCESS_TOKEN nas variáveis de ambiente do Netlify."
    }, headers);
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { erro: "Dados do pagamento inválidos." }, headers);
  }

  const itens = Array.isArray(body.itens) ? body.itens : [];
  const entrega = body.entrega && typeof body.entrega === "object" ? body.entrega : {};
  const cliente = body.cliente && typeof body.cliente === "object" ? body.cliente : {};

  if (!itens.length) return json(400, { erro: "O carrinho está vazio." }, headers);

  const email = clean(cliente.email || entrega.email).toLowerCase();
  const cpf = clean(cliente.cpf || entrega.cpf).replace(/\D/g, "");
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return json(400, { erro: "Informe um e-mail válido para gerar o Pix." }, headers);
  }
  if (!cpfValido(cpf)) {
    return json(400, { erro: "Informe um CPF válido para gerar o Pix." }, headers);
  }

  const catalogo = new Map(produtos.map(p => [idProduto(p), p]));
  let subtotal = 0;
  const itensValidados = [];

  for (const item of itens) {
    const id = clean(item?.id);
    const quantidade = Number(item?.quantidade);
    if (!id || !Number.isInteger(quantidade) || quantidade < 1 || quantidade > 20) {
      return json(400, { erro: "Quantidade ou produto inválido." }, headers);
    }
    const produto = catalogo.get(id);
    if (!produto) return json(400, { erro: `Produto não encontrado: ${id}` }, headers);
    const preco = Number(produto.preco ?? produto.price);
    if (!Number.isFinite(preco) || preco <= 0) return json(400, { erro: "Produto com preço inválido." }, headers);
    subtotal += preco * quantidade;
    itensValidados.push({ id, nome: produto.nome, quantidade, preco });
  }

  const tipoEntrega = entrega.tipoEntrega === "rapida" ? "rapida" : "normal";
  const freteInformado = Number(entrega.freteInformado);
  const frete = tipoEntrega === "rapida"
    ? (freteInformado === 15 ? 15 : 10)
    : (freteInformado === 5 ? 5 : 0);

  const total = Number((subtotal + frete).toFixed(2));
  const pedidoNumero = `TS-${Date.now().toString().slice(-8)}`;

  const payload = {
    transaction_amount: total,
    description: `Pedido ${pedidoNumero} - TECHSHOP`,
    payment_method_id: "pix",
    external_reference: pedidoNumero,
    payer: {
      email,
      first_name: clean(cliente.nome || entrega.nome).split(/\s+/)[0] || "Cliente",
      identification: { type: "CPF", number: cpf },
    },
  };

  let mpResponse;
  let mpData;
  try {
    mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(payload),
    });
    mpData = await mpResponse.json().catch(() => ({}));
  } catch (error) {
    console.error("Mercado Pago request error:", error);
    return json(502, { erro: "Não foi possível conectar ao Mercado Pago." }, headers);
  }

  if (!mpResponse.ok) {
    console.error("Mercado Pago response:", mpData);
    const detalhe = mpData?.message || mpData?.cause?.[0]?.description || "Mercado Pago recusou a criação do Pix.";
    return json(502, { erro: detalhe }, headers);
  }

  const transaction = mpData?.point_of_interaction?.transaction_data || {};
  const qrCode = transaction.qr_code || "";
  const qrBase64 = transaction.qr_code_base64 || "";

  return json(200, {
    sucesso: true,
    idPagamento: mpData.id,
    numero: pedidoNumero,
    valor: total,
    pix_copia_e_cola: qrCode,
    qr_code: qrCode,
    qr_code_base64: qrBase64,
    ticket_url: transaction.ticket_url || null,
    pedido: {
      numero: pedidoNumero,
      status: "Aguardando pagamento",
      pagamento: { id: mpData.id, qrCode },
      subtotal,
      frete,
      valorTotal: total,
      tipoEntrega,
      itens: itensValidados,
    },
  }, headers);
}
