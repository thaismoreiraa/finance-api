# Módulo 04 — Assertions nas requisições da collection

> Evidências das assertions (aba **Post-response**) das requisições da collection `finance-api`.
> Mesmas regras do bloco 3: tokens sempre mascarados (`Bearer eyJhbGciOi...`), nenhuma senha em texto puro.
> Valor esperado de cada assertion vem de uma fonte rastreável: critério de aceite (`stories.md` / `refinement.md`), Swagger, ou decisão da Renata. Nunca do que a API "costuma devolver".

> **Execução:** 2026-10-12, collection inteira rodada pelo Newman (CLI do Postman) com o environment `finance-local`, contra `http://localhost:3000/v1`. Rodada **sem** `--env-var`: a collection usa só o que está nos arquivos exportados, como quem importar vai usar. A senha é a senha inventada do usuário de teste local, no valor inicial da variável `password` (decisão do bloco 3, seção 5).
> **Resultado geral:** 10 requisições, 79 assertions, **73 PASS e 6 FAIL**. Os 6 FAIL estão analisados na seção 4.
>
> **Auth:** todas as requisições de `/auth/register` e `/auth/login` estão com **No Auth**. Quem se cadastra ou faz login ainda não tem token, então essas requisições não podem herdar o Bearer da collection.
>
> **Convenção do nome do teste:** `[#previsão · fonte] Categoria | descrição`. O `#n` é a linha da tabela de previsões (Parte B, tabela 1, do `02-status-jwt.md`). "Suposição" quer dizer que a fonte não fixa o valor; a tabela de previsões explica o motivo.

## 1. Previsão × resultado

> **Regra:** preencha a coluna "Status previsto" **antes** de executar. Depois rode e complete o resto.

| # | Requisição | Status previsto | Fonte da previsão | Status real | Bateu? |
|---|---|---|---|---|---|
| 1 | Register - usuário novo | `201` | Previsão #1: Swagger (`/auth/register` → `201`) + FIN-01 + Renata #1 | `201` | **Status sim, body não.** Faltam `id`, `name` e `email` (seção 4, #1) |
| 2 | Register - e-mail repetido | `409` | Previsão #2: Swagger (`409` "E-mail já cadastrado") + FIN-01 | `409` | Sim |
| 3 | Register - e-mail inválido e sem senha | `400` | Previsão #7: Swagger (`400` `ValidationError`) + FIN-01 | `400` | Sim |
| 4 | Login - sucesso | `200` | Previsão #3: Swagger (`/auth/login` → `200` `LoginResponse`) | `200` | Sim |
| 5 | Login - senha errada | `401` | Previsão #4: Swagger (só documenta `401`) + Renata #3 | `401` | Sim |
| 6 | Login - e-mail inexistente | `401` | Previsão #5: Swagger + Renata #3 (resposta igual à do #4) | `401` | Sim |
| 7 | Get me - com token | `200` | Previsão #6: Swagger (`/users/me` → `200` `UserResponse`) | `200` | Sim |
| 8 | Get me - sem token | `401` | Previsão #8: Swagger (`BearerAuth` + `401`) + aula | `401` | Sim |
| 9 | Create account - saldo inicial 500 | `201` | Previsão #11: Swagger (`/accounts` POST → `201` `AccountResponse`) | `201` | **Status sim, body não.** `balance` veio como string (seção 4, #2) |
| 10 | List accounts | `200` | Previsão #12: Swagger (`/accounts` GET → `200`) + Renata #4 | `200` | **Status sim, body não.** `balance` veio como string (seção 4, #2) |

## 2. Assertions por requisição

> Para cada requisição: cole o script e classifique cada `pm.test` em um dos 4 padrões (**status**, **campo existe**, **valor correto**, **tempo de resposta**).
> Resultado = o que o Postman mostrou na aba **Test Results** (Pass/Fail).
>
> Nos padrões, "ausência" é a forma negativa de **campo existe**, e "tipo" é uma checagem de **valor correto** feita antes da comparação de valor. Não há assertion de tempo de resposta porque nenhuma previsão tem um limite de tempo com fonte.

### 2.1 Register - usuário novo

```js
const body = pm.response.json();

// ==================== STATUS ====================
pm.test("[#1 · Swagger] Status | Deve retornar 201 Created", () => {
  pm.response.to.have.status(201);
});

// ============== CAMPOS OBRIGATÓRIOS ==============
pm.test("[#1 · Swagger LoginResponse] Campos obrigatórios | Deve conter access_token, refresh_token, token_type e expires_in", () => {
  pm.expect(body).to.have.property("access_token");
  pm.expect(body).to.have.property("refresh_token");
  pm.expect(body).to.have.property("token_type");
  pm.expect(body).to.have.property("expires_in");
});

pm.test("[#1 · FIN-01 + Renata #1] Campos obrigatórios | Deve conter id, name e email do usuário criado", () => {
  pm.expect(body).to.have.property("id");
  pm.expect(body).to.have.property("name");
  pm.expect(body).to.have.property("email");
});

pm.test("[#1 · FIN-01] Ausência | Não deve conter senha ou hash", () => {
  const camposSensiveis = Object.keys(body).filter((campo) => /pass|senha|hash/i.test(campo));
  pm.expect(camposSensiveis).to.be.empty;
});

// ================ TIPOS DE DADOS ================
pm.test("[#1 · Swagger LoginResponse] Tipo de dado | access_token, refresh_token e token_type devem ser string", () => {
  pm.expect(body.access_token).to.be.a("string");
  pm.expect(body.refresh_token).to.be.a("string");
  pm.expect(body.token_type).to.be.a("string");
});

pm.test("[#1 · Swagger LoginResponse] Tipo de dado | expires_in deve ser integer", () => {
  pm.expect(Number.isInteger(body.expires_in)).to.be.true;
});

pm.test("[#1 · Swagger UserResponse] Tipo de dado | id, name e email devem ser string", () => {
  pm.expect(body.id).to.be.a("string");
  pm.expect(body.name).to.be.a("string");
  pm.expect(body.email).to.be.a("string");
});

// ============== VALORES ESPERADOS ==============
pm.test("[#1 · Swagger] Valor esperado | access_token e refresh_token não devem ser vazios", () => {
  pm.expect(body.access_token).to.not.be.empty;
  pm.expect(body.refresh_token).to.not.be.empty;
});

pm.test("[#1 · Swagger] Valor esperado | token_type deve ser 'Bearer'", () => {
  pm.expect(body.token_type).to.eql("Bearer");
});

pm.test("[#1 · Swagger + aula] Valor esperado | expires_in deve ser 3600 (1 hora)", () => {
  pm.expect(body.expires_in).to.eql(3600);
});

pm.test("[#1 · FIN-01] Valor esperado | email deve ser o enviado no cadastro", () => {
  pm.expect(body.email).to.eql(pm.collectionVariables.get("email"));
});
```

| Assertion (nome do `pm.test`) | Padrão | Resultado |
|---|---|---|
| `[#1 · Swagger] Status \| Deve retornar 201 Created` | status | PASS |
| `[#1 · Swagger LoginResponse] Campos obrigatórios \| Deve conter access_token, refresh_token, token_type e expires_in` | campo existe | PASS |
| `[#1 · FIN-01 + Renata #1] Campos obrigatórios \| Deve conter id, name e email do usuário criado` | campo existe | **FAIL**: expected { …(4) } to have property 'id' |
| `[#1 · FIN-01] Ausência \| Não deve conter senha ou hash` | campo existe (ausência) | PASS |
| `[#1 · Swagger LoginResponse] Tipo de dado \| access_token, refresh_token e token_type devem ser string` | valor correto (tipo) | PASS |
| `[#1 · Swagger LoginResponse] Tipo de dado \| expires_in deve ser integer` | valor correto (tipo) | PASS |
| `[#1 · Swagger UserResponse] Tipo de dado \| id, name e email devem ser string` | valor correto (tipo) | **FAIL**: expected undefined to be a string |
| `[#1 · Swagger] Valor esperado \| access_token e refresh_token não devem ser vazios` | valor correto | PASS |
| `[#1 · Swagger] Valor esperado \| token_type deve ser 'Bearer'` | valor correto | PASS |
| `[#1 · Swagger + aula] Valor esperado \| expires_in deve ser 3600 (1 hora)` | valor correto | PASS |
| `[#1 · FIN-01] Valor esperado \| email deve ser o enviado no cadastro` | valor correto | **FAIL**: expected undefined to deeply equal 'qa1791810435658@teste.com' |

### 2.2 Register - e-mail repetido

```js
const body = pm.response.json();

// ==================== STATUS ====================
pm.test("[#2 · Swagger] Status | Deve retornar 409 Conflict", () => {
  pm.response.to.have.status(409);
});

// ============== CAMPOS OBRIGATÓRIOS ==============
pm.test("[#2 · Swagger Error] Campos obrigatórios | Deve conter code e message", () => {
  pm.expect(body).to.have.property("code");
  pm.expect(body).to.have.property("message");
});

pm.test("[#2] Ausência | Não deve retornar tokens nem dados do usuário", () => {
  pm.expect(body).to.not.have.property("access_token");
  pm.expect(body).to.not.have.property("refresh_token");
  pm.expect(body).to.not.have.property("id");
  pm.expect(body).to.not.have.property("name");
  pm.expect(body).to.not.have.property("email");
});

// ================ TIPOS DE DADOS ================
pm.test("[#2 · Swagger Error] Tipo de dado | code e message devem ser string", () => {
  pm.expect(body.code).to.be.a("string");
  pm.expect(body.message).to.be.a("string");
});

// ============== VALORES ESPERADOS ==============
pm.test("[#2 · suposição] Valor esperado | code deve ser 'CONFLICT'", () => {
  pm.expect(body.code).to.eql("CONFLICT");
});

pm.test("[#2 · FIN-01 + Swagger] Valor esperado | message deve deixar claro que o e-mail já está em uso", () => {
  pm.expect(body.message).to.not.be.empty;
  pm.expect(body.message).to.match(/e-?mail/i);
});
```

| Assertion (nome do `pm.test`) | Padrão | Resultado |
|---|---|---|
| `[#2 · Swagger] Status \| Deve retornar 409 Conflict` | status | PASS |
| `[#2 · Swagger Error] Campos obrigatórios \| Deve conter code e message` | campo existe | PASS |
| `[#2] Ausência \| Não deve retornar tokens nem dados do usuário` | campo existe (ausência) | PASS |
| `[#2 · Swagger Error] Tipo de dado \| code e message devem ser string` | valor correto (tipo) | PASS |
| `[#2 · suposição] Valor esperado \| code deve ser 'CONFLICT'` | valor correto | PASS |
| `[#2 · FIN-01 + Swagger] Valor esperado \| message deve deixar claro que o e-mail já está em uso` | valor correto | PASS |

### 2.3 Register - e-mail inválido e sem senha

```js
const body = pm.response.json();

// ==================== STATUS ====================
pm.test("[#7 · Swagger] Status | Deve retornar 400 Bad Request", () => {
  pm.response.to.have.status(400);
});

// ============== CAMPOS OBRIGATÓRIOS ==============
pm.test("[#7 · Swagger ValidationError] Campos obrigatórios | Deve conter code, message e details", () => {
  pm.expect(body).to.have.property("code");
  pm.expect(body).to.have.property("message");
  pm.expect(body).to.have.property("details");
});

pm.test("[#7] Ausência | Não deve retornar tokens", () => {
  pm.expect(body).to.not.have.property("access_token");
  pm.expect(body).to.not.have.property("refresh_token");
});

// ================ TIPOS DE DADOS ================
pm.test("[#7 · Swagger Error] Tipo de dado | code e message devem ser string", () => {
  pm.expect(body.code).to.be.a("string");
  pm.expect(body.message).to.be.a("string");
});

pm.test("[#7 · Swagger Error] Tipo de dado | details deve ser array", () => {
  pm.expect(body.details).to.be.an("array");
});

pm.test("[#7 · Swagger Error] Tipo de dado | field e message de cada item devem ser string", () => {
  body.details.forEach((detail) => {
    pm.expect(detail.field).to.be.a("string");
    pm.expect(detail.message).to.be.a("string");
  });
});

// ============== VALORES ESPERADOS ==============
pm.test("[#7 · suposição] Valor esperado | code deve ser 'VALIDATION_ERROR'", () => {
  pm.expect(body.code).to.eql("VALIDATION_ERROR");
});

pm.test("[#7] Valor esperado | message não deve ser vazia", () => {
  pm.expect(body.message).to.not.be.empty;
});

pm.test("[#7 · FIN-01] Valor esperado | details deve ter 2 itens, um para email e um para password", () => {
  pm.expect(body.details).to.have.lengthOf(2);
  const campos = body.details.map((detail) => detail.field).sort();
  pm.expect(campos).to.eql(["email", "password"]);
});

pm.test("[#7 · FIN-01] Valor esperado | cada item deve ter a sua própria mensagem", () => {
  body.details.forEach((detail) => {
    pm.expect(detail.message).to.not.be.empty;
  });
});
```

| Assertion (nome do `pm.test`) | Padrão | Resultado |
|---|---|---|
| `[#7 · Swagger] Status \| Deve retornar 400 Bad Request` | status | PASS |
| `[#7 · Swagger ValidationError] Campos obrigatórios \| Deve conter code, message e details` | campo existe | PASS |
| `[#7] Ausência \| Não deve retornar tokens` | campo existe (ausência) | PASS |
| `[#7 · Swagger Error] Tipo de dado \| code e message devem ser string` | valor correto (tipo) | PASS |
| `[#7 · Swagger Error] Tipo de dado \| details deve ser array` | valor correto (tipo) | PASS |
| `[#7 · Swagger Error] Tipo de dado \| field e message de cada item devem ser string` | valor correto (tipo) | PASS |
| `[#7 · suposição] Valor esperado \| code deve ser 'VALIDATION_ERROR'` | valor correto | PASS |
| `[#7] Valor esperado \| message não deve ser vazia` | valor correto | PASS |
| `[#7 · FIN-01] Valor esperado \| details deve ter 2 itens, um para email e um para password` | valor correto | PASS |
| `[#7 · FIN-01] Valor esperado \| cada item deve ter a sua própria mensagem` | valor correto | PASS |

### 2.4 Login - sucesso

```js
const body = pm.response.json();

// ==================== STATUS ====================
pm.test("[#3 · Swagger] Status | Deve retornar 200 OK", () => {
  pm.response.to.have.status(200);
});

// ============== CAMPOS OBRIGATÓRIOS ==============
pm.test("[#3 · Swagger LoginResponse] Campos obrigatórios | Deve conter access_token, refresh_token, token_type e expires_in", () => {
  pm.expect(body).to.have.property("access_token");
  pm.expect(body).to.have.property("refresh_token");
  pm.expect(body).to.have.property("token_type");
  pm.expect(body).to.have.property("expires_in");
});

pm.test("[#3 · FIN-01] Ausência | Não deve conter senha ou hash", () => {
  const camposSensiveis = Object.keys(body).filter((campo) => /pass|senha|hash/i.test(campo));
  pm.expect(camposSensiveis).to.be.empty;
});

// ================ TIPOS DE DADOS ================
pm.test("[#3 · Swagger LoginResponse] Tipo de dado | access_token, refresh_token e token_type devem ser string", () => {
  pm.expect(body.access_token).to.be.a("string");
  pm.expect(body.refresh_token).to.be.a("string");
  pm.expect(body.token_type).to.be.a("string");
});

pm.test("[#3 · Swagger LoginResponse] Tipo de dado | expires_in deve ser integer", () => {
  pm.expect(Number.isInteger(body.expires_in)).to.be.true;
});

// ============== VALORES ESPERADOS ==============
pm.test("[#3 · Swagger] Valor esperado | access_token e refresh_token não devem ser vazios", () => {
  pm.expect(body.access_token).to.not.be.empty;
  pm.expect(body.refresh_token).to.not.be.empty;
});

pm.test("[#3 · Swagger] Valor esperado | token_type deve ser 'Bearer'", () => {
  pm.expect(body.token_type).to.eql("Bearer");
});

pm.test("[#3 · Swagger + aula] Valor esperado | expires_in deve ser 3600 (1 hora)", () => {
  pm.expect(body.expires_in).to.eql(3600);
});

// ============ VARIÁVEIS DE AMBIENTE ============
if (pm.response.code === 200 && body.access_token && body.refresh_token) {
  pm.environment.set("token", body.access_token);
  pm.environment.set("refresh_token", body.refresh_token);
} else {
  pm.environment.unset("token");
  pm.environment.unset("refresh_token");
}
```

> **Mudança em relação ao bloco 3:** lá, quando o login falhava, o token anterior era preservado. Aqui ele é apagado de propósito. Num Runner/Newman, um token antigo faria o "Get me - com token" passar verde mesmo com o login quebrado, escondendo a falha. Apagando, o "Get me" falha junto e aponta o login como causa.

| Assertion (nome do `pm.test`) | Padrão | Resultado |
|---|---|---|
| `[#3 · Swagger] Status \| Deve retornar 200 OK` | status | PASS |
| `[#3 · Swagger LoginResponse] Campos obrigatórios \| Deve conter access_token, refresh_token, token_type e expires_in` | campo existe | PASS |
| `[#3 · FIN-01] Ausência \| Não deve conter senha ou hash` | campo existe (ausência) | PASS |
| `[#3 · Swagger LoginResponse] Tipo de dado \| access_token, refresh_token e token_type devem ser string` | valor correto (tipo) | PASS |
| `[#3 · Swagger LoginResponse] Tipo de dado \| expires_in deve ser integer` | valor correto (tipo) | PASS |
| `[#3 · Swagger] Valor esperado \| access_token e refresh_token não devem ser vazios` | valor correto | PASS |
| `[#3 · Swagger] Valor esperado \| token_type deve ser 'Bearer'` | valor correto | PASS |
| `[#3 · Swagger + aula] Valor esperado \| expires_in deve ser 3600 (1 hora)` | valor correto | PASS |

### 2.5 Login - senha errada

```js
const body = pm.response.json();

// ==================== STATUS ====================
pm.test("[#4 · Swagger] Status | Deve retornar 401 Unauthorized", () => {
  pm.response.to.have.status(401);
});

// ============== CAMPOS OBRIGATÓRIOS ==============
pm.test("[#4 · Swagger Error] Campos obrigatórios | Deve conter code e message", () => {
  pm.expect(body).to.have.property("code");
  pm.expect(body).to.have.property("message");
});

pm.test("[#4] Ausência | Não deve retornar tokens", () => {
  pm.expect(body).to.not.have.property("access_token");
  pm.expect(body).to.not.have.property("refresh_token");
});

// ================ TIPOS DE DADOS ================
pm.test("[#4 · Swagger Error] Tipo de dado | code e message devem ser string", () => {
  pm.expect(body.code).to.be.a("string");
  pm.expect(body.message).to.be.a("string");
});

// ============== VALORES ESPERADOS ==============
pm.test("[#4 · suposição, exemplo do Swagger] Valor esperado | code deve ser 'UNAUTHORIZED'", () => {
  pm.expect(body.code).to.eql("UNAUTHORIZED");
});

pm.test("[#4 · Renata #3] Valor esperado | message não deve dizer qual campo estava errado", () => {
  pm.expect(body.message).to.not.be.empty;
  pm.expect(body.message).to.not.match(/senha|e-?mail|password/i);
});

// ====== GUARDA PARA COMPARAR COM O CENÁRIO #5 ======
pm.collectionVariables.set("login_error_status", pm.response.code);
pm.collectionVariables.set("login_error_code", body.code);
pm.collectionVariables.set("login_error_message", body.message);
```

| Assertion (nome do `pm.test`) | Padrão | Resultado |
|---|---|---|
| `[#4 · Swagger] Status \| Deve retornar 401 Unauthorized` | status | PASS |
| `[#4 · Swagger Error] Campos obrigatórios \| Deve conter code e message` | campo existe | PASS |
| `[#4] Ausência \| Não deve retornar tokens` | campo existe (ausência) | PASS |
| `[#4 · Swagger Error] Tipo de dado \| code e message devem ser string` | valor correto (tipo) | PASS |
| `[#4 · suposição, exemplo do Swagger] Valor esperado \| code deve ser 'UNAUTHORIZED'` | valor correto | PASS |
| `[#4 · Renata #3] Valor esperado \| message não deve dizer qual campo estava errado` | valor correto | PASS |

### 2.6 Login - e-mail inexistente

```js
const body = pm.response.json();

// ==================== STATUS ====================
pm.test("[#5 · Swagger] Status | Deve retornar 401 Unauthorized", () => {
  pm.response.to.have.status(401);
});

// ============== CAMPOS OBRIGATÓRIOS ==============
pm.test("[#5 · Swagger Error] Campos obrigatórios | Deve conter code e message", () => {
  pm.expect(body).to.have.property("code");
  pm.expect(body).to.have.property("message");
});

pm.test("[#5] Ausência | Não deve retornar tokens", () => {
  pm.expect(body).to.not.have.property("access_token");
  pm.expect(body).to.not.have.property("refresh_token");
});

// ================ TIPOS DE DADOS ================
pm.test("[#5 · Swagger Error] Tipo de dado | code e message devem ser string", () => {
  pm.expect(body.code).to.be.a("string");
  pm.expect(body.message).to.be.a("string");
});

// ============== VALORES ESPERADOS ==============
pm.test("[#5 · Renata #3] Valor esperado | status deve ser igual ao do login com senha errada", () => {
  pm.expect(pm.response.code).to.eql(Number(pm.collectionVariables.get("login_error_status")));
});

pm.test("[#5 · Renata #3] Valor esperado | code deve ser igual ao do login com senha errada", () => {
  pm.expect(body.code).to.eql(pm.collectionVariables.get("login_error_code"));
});

pm.test("[#5 · Renata #3] Valor esperado | message deve ser igual à do login com senha errada", () => {
  pm.expect(body.message).to.eql(pm.collectionVariables.get("login_error_message"));
});
```

| Assertion (nome do `pm.test`) | Padrão | Resultado |
|---|---|---|
| `[#5 · Swagger] Status \| Deve retornar 401 Unauthorized` | status | PASS |
| `[#5 · Swagger Error] Campos obrigatórios \| Deve conter code e message` | campo existe | PASS |
| `[#5] Ausência \| Não deve retornar tokens` | campo existe (ausência) | PASS |
| `[#5 · Swagger Error] Tipo de dado \| code e message devem ser string` | valor correto (tipo) | PASS |
| `[#5 · Renata #3] Valor esperado \| status deve ser igual ao do login com senha errada` | valor correto | PASS |
| `[#5 · Renata #3] Valor esperado \| code deve ser igual ao do login com senha errada` | valor correto | PASS |
| `[#5 · Renata #3] Valor esperado \| message deve ser igual à do login com senha errada` | valor correto | PASS |

### 2.7 Get me - com token

```js
const body = pm.response.json();

// ==================== STATUS ====================
pm.test("[#6 · Swagger] Status | Deve retornar 200 OK", () => {
  pm.response.to.have.status(200);
});

// ============== CAMPOS OBRIGATÓRIOS ==============
pm.test("[#6 · Swagger UserResponse] Campos obrigatórios | Deve conter id, name, email, currency e created_at", () => {
  pm.expect(body).to.have.property("id");
  pm.expect(body).to.have.property("name");
  pm.expect(body).to.have.property("email");
  pm.expect(body).to.have.property("currency");
  pm.expect(body).to.have.property("created_at");
});

pm.test("[#6 · FIN-01] Ausência | Não deve conter senha ou hash", () => {
  const camposSensiveis = Object.keys(body).filter((campo) => /pass|senha|hash/i.test(campo));
  pm.expect(camposSensiveis).to.be.empty;
});

// ================ TIPOS DE DADOS ================
pm.test("[#6 · Swagger UserResponse] Tipo de dado | id, name, email, currency e created_at devem ser string", () => {
  pm.expect(body.id).to.be.a("string");
  pm.expect(body.name).to.be.a("string");
  pm.expect(body.email).to.be.a("string");
  pm.expect(body.currency).to.be.a("string");
  pm.expect(body.created_at).to.be.a("string");
});

// ============== VALORES ESPERADOS ==============
pm.test("[#6 · Parte A] Valor esperado | id deve ser igual ao sub do token", () => {
  const token = pm.environment.get("token");
  let payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  payload += "=".repeat((4 - (payload.length % 4)) % 4);
  const sub = JSON.parse(atob(payload)).sub;
  pm.expect(body.id).to.eql(sub);
});
```

| Assertion (nome do `pm.test`) | Padrão | Resultado |
|---|---|---|
| `[#6 · Swagger] Status \| Deve retornar 200 OK` | status | PASS |
| `[#6 · Swagger UserResponse] Campos obrigatórios \| Deve conter id, name, email, currency e created_at` | campo existe | PASS |
| `[#6 · FIN-01] Ausência \| Não deve conter senha ou hash` | campo existe (ausência) | PASS |
| `[#6 · Swagger UserResponse] Tipo de dado \| id, name, email, currency e created_at devem ser string` | valor correto (tipo) | PASS |
| `[#6 · Parte A] Valor esperado \| id deve ser igual ao sub do token` | valor correto | PASS |

### 2.8 Get me - sem token

```js
const body = pm.response.json();

// ==================== STATUS ====================
pm.test("[#8 · Swagger + aula] Status | Deve retornar 401 Unauthorized", () => {
  pm.response.to.have.status(401);
});

// ============== CAMPOS OBRIGATÓRIOS ==============
pm.test("[#8 · Swagger Error] Campos obrigatórios | Deve conter code e message", () => {
  pm.expect(body).to.have.property("code");
  pm.expect(body).to.have.property("message");
});

pm.test("[#8] Ausência | Não deve retornar dados do usuário", () => {
  pm.expect(body).to.not.have.property("id");
  pm.expect(body).to.not.have.property("name");
  pm.expect(body).to.not.have.property("email");
  pm.expect(body).to.not.have.property("currency");
  pm.expect(body).to.not.have.property("created_at");
});

// ================ TIPOS DE DADOS ================
pm.test("[#8 · Swagger Error] Tipo de dado | code e message devem ser string", () => {
  pm.expect(body.code).to.be.a("string");
  pm.expect(body.message).to.be.a("string");
});

// ============== VALORES ESPERADOS ==============
pm.test("[#8 · suposição, exemplo do Swagger] Valor esperado | code deve ser 'UNAUTHORIZED'", () => {
  pm.expect(body.code).to.eql("UNAUTHORIZED");
});

pm.test("[#8] Valor esperado | message não deve ser vazia", () => {
  pm.expect(body.message).to.not.be.empty;
});
```

| Assertion (nome do `pm.test`) | Padrão | Resultado |
|---|---|---|
| `[#8 · Swagger + aula] Status \| Deve retornar 401 Unauthorized` | status | PASS |
| `[#8 · Swagger Error] Campos obrigatórios \| Deve conter code e message` | campo existe | PASS |
| `[#8] Ausência \| Não deve retornar dados do usuário` | campo existe (ausência) | PASS |
| `[#8 · Swagger Error] Tipo de dado \| code e message devem ser string` | valor correto (tipo) | PASS |
| `[#8 · suposição, exemplo do Swagger] Valor esperado \| code deve ser 'UNAUTHORIZED'` | valor correto | PASS |
| `[#8] Valor esperado \| message não deve ser vazia` | valor correto | PASS |

### 2.9 Create account - saldo inicial 500

```js
const body = pm.response.json();
const requestBody = JSON.parse(pm.variables.replaceIn(pm.request.body.raw));
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ==================== STATUS ====================
pm.test("[#11 · Swagger] Status | Deve retornar 201 Created", () => {
  pm.response.to.have.status(201);
});

// ============== CAMPOS OBRIGATÓRIOS ==============
pm.test("[#11 · Swagger AccountResponse] Campos obrigatórios | Deve conter todos os campos do contrato", () => {
  ["id", "name", "type", "balance", "currency", "color", "icon", "allow_negative", "is_active", "created_at"]
    .forEach((campo) => pm.expect(body, campo).to.have.property(campo));
});

// ================ TIPOS DE DADOS ================
pm.test("[#11 · Swagger AccountResponse] Tipo de dado | id, name, type, currency, color, icon e created_at devem ser string", () => {
  pm.expect(body.id).to.be.a("string");
  pm.expect(body.name).to.be.a("string");
  pm.expect(body.type).to.be.a("string");
  pm.expect(body.currency).to.be.a("string");
  pm.expect(body.color).to.be.a("string");
  pm.expect(body.icon).to.be.a("string");
  pm.expect(body.created_at).to.be.a("string");
});

pm.test("[#11 · Swagger Money] Tipo de dado | balance deve ser number", () => {
  pm.expect(body.balance).to.be.a("number");
});

pm.test("[#11 · Swagger AccountResponse] Tipo de dado | allow_negative e is_active devem ser boolean", () => {
  pm.expect(body.allow_negative).to.be.a("boolean");
  pm.expect(body.is_active).to.be.a("boolean");
});

// ============== VALORES ESPERADOS ==============
pm.test("[#11 · Swagger UUID] Valor esperado | id deve ser um UUID", () => {
  pm.expect(body.id).to.match(uuidRegex);
});

pm.test("[#11 · Swagger] Valor esperado | name, type, currency, color e icon iguais aos enviados", () => {
  pm.expect(body.name).to.eql(requestBody.name);
  pm.expect(body.type).to.eql(requestBody.type);
  pm.expect(body.currency).to.eql(requestBody.currency);
  pm.expect(body.color).to.eql(requestBody.color);
  pm.expect(body.icon).to.eql(requestBody.icon);
});

pm.test("[#11 · suposição] Valor esperado | balance deve ser igual ao initial_balance (500)", () => {
  pm.expect(body.balance).to.eql(requestBody.initial_balance);
});

pm.test("[#11 · Swagger] Valor esperado | allow_negative igual ao enviado", () => {
  pm.expect(body.allow_negative).to.eql(requestBody.allow_negative);
});

pm.test("[#11 · suposição] Valor esperado | is_active deve ser true", () => {
  pm.expect(body.is_active).to.eql(true);
});

pm.test("[#11] Valor esperado | created_at deve estar preenchido", () => {
  pm.expect(body.created_at).to.not.be.empty;
});

// ============ VARIÁVEIS DA COLLECTION ============
if (pm.response.code === 201 && body.id) {
  pm.collectionVariables.set("account_id", body.id);
}
```

> `account_id` é dado gerado em execução, então fica na **collection** (tabela do bloco 3), igual ao `email`. Valor inicial vazio.

| Assertion (nome do `pm.test`) | Padrão | Resultado |
|---|---|---|
| `[#11 · Swagger] Status \| Deve retornar 201 Created` | status | PASS |
| `[#11 · Swagger AccountResponse] Campos obrigatórios \| Deve conter todos os campos do contrato` | campo existe | PASS |
| `[#11 · Swagger AccountResponse] Tipo de dado \| id, name, type, currency, color, icon e created_at devem ser string` | valor correto (tipo) | PASS |
| `[#11 · Swagger Money] Tipo de dado \| balance deve ser number` | valor correto (tipo) | **FAIL**: expected '500.00' to be a number |
| `[#11 · Swagger AccountResponse] Tipo de dado \| allow_negative e is_active devem ser boolean` | valor correto (tipo) | PASS |
| `[#11 · Swagger UUID] Valor esperado \| id deve ser um UUID` | valor correto | PASS |
| `[#11 · Swagger] Valor esperado \| name, type, currency, color e icon iguais aos enviados` | valor correto | PASS |
| `[#11 · suposição] Valor esperado \| balance deve ser igual ao initial_balance (500)` | valor correto | **FAIL**: expected '500.00' to deeply equal 500 |
| `[#11 · Swagger] Valor esperado \| allow_negative igual ao enviado` | valor correto | PASS |
| `[#11 · suposição] Valor esperado \| is_active deve ser true` | valor correto | PASS |
| `[#11] Valor esperado \| created_at deve estar preenchido` | valor correto | PASS |

### 2.10 List accounts

```js
const body = pm.response.json();
const accounts = body.data;

// ==================== STATUS ====================
pm.test("[#12 · Swagger] Status | Deve retornar 200 OK", () => {
  pm.response.to.have.status(200);
});

// ============== CAMPOS OBRIGATÓRIOS ==============
pm.test("[#12 · Swagger] Campos obrigatórios | Resposta deve conter data e total_balance", () => {
  pm.expect(body).to.have.property("data");
  pm.expect(body).to.have.property("total_balance");
});

pm.test("[#12 · Swagger AccountResponse] Campos obrigatórios | Cada conta deve conter todos os campos do contrato", () => {
  accounts.forEach((account, i) => {
    ["id", "name", "type", "balance", "currency", "color", "icon", "allow_negative", "is_active", "created_at"]
      .forEach((campo) => pm.expect(account, `conta[${i}].${campo}`).to.have.property(campo));
  });
});

// ================ TIPOS DE DADOS ================
pm.test("[#12 · Swagger] Tipo de dado | data deve ser array", () => {
  pm.expect(accounts).to.be.an("array");
});

pm.test("[#12 · Swagger Money] Tipo de dado | total_balance deve ser number", () => {
  pm.expect(body.total_balance).to.be.a("number");
});

pm.test("[#12 · Swagger AccountResponse] Tipo de dado | campos de cada conta devem ser do tipo correto", () => {
  accounts.forEach((account, i) => {
    pm.expect(account.id, `conta[${i}].id`).to.be.a("string");
    pm.expect(account.name, `conta[${i}].name`).to.be.a("string");
    pm.expect(account.type, `conta[${i}].type`).to.be.a("string");
    pm.expect(account.balance, `conta[${i}].balance`).to.be.a("number");
    pm.expect(account.currency, `conta[${i}].currency`).to.be.a("string");
    pm.expect(account.color, `conta[${i}].color`).to.be.a("string");
    pm.expect(account.icon, `conta[${i}].icon`).to.be.a("string");
    pm.expect(account.allow_negative, `conta[${i}].allow_negative`).to.be.a("boolean");
    pm.expect(account.is_active, `conta[${i}].is_active`).to.be.a("boolean");
    pm.expect(account.created_at, `conta[${i}].created_at`).to.be.a("string");
  });
});

// ============== VALORES ESPERADOS ==============
pm.test("[#12] Valor esperado | lista deve incluir a conta criada no #11", () => {
  const ids = accounts.map((account) => account.id);
  pm.expect(ids).to.include(pm.collectionVariables.get("account_id"));
});

pm.test("[#12 · Renata #4] Valor esperado | conta desativada não deve aparecer na lista", () => {
  accounts.forEach((account, i) => {
    pm.expect(account.is_active, `conta[${i}]`).to.eql(true);
  });
});

pm.test("[#12 · Renata #4] Valor esperado | total_balance deve ser a soma dos balance de data (negativos subtraem)", () => {
  const somaEmCentavos = accounts.reduce(
    (soma, conta) => soma + Math.round(Number(conta.balance) * 100),
    0
  );
  pm.expect(Math.round(body.total_balance * 100)).to.eql(somaEmCentavos);
});
```

| Assertion (nome do `pm.test`) | Padrão | Resultado |
|---|---|---|
| `[#12 · Swagger] Status \| Deve retornar 200 OK` | status | PASS |
| `[#12 · Swagger] Campos obrigatórios \| Resposta deve conter data e total_balance` | campo existe | PASS |
| `[#12 · Swagger AccountResponse] Campos obrigatórios \| Cada conta deve conter todos os campos do contrato` | campo existe | PASS |
| `[#12 · Swagger] Tipo de dado \| data deve ser array` | valor correto (tipo) | PASS |
| `[#12 · Swagger Money] Tipo de dado \| total_balance deve ser number` | valor correto (tipo) | PASS |
| `[#12 · Swagger AccountResponse] Tipo de dado \| campos de cada conta devem ser do tipo correto` | valor correto (tipo) | **FAIL**: conta[0].balance: expected '500.00' to be a number |
| `[#12] Valor esperado \| lista deve incluir a conta criada no #11` | valor correto | PASS |
| `[#12 · Renata #4] Valor esperado \| conta desativada não deve aparecer na lista` | valor correto | PASS |
| `[#12 · Renata #4] Valor esperado \| total_balance deve ser a soma dos balance de data (negativos subtraem)` | valor correto | PASS |

## 3. Prova de que as assertions conseguem falhar

> Assertion que nunca fica vermelha não prova nada. O enunciado pede 2 assertions, **sendo uma delas de ausência**: quebre o valor esperado (ou a requisição) de propósito e mostre que o Postman acusou Fail. Depois desfaça.

> As alterações foram feitas numa **cópia** da collection, fora desta pasta, e a cópia foi rodada pelo Newman. O `finance-api.postman_collection.json` daqui nunca foi alterado. Os outros 6 FAIL dessa execução são os mesmos da execução normal (seção 4).

| Requisição | Assertion | O que foi alterado | Resultado com a alteração | Mensagem de falha do Postman | Desfeito? |
|---|---|---|---|---|---|
| Register - e-mail repetido | `[#2 · Swagger] Status \| Deve retornar 409 Conflict` | `to.have.status(409)` → `to.have.status(201)` | FAIL | `expected response to have status code 201 but got 409` | [x] |
| Register - e-mail inválido e sem senha | `[#7 · FIN-01] Valor esperado \| details deve ter 2 itens, um para email e um para password` | `to.have.lengthOf(2)` → `to.have.lengthOf(1)` | FAIL | `expected [ { field: 'email', …(1) }, …(1) ] to have a length of 1 but got 2` | [x] |
| List accounts | `[#12 · Renata #4] Valor esperado \| total_balance deve ser a soma dos balance de data (negativos subtraem)` | Esperado mudado para `somaEmCentavos + 1` (1 centavo a mais) | FAIL | `expected 50000 to deeply equal 50001` | [x] |
| Login - sucesso | `[#3 · FIN-01] Ausência \| Não deve conter senha ou hash` | Regex `/pass\|senha\|hash/i` → `/token/i` (casa com campos que existem na resposta) | FAIL | `expected [ 'access_token', …(2) ] to be empty` | [x] |

O 3º caso mostra que a comparação em centavos pega diferença de 1 centavo.

O 4º caso é o de **ausência**. Assertion de ausência é a que mais facilmente passa sempre: se o nome procurado estiver escrito errado, ele "nunca aparece" e o teste fica verde para sempre. Trocando o regex por um que casa com campos reais (`access_token`, `refresh_token`, `token_type`), o filtro deixa de vir vazio e o teste fica vermelho. Ou seja, o `Object.keys(...).filter(...)` realmente lê as chaves da resposta.

## 4. Divergências e achados

> Toda linha "Não" da seção 1 e todo Fail que não foi provocado de propósito vem para cá. Para cada um: você entendeu errado ou é bug?

| # | Requisição | Esperado (fonte) | Obtido | Conclusão (entendimento errado / possível bug) | Próximo passo |
|---|---|---|---|---|---|
| 1 | Register - usuário novo (3 FAIL: presença, tipo e valor de `id`/`name`/`email`) | Body com os tokens **e** `id`, `name` e `email` do usuário criado (previsão #1: critério da FIN-01, confirmado pela Renata na dúvida #1 do `02-status-jwt.md`) | Só `access_token`, `refresh_token`, `token_type` e `expires_in` | **Possível bug.** É o achado #1, já identificado no bloco 2 e confirmado no bloco 3. A previsão está certa: a fonte é o critério de aceite, que a PO confirmou que prevalece sobre o Swagger. Os 3 FAIL são o mesmo defeito; os 2 últimos falham por consequência do 1º. | Manter as assertions vermelhas. Bug report do achado #1 (depois do Módulo 08). |
| 2 | Create account e List accounts (3 FAIL: tipo de `balance` no #11 e no #12, valor de `balance` no #11) | `balance` do tipo `number`, igual a `500` (previsão #11: Swagger define `balance` como `Money`, `type: number`) | `balance` = `"500.00"` (string) nas duas respostas | **Possível bug: o comportamento diverge do contrato.** Não é entendimento errado: o Swagger diz `number` e não existe outra fonte dizendo string. A própria API se contradiz: no mesmo `GET /accounts`, `total_balance` vem como `number` (`500`) e cada `balance` vem como string, mas os dois usam o mesmo schema `Money`. O FAIL de valor (`'500.00'` × `500`) é consequência do tipo; o número em si está certo. | Perguntar ao Marcelo/Renata qual é o contrato: se `balance` como string é intencional (precisão decimal), o Swagger precisa ser corrigido e a previsão é atualizada citando essa resposta. Até lá, manter as assertions e registrar como achado #2. |

**Observações sem FAIL** (não viraram assertion porque não estão em nenhuma previsão; registradas para não se perderem):

| # | Onde | Observação | Próximo passo |
|---|---|---|---|
| a | `POST /accounts` e `GET /accounts` | A resposta traz `user_id` e `deleted_at`, que não existem no `AccountResponse` do Swagger. | Swagger desatualizado. Juntar com a pergunta do achado #2. |
| b | `GET /users/me` | A resposta traz `updated_at` (`null`), que não existe no `UserResponse` do Swagger. | Mesma pergunta do item (a). |
| c | Register inválido | As mensagens de `details` vêm em inglês ("Invalid email address", "Invalid input: expected string, received undefined"), enquanto `message` vem em português. O critério só exige "cada um com sua própria mensagem", e isso passou. | Dúvida para a PO: as mensagens por campo precisam estar em português? |
| d | List accounts | O usuário da execução tinha **1 conta só**, então o `total_balance` foi validado sem saldo negativo e sem conta desativada. A regra da Renata (#4) só foi exercitada em parte. | Cenário para os casos de teste: usuário com conta negativa (`allow_negative = true`) e conta desativada. |
| e | Get me - com token | O Newman avisou que `atob` está obsoleto no sandbox (o teste passou). | Trocar por `require('atob')` ou `Buffer.from(payload, 'base64')` na próxima revisão. |

## 5. Revisão de assertion gerada por IA

> Se usou IA para escrever alguma assertion, registre aqui o que precisou corrigir antes de colar. Se não usou, escreva "Não usei" e pule.

Não usei

## 6. Checklist de entrega

- [x] Todas as requisições da collection têm pelo menos uma assertion
- [x] Toda requisição tem assertion de **status**; as de sucesso também verificam **campo** e/ou **valor** do body
- [x] Valores monetários comparados no tipo certo (ex.: `balance` como string `"500.00"` × número `500`). **Tipo certo = o do Swagger (`Money`, `number`).** A API devolve string, então a assertion fica vermelha de propósito: é o achado #2 (seção 4). A assertion não foi trocada para string para passar.
- [x] Seção 3 preenchida, **com uma mutação de ausência**, e todas as alterações desfeitas (feitas numa cópia; o arquivo original não foi alterado)
- [x] Nenhuma assertion sobre o texto exato de `message` (só não vazia, ou regra da PO como a do #4)
- [x] Collection reexportada (v2.1) nesta pasta, com as assertions
- [x] `git diff` do JSON contra a versão aceita do bloco 3, sem regressão: `password` com valor inicial e **No Auth** em todo `/auth/register` e `/auth/login`
- [x] Collection roda **sem** `--env-var` (só com os arquivos desta pasta)
- [x] `grep -c "eyJ"` nos `.json` desta pasta retorna `0`
