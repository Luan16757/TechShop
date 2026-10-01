CORREÇÃO TECHSHOP - PAGAMENTO PIX

Substitua na pasta D:\Teste\TECHSHOP:
- server.js
- script.js
- techshop.html
- package.json

A correção resolve:
1. O formulário de checkout chamava finalizarPedido(), que não existia.
2. O frontend enviava "produtos" enquanto o backend esperava "itens".
3. O modal Pix não tinha os elementos usados para mostrar QR Code/Copia e Cola.
4. Os dados de endereço do checkout agora são enviados e gravados no pedido.
5. O backend aceita tanto "itens" quanto "produtos" para evitar quebra de compatibilidade.

Depois:
GitHub Desktop -> Commit to main -> Push origin

Mensagem sugerida:
Correção pagamento Pix
