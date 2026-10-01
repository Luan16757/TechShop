CORREÇÃO DO DEPLOY TECHSHOP

1) No Netlify, abra Site configuration > Build & deploy > Build settings.
2) Apague o Build command:
   node prepare-netlify.js
3) Deixe o Build command VAZIO.
4) O Publish directory deve ficar: .
5) As Functions devem ficar em: netlify/functions
6) Faça um novo deploy.

Motivo:
O repositório usa package.json com "type": "module" e o prepare-netlify.js usa require().
Como as Functions já estão em netlify/functions, o prepare script não é necessário para o deploy desta versão.
