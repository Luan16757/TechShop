TECHSHOP — PIX / QR CODE FIX

Correções:
- Modal Pix agora cria e exibe corretamente o QR Code.
- Código Pix copia e cola sempre aparece no checkout quando retornado pelo Mercado Pago.
- Botão Copiar funciona em PC e celular com fallback.
- Layout responsivo do Pix para desktop e celular.
- Backend retorna também pix_copia_e_cola e usa fallbacks para os campos do Mercado Pago.

Substitua:
- techshop.html
- script.js
- server.js

Não substitua o .env.
