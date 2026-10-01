TECHSHOP - NETLIFY

ARQUIVOS A COPIAR PARA A RAIZ DO PROJETO:
- server.js
- netlify.toml
- prepare-netlify.js
- netlify/functions/api.js

DEPENDENCIAS:
npm install express cors dotenv serverless-http @netlify/blobs

VARIAVEIS NO NETLIFY (escopo Functions):
MP_ACCESS_TOKEN=seu_token_mercado_pago
ADMIN_USER=seu_usuario_admin
ADMIN_PASSWORD=sua_senha_admin
SESSION_SECRET=uma_string_longa_e_aleatoria

Mantenha techshop.html, admin.html, CSS, JS e imagens na raiz do projeto.
O build cria public/ automaticamente e transforma techshop.html em index.html.
usuarios.json e pedidos.json, se presentes, servem como dados iniciais na primeira execucao; depois os dados sao mantidos em Netlify Blobs.
Nao envie .env para o GitHub.
