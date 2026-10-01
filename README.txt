TECHSHOP — CORREÇÃO DO LOGIN DO ADMIN

1. Substitua no seu projeto APENAS:
   - server.js
   - admin.html

2. GitHub Desktop → Commit
3. Push origin
4. Espere o Netlify mostrar Published
5. Abra https://SEU-SITE.netlify.app/admin em uma aba anônima

Esta versão não depende apenas do cookie. O login retorna um token e o painel envia Authorization: Bearer nas requisições administrativas. Também corrige o problema em que erro 401 recarregava a página silenciosamente.

Não mexa no Pix, checkout, clientes ou produtos.
