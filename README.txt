TECHSHOP - FIX NETLIFY V5

O problema desta versão é tratado de forma limpa:
1. Apenas UMA Function existe: netlify/functions/api.mjs
2. O antigo netlify/functions/api.js deve ser APAGADO do projeto.
3. A Function usa a API moderna de Request/Response da Netlify.
4. O Express continua sendo usado internamente por serverless-http.
5. Cookies Set-Cookie em array são preservados corretamente.
6. O Netlify Blobs usa o contexto automático da Function moderna.
7. A inicialização do Blobs permite nova tentativa quando ocorrer erro transitório.

IMPORTANTE:
- Substitua a pasta inteira netlify/functions pelo conteúdo deste ZIP.
- Não deixe api.js junto com api.mjs.
- Substitua server.js pelo deste ZIP.
- Mantenha seu .env fora do Git.
- Faça commit e push e aguarde Published.

Teste:
https://rad-malasada-9dec4e.netlify.app/api/status
https://rad-malasada-9dec4e.netlify.app/api/produtos

Depois teste:
- criar conta
- sair
- entrar
