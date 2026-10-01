TECHSHOP - PATCH LOGIN/CADASTRO

Substitua somente estes 4 arquivos na pasta D:\Teste\TECHSHOP:
- server.js
- script.js
- techshop.html
- package.json

Nao substitua usuarios.json nem pedidos.json.

Depois rode: npm.cmd install
No GitHub Desktop: Commit to main -> Push origin.

O patch usa um novo namespace forte no Netlify Blobs (techshop-data-v2), evitando dados antigos do store.
Os formularios nao fazem mais duplo envio.
Foi adicionado Mostrar/Ocultar senha no login e cadastro.
