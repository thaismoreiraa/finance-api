# Módulo 04 — Postman: anatomia de uma requisição

## Parte A — Dissecando endpoints pelo Swagger

### 1. POST /auth/register

| Campo | Resposta |
|---|---|
| Método e endpoint | `POST` - `/v1/auth/register` |
| Precisa de token? | Não. O endpoint não exibe o ícone de cadeado no Swagger. |
| Path parameter / query parameter | Não |
| Body enviado | Obrigatórios: `name` (string, até 100 caracteres), `email` (formato de e-mail), `password` (mín. 8 caracteres). Opcional: `currency` (`BRL`, `USD` ou `EUR`; se omitido, assume `BRL`). Fonte: schema `UserRegisterRequest` no Swagger. Enviado no teste: `{ "name": "Thais QA", "email": "qa@teste.com", "password": "senha12345", "currency": "BRL" }` |
| Status code de sucesso | `201 Created` |
| Body de resposta | `{ "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....", "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....", "token_type": "Bearer", "expires_in": 3600 }` |

### 2. GET /users/me

| Campo | Resposta |
|---|---|
| Método e endpoint | `GET` - `/v1/users/me` |
| Precisa de token? | Sim. O endpoint exibe o ícone de cadeado no Swagger; ao clicar nele, é possível informar o token no formato `Authorization: Bearer <access_token>`. |
| Path parameter / query parameter | Não |
| Body enviado | Nenhum. O Swagger não define `requestBody` para `GET /users/me`. |
| Status code de sucesso | `200 OK` |
| Body de resposta | `{ "id": "716437f5-3da6-4f37-96e6-6e32ae58f673", "name": "Thais QA", "email": "qa@teste.com", "currency": "BRL", "created_at": "2026-09-23T15:19:00.886Z", "updated_at": null }` |

### 3. PATCH /users/me

| Campo | Resposta |
|---|---|
| Método e endpoint | `PATCH` - `/v1/users/me` |
| Precisa de token? | Sim. O endpoint exibe o ícone de cadeado no Swagger; ao clicar nele, é possível informar o token no formato `Authorization: Bearer <access_token>`. |
| Path parameter / query parameter | Não |
| Body enviado | Obrigatórios: nenhum campo individual, mas o body em si é obrigatório (`requestBody: required: true`). Opcionais: `name` (string, até 100 caracteres) e `currency` (`BRL`, `USD` ou `EUR`; sem valor padrão no schema). Fonte: schema `UserUpdateRequest` no Swagger. Enviado no teste: `{ "name": "Thais", "currency": "BRL" }` |
| Status code de sucesso | `200 OK` |
| Body de resposta | `{ "id": "716437f5-3da6-4f37-96e6-6e32ae58f673", "name": "Thais", "email": "qa@teste.com", "currency": "BRL", "created_at": "2026-09-23T15:19:00.886Z", "updated_at": "2026-09-23T15:26:02.366Z" }` |

### 4. DELETE /users/me

| Campo | Resposta |
|---|---|
| Método e endpoint | `DELETE` - `/v1/users/me` |
| Precisa de token? | Sim. O endpoint exibe o ícone de cadeado no Swagger; ao clicar nele, é possível informar o token no formato `Authorization: Bearer <access_token>`. |
| Path parameter / query parameter | Não |
| Body enviado | Nenhum. O Swagger não define `requestBody` para `DELETE /users/me`. |
| Status code de sucesso | `204 No Content` |
| Body de resposta | Nenhum |

## Parte B — Idempotência

### 1. Idempotência por endpoint

| Endpoint | Idempotente? | Por quê (citar campo, status code ou resposta real) |
|---|---|---|
| `POST /v1/auth/register` | Não | A primeira execução retornou `201 Created` e a segunda, com o mesmo e-mail, retornou `409 Conflict`. Observação: o 409 mostra que a API bloqueia duplicidade (e-mail único), então na prática não foi criado um segundo usuário. Essa proteção vem da regra de negócio, não do método. |
| `GET /v1/users/me` | Sim | Executei a consulta várias vezes: todas retornaram `200 OK` com os mesmos dados, e nenhuma alterou o estado do usuário. |
| `PATCH /v1/users/me` | Sim (neste caso) | A primeira chamada alterou o campo `name` e retornou `200 OK`. A segunda, com o mesmo payload, também retornou `200 OK` e o `name` permaneceu igual, então o estado final é o mesmo após 1 ou N chamadas. |
| `DELETE /v1/users/me` | Sim | A primeira chamada retornou `204 No Content` e excluiu o usuário. A segunda retornou `404 Not Found`, mas o estado do servidor não mudou: o usuário continua excluído. A resposta diferente não torna o endpoint não idempotente. |

### 2. Cenário "chamar duas vezes seguidas"

| Campo | Resposta |
|---|---|
| Endpoint escolhido | `POST /v1/auth/register` |
| Pré-condição | API rodando e o e-mail `senha7@teste.com` ainda não cadastrado. |
| 1ª chamada (request + resultado esperado) | Body `{ "name": "Thais QA", "email": "senha7@teste.com", "password": "senha12", "currency": "BRL" }` (senha com 7 caracteres). Esperado: `400 Bad Request` e nenhum usuário criado. |
| 2ª chamada (request + resultado esperado) | Mesmo request, mesmo body. Esperado: a mesma recusa, com o mesmo status e o mesmo body. Não pode retornar `409`, pois isso indicaria que a 1ª chamada criou o usuário mesmo com a senha inválida. |
| Status code esperado na 2ª chamada | `400 Bad Request` |
| Body esperado na 2ª chamada | O mesmo body da 1ª chamada, com estas condições (o texto exato das mensagens não entra na verificação): <br>• `code` presente e igual a `VALIDATION_ERROR`. <br>• `message` presente e não vazio. <br>• `details` é um array com exatamente 1 item, e esse item tem `field` = `password` e `message` não vazio. <br>• Nenhum outro campo aparece em `details` (`name`, `email` e `currency` são válidos). <br>• Não aparecem `access_token`, `refresh_token` nem dados do usuário (`id`). <br>• O valor da senha enviada (`senha12`) não aparece em nenhum lugar do body. |
| Regra / critério de aceite que embasa | FIN-01: "Senha: mínimo de 8 caracteres. Sem exigência de maiúscula, número ou símbolo.", "Erro de validação retorna de uma vez todos os campos inválidos, cada um com sua própria mensagem." e "Senha nunca aparece em resposta de API nem em log." Formato do erro: schema `Error` e resposta `ValidationError` no Swagger (`code` e `message` obrigatórios; `details` como lista de `field` + `message`). | 
