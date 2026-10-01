TECHSHOP - PAINEL DE PEDIDOS COM DADOS DE ENTREGA

Substitua no projeto:
- admin.html
- server.js

O painel agora exibe, em cada pedido, os dados de entrega enviados no checkout:
telefone, CEP, endereço, número, cidade e estado, além dos dados do cliente e CPF.

O server.js incluído já salva o objeto entrega dentro de cada pedido e mantém a autenticação administrativa por cookie ou Bearer token.

Depois: GitHub Desktop -> Commit -> Push origin -> aguarde o Netlify publicar.
