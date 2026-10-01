TECHSHOP - AUTH FIX V3

Substituir no projeto:
- server.js
- techshop.html
- script.js
- netlify/functions/api.js

Correções:
- força o modo Netlify antes de carregar o Express na Function;
- inicializa connectLambda(event) antes de getStore();
- recria o store a partir do contexto atual da invocação;
- mantém leitura/escrita do store com consistência forte;
- botão de mostrar/ocultar senha no login e cadastro;
- não altera seu .env nem remove usuarios.json/pedidos.json locais.
