TECHSHOP - CORRECAO DEFINITIVA DA API NETLIFY

Substitua SOMENTE:
1) server.js
2) netlify/functions/api.js

Nao mexa no techshop.html, script.js, admin.html, imagens, .env,
usuarios.json ou pedidos.json.

Motivo da correção:
A API estava usando serverless-http (Lambda compatibility) com Netlify Blobs,
mas a função nao inicializava o contexto Lambda antes de chamar getStore().
Agora api.js chama connectLambda(event) antes de executar o Express.

Depois:
GitHub Desktop -> Commit -> Push origin -> aguardar Netlify Published.

Teste primeiro:
https://rad-malasada-9dec4e.netlify.app/api/status

Depois abra a loja normalmente.
