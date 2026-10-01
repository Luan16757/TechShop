TECHSHOP - CORRECAO DEFINITIVA DE LOGIN/CADASTRO

1. Substitua APENAS o server.js na pasta do projeto.
2. Mantenha seu techshop.html e script.js atuais.
3. Mantenha netlify/functions/api.js conforme este patch.
4. No Netlify, confirme MP_ACCESS_TOKEN.
5. SESSION_SECRET continua recomendado. Se ele estiver ausente, o servidor usa MP_ACCESS_TOKEN como fallback para a assinatura da sessão.
6. Faça Commit + Push no GitHub Desktop.
7. Aguarde o Netlify publicar.
8. Teste /api/status. Ele deve mostrar:
   "armazenamento": "netlify-blobs"
   "sessaoConfigurada": true
