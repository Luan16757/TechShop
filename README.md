# TECHSHOP — Base

Estrutura preparada para abrir no Visual Studio Code.

## Arquivos
- `index.html` — frontend/base visual e checkout
- `script.js` — lógica da loja, carrinho, login, checkout, frete e Pix
- `imagens/` — coloque aqui as imagens dos produtos
- `backend/` — reservado para as APIs/backend
- `.vscode/` — configuração básica do VS Code

## Entrega no checkout
- Entrega normal: grátis na primeira compra / R$ 5,00 nas demais
- Entrega rápida: + R$ 10,00
- Não há consulta de CEP, cálculo por distância ou consulta de frete no frontend.
- Para identificar a primeira compra automaticamente, o login pode retornar `primeiraCompra`, `temPedidos` ou `quantidadePedidos`.

## Produtos novos
- Tela iPhone 11 A2111/A2221/A2223 Display/Touch Incell — R$ 130,00
- Flex Bateria iPhone 11 3110mAh Wefix Oficial — R$ 150,00

## Atenção
O backend real ainda precisa estar presente para:
- `/api/cliente/*`
- `/api/produtos`
- `/api/pix`
- `/api/pedido/*`

O servidor deve recalcular o frete no backend antes de criar o Pix. O navegador não deve ser a fonte final do valor cobrado.
