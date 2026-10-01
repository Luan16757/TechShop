TECHSHOP - CORREÇÃO FINAL PARA NETLIFY

Substitua estes arquivos na pasta D:\Teste\TECHSHOP:
- techshop.html
- script.js
- server.js
- prepare-netlify.js
- netlify.toml
- package.json
- index.html
- netlify\functions\api.js
- pasta imagens\ (incluída neste patch)

NÃO substitua nem envie seu .env para o GitHub.

Depois no GitHub Desktop:
1) Commit to main
2) Push origin

O Netlify deverá fazer novo deploy automaticamente.

Correções incluídas:
- Imagens dos 17 produtos dentro do repositório.
- Build copia imagens para /imagens.
- CSS que estava aparecendo como texto foi removido do body.
- Formulário de cadastro chama fazerCadastro corretamente.
- Tabs Entrar/Criar conta foram adicionadas.
- Netlify Blobs inicializado com connectLambda para serverless-http.
- Armazenamento não tenta escrever em /var/task.
- Build do Netlify não confunde index.html antigo com a página principal.
- npm start e npm run build configurados.
