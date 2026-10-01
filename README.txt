TECHSHOP - FIX CADASTRO / LOGIN / NETLIFY BLOBS

Substitua no projeto atual SOMENTE:
- server.js
- netlify/functions/api.js

Motivo da correção:
1. Netlify Functions v1 (Lambda compatibility) precisa de connectLambda(event) antes de getStore().
2. O store techshop-data passou a usar leitura com consistência forte, evitando que um cadastro recém-criado deixe de aparecer no login imediatamente.

Não substitua techshop.html, script.js, admin.html, .env ou imagens.
Depois faça commit e Push origin e aguarde o Netlify publicar.
