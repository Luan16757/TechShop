TECHSHOP - CORREÇÃO DEFINITIVA NETLIFY

Substitua em D:\Teste\TECHSHOP:
- server.js
- netlify/functions/api.js

Depois faça Commit + Push no GitHub Desktop. O Netlify fará novo deploy.

A correção força a detecção do ambiente Netlify ANTES de carregar o Express e impede escrita de pedidos.json/usuarios.json em /var/task.
