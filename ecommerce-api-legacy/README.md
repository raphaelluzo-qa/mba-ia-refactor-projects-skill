# ecommerce-api-legacy

LMS API (com fluxo de checkout) em Node.js/Express usada como entrada do desafio `refactor-arch`.

## Como rodar

```bash
npm install
npm start
```

A aplicação sobe em `http://localhost:3000`. O banco SQLite é em memória e já carrega seeds automaticamente no boot.

Exemplos de requisições estão em `api.http`.

Configurações externas são lidas de variáveis de ambiente (`DB_USER`, `DB_PASSWORD`, `PAYMENT_GATEWAY_KEY` e `SMTP_USER`); não há credenciais padrão no código. Configure apenas as necessárias para integrações habilitadas e forneça segredos por um gerenciador de segredos ou ambiente seguro.
