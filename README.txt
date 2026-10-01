TECHSHOP - PATCH DA LOJA

Arquivos para substituir no projeto:
- techshop.html
- script.js
- server.js

Melhorias:
- carrinho em formato de painel lateral/bottom-sheet no celular
- cards do carrinho mais organizados
- quantidade +/-, subtotal, remoção e resumo
- aviso visual quando produto entra no carrinho
- checkout com dados de entrega enviados ao pedido
- correção do payload do Pix para enviar itens
- notificações automáticas via WhatsApp Cloud API quando configurada
- notificação de novo pedido e de pagamento aprovado

ATENCAO:
O WhatsApp automático usa a WhatsApp Cloud API da Meta. O código não precisa do token do WhatsApp no arquivo; configure as variáveis WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID e WHATSAPP_TO nas Environment Variables do Netlify.

Sem essas credenciais, a loja continua funcionando e o Pix não é bloqueado.
