TECHSHOP - CORREÇÃO DO LOGIN NO NETLIFY

O backend antigo usava usuarios.json e sessões em memória. Em Netlify Functions isso não é persistente.
Esta correção usa PostgreSQL/Neon para usuários e sessões.

Arquivos para substituir no projeto:
- netlify/functions/api.cjs
- netlify/functions/api.js
- package.json

O código aceita qualquer uma destas variáveis de conexão:
- NETLIFY_DATABASE_URL (extensão Neon antiga)
- NETLIFY_DB_URL (Netlify Database atual)
- DATABASE_URL (Neon/Postgres)

A tabela techshop_usuarios e techshop_sessoes é criada automaticamente na primeira utilização.
Se existir usuarios.json no pacote, os usuários podem ser migrados para o banco quando a tabela estiver vazia.

Depois do commit/deploy:
1. Abra o site.
2. Crie uma conta nova para testar.
3. Saia e entre novamente para confirmar a sessão persistente.
