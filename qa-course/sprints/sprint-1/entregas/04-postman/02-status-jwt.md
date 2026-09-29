# Módulo 04 — Status codes e autenticação com JWT

## Parte A — Decodificando o JWT

> Use um `access_token` recebido em `POST /v1/auth/login` ou `POST /v1/auth/register`.
> Não cole o token completo; se precisar mostrá-lo, mascare-o (`eyJhbGciOi...`).
>
> **Ferramenta usada:** comando local no terminal. O token não foi colado em nenhum site de terceiros (jwt.io ou similar).

### 1. Estrutura do token

| Campo | Resposta |
|---|---|
| Endpoint de origem do token | `POST /v1/auth/register` |
| Quantas partes o token tem e o que separa cada uma | 3 partes (Header, Payload e Assinatura), separadas por ponto (`.`) |
| Nome e função de cada parte | **Header:** indica o tipo do token (`typ`) e o algoritmo de assinatura (`alg`).<br>**Payload:** contém as claims, ou seja, as informações sobre o usuário e o token: `sub` é o ID do usuário, `iat` é quando o token foi emitido e `exp` é quando ele expira.<br>**Assinatura:** funciona como um "lacre" gerado pelo servidor com uma chave secreta que só ele conhece. Ela garante que o header e o payload não foram alterados. |

### 2. Header

| Campo | Resposta |
|---|---|
| Header decodificado | `{"alg":"HS256","typ":"JWT"}` |
| `alg`: significado | Algoritmo usado para assinar o token: HS256 = HMAC com SHA-256, uma assinatura simétrica (a mesma chave secreta assina e verifica) |
| `typ`: significado | Tipo do token: indica que se trata de um JWT (JSON Web Token) |

### 3. Payload (claims)

| Claim | Valor encontrado | O que significa |
|---|---|---|
| `sub` | 2a703afa-15ae-4754-96e2-2b0bbc1dbc18 | *Subject*: identificador único do usuário dono do token (aqui, um UUID) |
| `email` | qa@teste.com | Claim customizada (não registrada na RFC 7519): e-mail do usuário autenticado |
| `iat` | 1790606750 (28/09/2026 14:45:50 UTC / 11:45:50 BRT) | *Issued At*: momento em que o token foi emitido, em Unix timestamp (segundos) |
| `exp` | 1790610350 (28/09/2026 15:45:50 UTC / 12:45:50 BRT) | *Expiration*: momento a partir do qual o token deixa de ser aceito |

| Campo | Resposta |
|---|---|
| Qual claim identifica o usuário? Ela corresponde ao `id` de `GET /v1/users/me`? | `sub` (*Subject*), o identificador único do usuário dono do token. Valor: `2a703afa-15ae-4754-96e2-2b0bbc1dbc18`. Deve ser igual ao `id` retornado por `GET /v1/users/me` |
| Validade do token (`exp − iat`) e comparação com `expires_in` | `1790610350 − 1790606750 = 3600` segundos, ou seja, **1 hora**. O `expires_in` retornado no registro/login deve ser `3600` |
| O payload traz algum dado sensível (senha, hash)? | **Não.** Não há senha nem hash de senha. O único dado pessoal é o `email`, que não é uma credencial, mas é informação pessoal (PII). Como o payload é só codificado em Base64URL, e não criptografado, qualquer pessoa com o token consegue lê-lo. |

### 4. Assinatura

| Campo | Resposta |
|---|---|
| Para que serve a assinatura | Garante a **integridade** e a **autenticidade** do token. Ela prova que o header e o payload não foram alterados e que o token foi emitido pelo servidor que tem a chave secreta. Com HS256, é calculada assim: `HMAC-SHA256(base64url(header) + "." + base64url(payload), chave_secreta)`. |
| Decodificar o token significa conseguir ler o conteúdo? E alterá-lo? Por quê? | **Ler, sim.** Header e payload são apenas codificados em Base64URL, não criptografados, então qualquer pessoa consegue decodificá-los (ex.: jwt.io).<br>**Alterar, não de forma válida.** Até dá para editar o payload, mas a assinatura deixa de bater com o conteúdo. Para gerar uma assinatura nova e válida seria preciso conhecer a chave secreta, que só o servidor tem. |
| O que a API deve fazer se receber um token com um caractere alterado | **Rejeitar** a requisição com `401 Unauthorized`, porque a verificação da assinatura falha. A API não deve processar a requisição nem confiar em nenhuma claim do token adulterado, e o mesmo vale se a alteração estiver no header, no payload ou na própria assinatura. |

### 5. Access token × refresh token

| Campo | `access_token` | `refresh_token` |
|---|---|---|
| Para que serve | Autorizar o acesso aos endpoints protegidos da API (ex.: `GET /v1/users/me`). | Obter um novo `access_token` quando o atual expirar, sem que o usuário precise fazer login de novo. |
| Validade | **1 hora** (`exp − iat` = 3600 s). Expira em 28/09/2026 às 12:45:50 BRT. | **7 dias** (`exp − iat` = 604800 s). Expira em 05/10/2026 às 11:45:50 BRT. |
| Onde é enviado | No header de cada requisição protegida: `Authorization: Bearer <access_token>`. | Somente no endpoint de renovação (ex.: `POST /v1/auth/refresh`) |
| Diferenças no payload (se houver) | `sub`, `email`, `iat`, `exp`. | `sub`, `iat`, `exp`. **Não tem `email`**, e o `exp` é bem maior. O `sub` e o `iat` são iguais aos do access token, porque os dois foram emitidos juntos para o mesmo usuário. |

**Hipótese para o refresh token não ter `email`:** ele só serve para pedir um novo access token, então basta o `sub` para o servidor saber de quem é; os dados atuais do usuário são buscados na hora da renovação. Como ele vive 7 dias, carregar menos dados pessoais reduz o que vaza se ele for roubado (e evita levar um e-mail desatualizado para o token novo).

## Parte B — Previsões de status code (sem executar)

> Preencha **antes** de executar. As previsões serão conferidas no Postman nos blocos 3 e 4.
> Justifique cada previsão com o Swagger, um critério de aceite ou uma regra da aula.

> **Regra usada nesta parte:** o oráculo é sempre o Swagger (`src/docs/finance-api.yml`), um critério de aceite (FIN-01) ou uma regra da aula. Nenhuma expectativa vem do resultado da execução nem do código-fonte. Quando a fonte não cobre tudo, a linha diz qual parte é **suposição**; quando não há fonte nenhuma, vira **pergunta para a PO** (tabela 4).
>
> **Observação sobre o `code`:** o schema `Error` do Swagger só diz que `code` e `message` são obrigatórios; os valores `UNAUTHORIZED` e `VALIDATION_ERROR` aparecem como **exemplo** das respostas reutilizáveis (`Unauthorized`, `ValidationError`), e o `409` não tem exemplo nenhum. Por isso, sempre que eu prevejo um valor exato de `code`, isso está marcado como suposição.

### 1. Cenários de previsão

| # | Cenário | Status esperado | `code` esperado | Body esperado | Fonte |
|---|---|---|---|---|---|
| 1 | `POST /v1/auth/register` com nome, e-mail novo e senha de 8+ caracteres | `201` | — (sucesso) | `access_token` e `refresh_token` (strings), `token_type` = `Bearer`, `expires_in` = `3600`; **e também** `id`, `name` e `email` do usuário criado. Nenhum campo de senha ou hash. | Swagger: `/auth/register` documenta `201` com o schema `LoginResponse` (só os tokens). Critério da FIN-01: "resposta de sucesso traz os dados do usuário (id, nome, e-mail) e os tokens" e "senha nunca aparece em resposta de API". As duas fontes divergem; a Renata confirmou que o critério vale (dúvida #1 da tabela 4). `expires_in` = 3600: exemplo do Swagger + aula ("o access token expira em 1 hora"). |
| 2 | `POST /v1/auth/register` repetindo um e-mail que já tem conta | `409` | `CONFLICT` (suposição) | Objeto de erro com `code` e `message`; a mensagem deixa claro que o e-mail já está em uso. Sem tokens e sem dados de usuário. | Swagger: o `409` do `/auth/register` tem a descrição "E-mail já cadastrado" e usa o schema `Error`. Critério da FIN-01: e-mail duplicado não cadastra de novo e retorna erro claro. O valor de `code` não está fixado no Swagger. |
| 3 | `POST /v1/auth/login` com e-mail e senha corretos | `200` | — (sucesso) | `access_token`, `refresh_token`, `token_type` = `Bearer`, `expires_in` = `3600`. Nenhum campo de senha. | Swagger: `/auth/login` documenta `200` com `LoginResponse`. Aula: access token dura 1 hora. Critério da FIN-01 sobre senha nunca aparecer em resposta (estendo ao login por ser a mesma regra de proteção; a FIN-02 ainda não tem critério). |
| 4 | `POST /v1/auth/login` com e-mail cadastrado e senha errada | `401` | `UNAUTHORIZED` (suposição) | Objeto de erro com `code` e `message`, sem tokens. A mensagem não diz qual dos dois campos estava errado. | Swagger: `/auth/login` só documenta `401` como erro (resposta `Unauthorized`, exemplo com `code: UNAUTHORIZED`). A mensagem genérica é regra de segurança (não revelar qual campo errou); a FIN-02 ainda não tem critério, então isso também está na tabela 4 (dúvida #3). |
| 5 | `POST /v1/auth/login` com e-mail que não existe | `401` | `UNAUTHORIZED` (suposição) | **Igual ao cenário 4**: mesmo status, mesmo `code`, mesma `message`. Sem tokens. | Swagger: `/auth/login` não documenta `404` nem outro erro além do `401`, então o contrato não prevê resposta diferente para "e-mail não existe". Regra de segurança: se as respostas 4 e 5 forem diferentes, qualquer pessoa descobre quais e-mails têm conta (enumeração de usuários) e passa a atacar só a senha deles. Critério formal ainda não existe (FIN-02 "a definir"): ver dúvida #3. |
| 6 | `GET /v1/users/me` com access token válido | `200` | — (sucesso) | `id`, `name`, `email`, `currency`, `created_at`. O `id` é igual ao `sub` do token (Parte A). Nenhum campo de senha ou hash. | Swagger: `/users/me` documenta `200` com `UserResponse` (esses 5 campos). Parte A: `sub` identifica o usuário. Critério da FIN-01: senha nunca aparece em resposta. |
| 7 | `POST /v1/auth/register` com nome válido, `email: "abc"` e sem `password` | `400` | `VALIDATION_ERROR` (suposição) | `code`, `message` e `details` com **2 itens**, um para `email` e um para `password`, cada um com sua própria mensagem. Sem tokens; nenhum usuário criado. | Swagger: `/auth/register` documenta `400` com a resposta `ValidationError` (exemplo com `code: VALIDATION_ERROR` e `details` como lista de `field` + `message`); `UserRegisterRequest` exige `email` (com `format: email`) e `password`. Critério da FIN-01: "nome, e-mail e senha são obrigatórios" e "erro de validação retorna de uma vez todos os campos inválidos, cada um com sua própria mensagem" → por isso **2** itens, e não 1. Suposição: que `"abc"` seja rejeitado por formato; o critério não fala em validar formato de e-mail, isso vem só do `format: email` do Swagger. |
| 8 | `GET /v1/users/me` sem o header `Authorization` | `401` | `UNAUTHORIZED` (suposição) | Objeto de erro com `code` e `message`. Nenhum dado de usuário. | Swagger: segurança global `BearerAuth` e `/users/me` documenta `401` (resposta `Unauthorized`). Aula: "sem header nenhum → 401". O texto exato da mensagem não é fixado pelo Swagger (o exemplo é só exemplo). |
| 9 | **(meu)** `POST /v1/auth/register` com `"  QA@Teste.com "` depois de `qa@teste.com` já cadastrado | `409` | `CONFLICT` (suposição) | Mesmo erro do cenário 2. Nenhum segundo usuário criado. | Checklist do Módulo 02, item 3 (normalização de e-mail). Critério da FIN-01: e-mail não diferencia maiúscula de minúscula e espaços nas pontas são removidos antes de salvar → é o **mesmo** e-mail, então cai na regra de duplicado. Swagger: `409` "E-mail já cadastrado". |
| 10 | **(meu)** `POST /v1/auth/register` com nome e e-mail válidos e senha de **7** caracteres | `400` | `VALIDATION_ERROR` (suposição) | `code`, `message` e `details` com **1 item**, para `password`. Sem tokens; nenhum usuário criado. | Checklist do Módulo 02, item 1 (senha segura: mínimo de caracteres). Critério da FIN-01: "senha: mínimo de 8 caracteres". Swagger: `password` com `minLength: 8` e `400` `ValidationError`. É o valor logo abaixo da fronteira; o par com 8 caracteres (deve dar `201`) fica para os casos de teste. |

**Extras: as 2 requisições de contas da collection**, refeitas a partir do Swagger:

| # | Cenário | Status esperado | `code` esperado | Body esperado | Fonte |
|---|---|---|---|---|---|
| 11 | `POST /v1/accounts` com `name`, `type: checking` e `initial_balance: 500` | `201` | — (sucesso) | Um `id` (UUID) gerado pelo servidor; `name`, `type`, `currency`, `color` e `icon` iguais aos enviados (ou `currency` = `BRL` se omitido); `balance` numérico igual ao `initial_balance` (500); `allow_negative` = `false` se omitido; `is_active` = `true`; `created_at` preenchido. | Swagger: `/accounts` POST documenta `201` com `AccountResponse`; `AccountRequest` define os defaults de `currency` (`BRL`) e `allow_negative` (`false`); `balance` é do tipo `Money` (`number`). Suposições: que `balance` nasce igual a `initial_balance` (o Swagger não liga os dois campos) e que `is_active` nasce `true` (o Swagger não define default). |
| 12 | `GET /v1/accounts` com token válido, depois do cenário 11 | `200` | — (sucesso) | `data`: lista com as contas **do usuário do token** (inclui a do cenário 11), cada uma no formato `AccountResponse`; `total_balance` numérico = soma dos `balance` da lista. | Swagger: `/accounts` GET documenta `200` com `data` (lista de `AccountResponse`) e `total_balance` (`Money`), e o resumo "Listar contas do usuário". Suposição: que `total_balance` é a soma dos saldos (o Swagger só dá o nome do campo) e se considera ou não contas inativas (ver dúvida #4). |

### 2. Cenários de autenticação

| # | Cenário | Requisição usada | Status esperado | `code` esperado | Por quê / fonte |
|---|---|---|---|---|---|
| 1 | Sem header `Authorization` | `GET /v1/users/me` | `401` | `UNAUTHORIZED` (suposição) | Swagger: segurança global `BearerAuth` e `401` documentado em `/users/me`. Aula: "sem header nenhum → 401". Sem o header, a API não tem como saber quem está chamando. |
| 2 | Header sem o prefixo `Bearer ` | `GET /v1/users/me` | `401` | `UNAUTHORIZED` (suposição) | Swagger: o esquema de segurança é `http` / `scheme: bearer`, ou seja, o formato esperado é `Authorization: Bearer <token>`. Aula: "header sem o prefixo `Bearer ` → 401". Suposição: a mensagem ser a mesma do cenário 1 ou a do token inválido; nenhuma fonte fixa isso. |
| 3 | Token adulterado (um caractere alterado) | `GET /v1/users/me` | `401` | `UNAUTHORIZED` (suposição) | Parte A: a assinatura HS256 deixa de bater com o header e o payload. Swagger: a resposta `Unauthorized` tem a descrição "Token inválido ou expirado". Aula: "token adulterado → 401". |
| 4 | Token expirado | `GET /v1/users/me` | `401` | `UNAUTHORIZED` (suposição) | Parte A: `exp` = `iat` + 3600. Aula: "passou disso, tudo vira 401". Swagger: descrição da resposta `Unauthorized`. |
| 5 | Token de outro usuário | `GET /v1/users/me` | `200` | — (sucesso) | Swagger: `/users/me` retorna o "usuário autenticado", e quem está autenticado é quem o `sub` do token aponta. Do ponto de vista da API, quem manda o token **é** quem fez a requisição: ela não tem como saber se o token foi roubado ou emprestado. Por isso a resposta traz os dados do usuário do `sub`. É exatamente o risco que esse cenário mostra, e o motivo de o access token durar só 1 hora. |
| 6 | `POST /v1/auth/refresh` enviando o `access_token` no campo `refresh_token` | `POST /v1/auth/refresh` | `401` | `UNAUTHORIZED` (suposição) | Swagger: `/auth/refresh` só documenta `200` e `401`. Não é `400`: o JSON do body é bem formado (o campo obrigatório `refresh_token` está presente e é string), então a requisição passa na validação de formato; o problema é o **valor**, que não é um refresh token válido, e isso é falha de autenticação. Aula: "refresh com token de acesso → deveria falhar". Suposição: como a API distingue os dois tipos de token; a FIN-03 ainda não tem critério. |
| 7 | `POST /v1/auth/refresh` duas vezes com o mesmo `refresh_token` | `POST /v1/auth/refresh` | 1ª chamada: `200`<br>2ª chamada: **sem previsão** | 1ª: — (sucesso)<br>2ª: sem previsão | 1ª chamada: Swagger documenta `200` com `LoginResponse` (novo par de tokens). 2ª chamada: nenhuma fonte define se o refresh token pode ser reusado ou se é invalidado a cada uso (rotação). A FIN-03 está com critério "a definir" e a aula diz "pergunte à Renata". Virou a dúvida #2 da tabela 4. |

### 3. Fronteiras de status code

| Par | Diferença (com suas palavras) | Exemplo no finance-api |
|---|---|---|
| `401` × `403` | No 401 o sistema não sabe quem você é (sem token, token inválido ou expirado). No 403 ele sabe quem você é, mas você não tem permissão para aquela ação. | **401:** `GET /accounts` sem header `Authorization` → `401 UNAUTHORIZED` "Token não fornecido."; com token adulterado/expirado → "Token inválido ou expirado.". **403:** o finance-api não retorna 403 — ao acessar a conta de outro usuário (`GET /accounts/{id}` com id alheio) a API responde `404 NOT_FOUND`, porque a busca filtra por `id` + `userId` e não revela que o recurso existe. |
| `400` × `422` | No 400 a requisição está mal formada: campo obrigatório faltando, tipo ou formato errado — a API nem chega a avaliar a regra. No 422 o formato está correto, a API entende o pedido, mas uma regra de negócio impede a execução. | **400:** `POST /transactions` sem `amount`, ou com `amount: "abc"` → `400 VALIDATION_ERROR` "Dados inválidos.". **422:** `POST /transactions` de despesa confirmada com valor maior que o saldo, em conta com `allow_negative = false` → `422 INSUFFICIENT_BALANCE` "Saldo insuficiente. Conta não permite saldo negativo."; o mesmo vale para transferência sem saldo na conta de origem. |
| `409` × `422` | O 409 é conflito com o estado atual de um recurso que já existe (duplicidade ou vínculo) — não depende de enviar a mesma requisição duas vezes. O 422 é uma regra de negócio que barra a operação, sem haver outro recurso em conflito. | **409:** `POST /auth/register` com e-mail já cadastrado → `409 CONFLICT` "E-mail já cadastrado."; criar orçamento para a mesma categoria + período → `409`; excluir conta ou categoria com transações vinculadas → `409` (primeira tentativa, e mesmo assim é conflito). **422:** saldo insuficiente, como acima. |

### 4. Dúvidas para a PO

> Liste os cenários em que o Swagger e os critérios de aceite não deixam claro o comportamento esperado.

| # | Cenário | Dúvida | Por que importa para o teste | Resposta Renata (PO) |
|---|---|---|---|---|
| 1 | Resposta de sucesso do `POST /v1/auth/register` | O critério de aceite da FIN-01 diz que a resposta traz **os dados do usuário (id, nome, e-mail) e os tokens**, mas o body previsto traz só `access_token`, `refresh_token`, `token_type` e `expires_in`. Qual dos dois vale? | Se o critério vale, a resposta atual é um **bug** (falta `id`, `name`, `email`). Se o Swagger vale, o critério precisa ser corrigido. Sem essa definição, não dá para dizer se o teste passou ou falhou. | Vale o critério. A gente combinou no refinement que a pessoa sai do cadastro já com os dados dela, pra tela de boas-vindas mostrar o nome sem fazer outra chamada. Se hoje não vem, está errado. |
| 2 | `POST /v1/auth/refresh` duas vezes com o mesmo `refresh_token` | O refresh token pode ser reusado enquanto não vence (7 dias), ou cada uso invalida o anterior e devolve um novo (rotação)? Se houver rotação, o que acontece com o access token que já foi emitido com o refresh antigo? | Sem a regra, a 2ª chamada não tem resultado esperado: `200` pode ser o certo ou pode ser um buraco de segurança (refresh vazado vale 7 dias). A FIN-03 está com critério "a definir". | Não entendo a parte técnica, mas o que importa para o negócio é que a pessoa não seja deslogada no meio do uso. Conversei com o Marcelo: nesta versão, o refresh token pode ser usado de novo enquanto não vence, que são os 7 dias. A troca a cada uso ele chamou de "rotação", e ela vai para o backlog, junto com o limite de tentativas no cadastro. O access token que já foi emitido continua valendo até vencer. |
| 3 | `POST /v1/auth/login` com senha errada × e-mail inexistente | As duas respostas devem ser idênticas (status, `code` e `message`)? E, se sim, como fica o `409` "e-mail já cadastrado" do register, que já revela quais e-mails têm conta? | Se a regra for "idênticas", qualquer diferença entre os cenários 4 e 5 é bug de segurança. O conflito com o register pode ser aceito como risco conhecido, mas precisa ser decisão da PO, não minha. FIN-02 ainda sem critério. | mesmo status, mesmo código, mesma mensagem, errando a senha ou o e-mail. Sobre o cadastro: boa pergunta, não tinha pensado nisso. A pessoa precisa saber que já tem conta, senão ela não entende por que não consegue se cadastrar. Aceitamos esse risco. Anota como risco conhecido. |
| 4 | `total_balance` em `GET /v1/accounts` | Entram na soma só as contas ativas ou todas? E contas com saldo negativo (`allow_negative = true`) diminuem o total? | O Swagger só dá o nome do campo. Sem a regra, não dá para calcular o valor esperado do total em nenhum cenário com mais de uma conta. | Conta excluída ou desativada não aparece na lista e não soma. Saldo negativo entra subtraindo, sim: se o cartão está devendo R$ 300, o total mostra quanto a pessoa realmente tem. |