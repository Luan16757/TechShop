TECHSHOP - CORRECAO DO ERRO api.js / type: module

O erro do Netlify acontece porque:
- package.json usa "type": "module"
- netlify/functions/api.js usa CommonJS (require/module.exports)

CORRECAO:
1) Coloque esta pasta na raiz do seu projeto TechShop.
2) Execute CORRIGIR_API.bat (Windows) ou CORRIGIR_API.ps1.
3) O arquivo sera renomeado de:
   netlify/functions/api.js
   para:
   netlify/functions/api.cjs
4) Faca commit e push para o GitHub.
5) O Netlify deve detectar novamente a Function com o nome "api".

IMPORTANTE:
- Nao altere o conteudo do api.js; so a extensao.
- O nome publico da Function continua /api.
- O Build command pode continuar vazio, com Publish directory "." e Functions directory "netlify/functions".
