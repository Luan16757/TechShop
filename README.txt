TECHSHOP - PAINEL PEDIDOS V4

Arquivos:
- admin.html
- server.js

Correções:
- pedidos exibem cliente e dados de entrega (telefone, CEP, endereço, número, cidade e estado)
- status do pedido funciona sem erro de JavaScript
- botão para excluir pedido aparece somente quando status = Cancelado
- servidor bloqueia exclusão de pedidos que não estejam Cancelado
- painel atualiza automaticamente a cada 5 segundos

Instalação:
Substitua admin.html e server.js no projeto atual. Não altere .env, Pix ou netlify/functions.
