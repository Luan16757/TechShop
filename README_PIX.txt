TECHSHOP — CORREÇÃO DO PIX

1. Faça o deploy de TODOS os arquivos deste pacote no Netlify.
2. Em Netlify > Site configuration > Environment variables, cadastre:
   MERCADOPAGO_ACCESS_TOKEN = seu Access Token do Mercado Pago

O backend agora cria o pagamento Pix server-side em /v1/payments e usa X-Idempotency-Key.
O preço é recalculado no servidor a partir de data/produtos.json; o navegador não informa o preço final.

O /api/produtos também foi incluído como Netlify Function para evitar a tela "0 produtos disponíveis" quando não houver outro backend.

IMPORTANTE SOBRE FRETE:
A função valida apenas os valores permitidos (normal R$0/R$5; rápida R$10/R$15). Como o pacote não tem banco persistente de histórico de compras, a distinção primeira compra/recompra ainda depende do valor enviado pelo checkout. Para produção, o histórico precisa ser validado no backend/banco existente.

Arquivo principal: techshop.html
