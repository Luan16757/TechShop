# TECHSHOP — Painel de Dropshipping

Arquivo principal do painel: `dropshipping.html`

## O que já funciona
- Lista e filtro de pedidos.
- Seleção de fornecedor: Mercado Livre, Shopee ou Outro.
- Custo de compra e cálculo do resultado bruto da venda.
- Link do fornecedor.
- Número do pedido no fornecedor.
- Código de rastreio.
- Copiar pedido para enviar ao fornecedor.
- Status: Pago, Comprado, Enviado e Entregue.
- Persistência local como fallback.

## Integração com o backend
O painel tenta encontrar pedidos em:
- `/api/admin/pedidos`
- `/api/pedidos/admin`
- `/api/admin/orders`

Quando uma dessas rotas existir, o painel tenta atualizar o dropshipping por PATCH em:
- `/api/admin/pedidos/:numero/dropshipping`
- `/api/admin/pedido/:numero/dropshipping`

Payload esperado:
```json
{
  "fornecedor": "Mercado Livre",
  "custoFornecedor": 130,
  "linkFornecedor": "https://...",
  "codigoFornecedor": "123456",
  "rastreio": "BR123456789XX",
  "status": "Enviado",
  "observacao": ""
}
```

Se a API administrativa ainda não existir, o painel usa o localStorage e mostra claramente `Modo local`. Isso não substitui a integração do backend nem a autenticação administrativa.
