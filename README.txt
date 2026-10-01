TECHSHOP - CORREÇÃO BLOBS / CADASTRO

Substitua em D:\Teste\TECHSHOP:
- server.js
- netlify/functions/api.js

Depois faça Commit + Push no GitHub Desktop e aguarde novo deploy no Netlify.

Correções:
- connectLambda(event) antes do getStore
- remove strong consistency incompatível com o contexto Lambda v1
- usa armazenamento eventual padrão do Netlify Blobs
- mantém SESSION_SECRET com fallback para o MP_ACCESS_TOKEN
- impede gravação em /var/task no Netlify
