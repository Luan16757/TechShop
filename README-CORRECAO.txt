TECHSHOP - CORRECAO NETLIFY

O erro EROFS acontecia porque a Function estava sendo detectada como ambiente local
e tentava escrever pedidos.json/usuarios.json dentro de /var/task.

Arquivos para substituir no projeto D:\Teste:
- server.js
- package.json
- netlify.toml
- prepare-netlify.js
- netlify\functions\api.js

IMPORTANTE:
- NAO substitua nem envie o .env.
- O token do Mercado Pago deve continuar somente nas Environment Variables do Netlify.
- Depois de substituir os arquivos:
  1) abra o terminal em D:\Teste
  2) npm.cmd install
  3) git push pelo GitHub Desktop
  4) o Netlify fará novo deploy.

As correções principais:
- detecção robusta do ambiente Netlify;
- nenhuma escrita de pedidos.json/usuarios.json dentro da Function;
- persistência no Netlify Blobs;
- wrapper da Function força NETLIFY=true antes de carregar o servidor;
- script npm start explícito.
