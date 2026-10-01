TECHSHOP - FIX V4

Este pacote elimina a mistura entre Netlify Functions moderno e o handler Lambda legado.
A Function agora recebe Request/Context do runtime moderno e adapta internamente para o
serverless-http/Express existente. Isso permite que os recursos Netlify, incluindo Blobs,
sejam inicializados no runtime moderno sem precisar de connectLambda() no handler.

Arquivos para substituir:
- server.js
- netlify/functions/api.mjs

Remover do projeto:
- netlify/functions/api.js

Nao precisa alterar package.json, package-lock, .env, techshop.html, script.js ou painel.

Teste primeiro:
https://rad-malasada-9dec4e.netlify.app/api/status

Resposta esperada:
{"online":true,"servidor":"TECHSHOP","porta":"serverless","produtos":17}

Depois teste a loja.
