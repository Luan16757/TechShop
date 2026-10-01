TECHSHOP - CORREÇÃO TELA DE LOGIN E API

Substitua no projeto:
- server.js
- techshop.html
- script.js
- netlify/functions/api.mjs

Não substitua seu .env.

Depois faça Commit + Push no GitHub Desktop e aguarde o Netlify publicar.

Teste nesta ordem:
1) /api/status
2) /api/produtos
3) abra a loja
4) Criar conta
5) Sair
6) Entrar

A tela de autenticação foi centralizada e ganhou layout responsivo, senha mostrar/ocultar e mensagens de erro do servidor.

A API prepara o contexto do Netlify Blobs a partir de NETLIFY_BLOBS_CONTEXT e mantém o Express por trás da Function. A tela de login não depende da leitura do Blobs para exibir-se.
