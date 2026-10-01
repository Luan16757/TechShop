TECHSHOP - CORREÇÃO CONTA + ACOMPANHAMENTO EM TEMPO REAL

Substitua no projeto:
1. techshop.html
2. script.js
3. server.js

Correções desta versão:
- Corrige o erro que impedia criar novas contas.
- Corrige abas Entrar / Criar conta.
- Remove envio duplicado dos formulários de login/cadastro.
- Mantém as informações da conta do cliente.
- Acompanhar pedido atualiza automaticamente a cada 3 segundos.
- Mostra o histórico de cada mudança de status com data/hora.
- Status: Aguardando pagamento -> Pagamento aprovado -> Preparando pedido -> Enviado -> Em transporte -> Entregue.
- Cancelamento aparece no histórico.
- Endpoint público de acompanhamento foi configurado sem cache.
- Netlify Blobs são atualizados por requisição para reduzir dados desatualizados durante o acompanhamento.
- Mantém Mercado Pago/Pix e integração WhatsApp existentes do server.js.

Depois de substituir os arquivos:
GitHub Desktop -> Commit -> Push origin -> aguarde o Netlify publicar.

Não substitua outros arquivos da loja nesta etapa.
