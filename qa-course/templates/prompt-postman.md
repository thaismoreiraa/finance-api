# Prompt reutilizável — configurar Postman

Cole esta mensagem numa conversa nova (separada do `/qa-curso`), trocando só o trecho
`[PERGUNTA]` pelo que você precisa resolver naquele momento.

---

Quero configurar/ajustar o **Postman** para testar a API do projeto **finance-api**.
Não existe conector MCP pronto para o Postman, então a configuração é manual — me guie
passo a passo, e escreva os scripts/assertions em JavaScript quando precisar.

**Contexto do projeto:**
- `base_url` local: `http://localhost:3000/v1`
- Autenticação via JWT: `POST /auth/login` retorna `access_token` (1h) e
  `refresh_token` (7 dias); todas as chamadas seguintes usam
  `Authorization: Bearer {{token}}`
- Environment `finance-local` com variáveis `base_url` e `token` (token salvo
  automaticamente via script post-response no login)
- Collection organizada por recurso: Auth, Accounts, Categories, Transactions,
  Budgets, Goals, Reports — ver `qa-course/modulos/04-api-postman.md`

**O que já está pronto:** *(preencher a cada uso — ex.: "environment e login com script
prontos, falta escrever assertions das transações")*

**O que preciso agora:**
[PERGUNTA]
