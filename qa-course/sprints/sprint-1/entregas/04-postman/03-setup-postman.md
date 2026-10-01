# Módulo 04 — Setup do Postman (collection, environment e scripts)

> Evidências do setup da collection `finance-api` e do environment `finance-local`.
> Nenhum token aparece em texto puro neste arquivo: tokens sempre mascarados (`Bearer eyJhbGciOi...`). Nenhuma senha aparece aqui. A senha inventada do usuário de teste local vai no export da collection, de propósito (ver seção 5).

## 1. Herança de autenticação: "Get me - com token"

> Copie do **Postman Console** a linha do header `Authorization` que saiu na requisição, mascarada.

**Header `Authorization` enviado:**

```
Authorization: Bearer eyJhbGciOi...
```

| Campo | Resposta |
|---|---|
| Onde a auth está configurada (collection / pasta / requisição) | Collection |
| Tipo de auth na requisição "Get me - com token" | Inherit auth from parent (herda o Bearer Token da collection) |
| Status retornado | `200 OK` |
| Por que isso prova que a herança funcionou | A requisição não tem token próprio, porque está em *Inherit auth from parent*. O token só está configurado na collection. Mesmo assim a API respondeu `200` em vez de `401`, então o header `Authorization: Bearer <token>` foi enviado. A única origem possível desse header é a collection, o que mostra que a requisição herdou a auth do nível de cima. |

## 2. Requisição sem token: "Get me - sem token"

> Mostre que **não** saiu header `Authorization` e qual status voltou.

**Request headers enviados (Console):**

```
{
  "cache-control": "no-cache",
  "postman-token": "22a2980f-52d5-4b18-b7b6-8d09d0f1fa57",
  "host": "localhost:3000",
  "user-agent": "PostmanRuntime/2.8.0",
  "accept": "*/*",
  "accept-encoding": "gzip, deflate, br",
  "connection": "keep-alive"
},
```

| Campo | Resposta |
|---|---|
| Saiu header `Authorization`? | Não |
| Como a herança foi desligada nessa requisição | Na aba **Authorization**, o campo `Auth Type` foi alterado de *Inherit auth from parent* para *No Auth* |
| Status retornado | `401 Unauthorized` |
| `code` e `message` retornados | `{"code": "UNAUTHORIZED", "message": "Token não fornecido."}` |
| Previsão da Parte B, tabela 1, cenário 8 (`02-status-jwt.md`) | `401` / `UNAUTHORIZED` (suposição) |
| Bateu com a previsão? | Sim. Status e `code` bateram. A suposição sobre o `code` foi confirmada e a `message` real é "Token não fornecido." |

## 3. O `if` do script de login na prática

**Script (post-response) do login:**

```js
if (pm.response.code === 200) {
  const body = pm.response.json();
  pm.environment.set("token", body.access_token);
  pm.environment.set("refresh_token", body.refresh_token);
}
```

| Caso | Status do login | Valor atual de `token` depois de rodar | O que aconteceu |
|---|---|---|---|
| Senha errada **com** o `if` | `401 Unauthorized` (`UNAUTHORIZED` / "Credenciais inválidas.") | Inalterado: mantém o token do último login bem-sucedido | O `if` deu falso porque o status não era `200`. Nenhum `pm.environment.set` rodou e o token válido foi preservado. O "Get me - com token" continuou retornando `200`. |
| Senha errada **sem** o `if` | `401 Unauthorized` (`UNAUTHORIZED` / "Credenciais inválidas.") | Vazio | O script rodou mesmo com o login falhando. O corpo de erro não tem `access_token`, então `body.access_token` era `undefined` e esse valor sobrescreveu o token válido. O "Get me - com token" passou a enviar `Authorization: Bearer ` (vazio). |

**Por que isso importa:**

> Sem o `if`, um login que falha apaga o token bom. O "Get me - com token" herda o `{{token}}` vazio, envia `Authorization: Bearer ` e recebe `401` com `UNAUTHORIZED` / "Token não fornecido.", mesmo com o header presente na requisição. O erro aparece longe da causa: parece que o `/users/me` quebrou, mas o problema foi o login. Com o `if`, o script só grava o token quando o login dá `200`, e uma falha não afeta as requisições seguintes.

- [x] `if` recolocado no script e senha correta restaurada

## 4. Register duas vezes seguidas

**Pre-request script do Register:**

```js
const email = `qa${Date.now()}@teste.com`;
pm.collectionVariables.set("email", email);
```

| Campo | Resposta |
|---|---|
| Status da 1ª execução | `201 Created` |
| Status da 2ª execução | `201 Created` |
| Por que veio esse status na 2ª vez | O pre-request roda antes de cada envio e gera um e-mail novo com `Date.now()` (timestamp em milissegundos, diferente a cada execução). A 2ª requisição foi com um e-mail ainda não cadastrado, então a API criou outro usuário normalmente. |
| O que teria acontecido na 2ª vez **sem** o pre-request | O e-mail seria o mesmo da 1ª execução, que já estava cadastrado. A API retornaria `409 Conflict` com `{"code": "CONFLICT", "message": "E-mail já cadastrado."}` (comportamento confirmado reenviando um e-mail repetido). |
| Previsão relacionada (Parte B, tabela 1, cenários 1 e 2) | **Cenário 2: bateu.** `409` com `code` `CONFLICT` e mensagem "E-mail já cadastrado.", sem tokens.<br>**Cenário 1: divergiu.** O status `201` bateu, mas a previsão também incluía `id`, `name` e `email` do usuário criado, e o body voltou só com `access_token`, `refresh_token`, `token_type` e `expires_in`. É o achado #1: segundo a Renata (tabela 4, dúvida #1), vale o critério da FIN-01, então a resposta está errada. Conferir só o status esconderia esse achado. |

## 5. Prova de que nenhum segredo vazou

**Arquivos exportados nesta pasta:**

- [x] `finance-api.postman_collection.json` (formato Collection v2.1)
- [x] `finance-local.postman_environment.json`

**Comando executado na raiz do repo:**

```bash
grep -c "eyJ" qa-course/sprints/sprint-1/entregas/04-postman/*.json
```

**Saída:**

```
qa-course/sprints/sprint-1/entregas/04-postman/finance-api.postman_collection.json:0
qa-course/sprints/sprint-1/entregas/04-postman/finance-local.postman_environment.json:0
```

| Campo | Resposta |
|---|---|
| O comando encontrou algum token? | Não. O `grep` procura `eyJ`, o início de todo JWT (é o `{"` do header em Base64URL). A contagem deu `0` nos dois arquivos, então nenhum `access_token` ou `refresh_token` foi exportado. |
| Onde ficam os valores sensíveis (valor inicial × valor atual) | Depende do tipo de variável:<br>**Segredo** (`token`, `refresh_token`): só no **valor atual**, que fica local e não é exportado. No environment, os dois estão marcados como `secret` e saíram sem `value`.<br>**Configuração** (`base_url` = `http://localhost:3000/v1`, `password` = senha inventada do usuário de teste local): **valor inicial preenchido**, porque sem eles a collection não roda para quem importar. A senha vai para o Git, mas é falsa e só vale no banco local.<br>**Gerado em tempo de execução** (`email`): valor inicial vazio, porque o pre-request do Register cria um e-mail novo a cada envio.<br>Requisições e auth usam só referências (`{{base_url}}`, `{{token}}`, `{{email}}`, `{{password}}`). |
| Conclusão | Os arquivos podem ser versionados com segurança e rodam logo depois de importar. Quem importar só precisa da API rodando em `localhost:3000` e de rodar, nesta ordem, o Register (cria o usuário com o e-mail gerado) e o Login (grava o `token`). Não precisa preencher nada à mão. |