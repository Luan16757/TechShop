CORREÇÃO NETLIFY - API CJS

Esta versão remove netlify/functions/api.js (CommonJS em projeto type=module) e usa netlify/functions/api.cjs.

O backend Express existente foi adaptado para rodar como Netlify Function via serverless-http, preservando as rotas /api/cliente/* e demais rotas do backend.

IMPORTANTE: ao substituir os arquivos no GitHub, certifique-se de que NÃO exista mais:
netlify/functions/api.js

Deve existir:
netlify/functions/api.cjs

Variável do Mercado Pago aceita:
MP_ACCESS_TOKEN
ou
MERCADOPAGO_ACCESS_TOKEN

Build command: vazio
Publish directory: .
Functions directory: netlify/functions
