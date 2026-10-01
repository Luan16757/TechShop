TECHSHOP — LOGIN FIX V6

Problema corrigido:
Netlify Blobs estava usando consistency: "strong" sem uncachedEdgeURL, causando:
"Netlify Blobs has failed to perform a read using strong consistency because the environment has not been configured with a 'uncachedEdgeURL' property".

Esta versão usa consistency: "eventual", que é o modo suportado sem esse campo, e faz uma atualização forçada dos dados antes de concluir que um e-mail não existe.

Arquivos:
- server.js (substituir o atual)
- api.mjs (apenas referência; mantenha o seu netlify/functions/api.mjs atual, se já for igual)

Não altere .env.
Não altere techshop.html/script.js/painel nesta correção.

Depois do deploy, teste:
1) /api/status
2) criar conta
3) sair
4) entrar novamente
