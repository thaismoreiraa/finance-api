# Módulo 04 — API REST e Postman do zero

**Sprint 1 · ~5 horas · o módulo mais importante do Nível 1**

---

## Por que isso importa

Este produto **é** uma API. Se você não sabe chamar um endpoint, você não consegue testar
nada aqui. E na vida real: quase toda vaga de QA júnior pede Postman, porque testar pela
API é mais rápido, mais estável e pega bug que a tela esconde.

---

## 1. O que é uma API

Você usa um app de banco. Aperta "ver saldo". O app não tem o seu saldo guardado dentro
dele — ele **pergunta ao servidor**. Essa conversa acontece por uma API.

A tela é a vitrine. A API é a loja. **Bug de regra de negócio mora na API**, não na tela —
e por isso testar direto na API é mais eficiente: você fala com quem decide.

### Anatomia de uma conversa

**Requisição (request)** — o que você manda:

```http
POST /v1/accounts HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "name": "Conta Corrente",
  "type": "checking",
  "initial_balance": 1000
}
```

Peça por peça:

| Peça | O que é | No exemplo |
| --- | --- | --- |
| **Método** | O verbo — que tipo de ação | `POST` |
| **Endpoint** | O caminho do recurso | `/v1/accounts` |
| **Headers** | Metadados da requisição | quem sou eu, que formato envio |
| **Body** | Os dados | o JSON da conta |

**Resposta (response)** — o que volta:

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "8f3e...",
  "name": "Conta Corrente",
  "balance": "1000.00"
}
```

| Peça | No exemplo |
| --- | --- |
| **Status code** | `201` — criado com sucesso |
| **Body** | o recurso criado, **com o id que o servidor gerou** |

---

## 2. Os métodos HTTP

| Método | Faz | No finance-api | Idempotente? |
| --- | --- | --- | --- |
| **GET** | Lê, não muda nada | `GET /v1/accounts` | Sim |
| **POST** | Cria | `POST /v1/transactions` | **Não** |
| **PUT** | Substitui o recurso inteiro | — | Sim |
| **PATCH** | Altera parte do recurso | `PATCH /v1/accounts/:id` | Sim |
| **DELETE** | Remove | `DELETE /v1/accounts/:id` | Sim |

> **Idempotente** = repetir a mesma chamada dá o mesmo resultado. `PATCH` com
> `{"name": "X"}` dez vezes deixa o nome "X" — igual à primeira. `POST` dez vezes cria
> **dez transações**. Isso é teste: chame o mesmo POST duas vezes e veja se o sistema
> duplica quando não deveria.

**PUT × PATCH** é pergunta de entrevista: PUT manda o objeto inteiro (campo omitido é
apagado); PATCH manda só o que muda. Esta API usa PATCH.

---

## 3. Status codes

Não decore os 60. Decore estes, que são os que você usa todo dia.

### 2xx — deu certo
| | Quando |
| --- | --- |
| **200 OK** | Deu certo e tem conteúdo na resposta |
| **201 Created** | Criou. Resposta traz o recurso novo |
| **204 No Content** | Deu certo e não tem nada para devolver — típico de DELETE |

### 4xx — o cliente errou *(a maior parte do seu trabalho está aqui)*
| | Quando | No finance-api |
| --- | --- | --- |
| **400 Bad Request** | Requisição malformada ou dado inválido | `amount` como texto |
| **401 Unauthorized** | Você não provou quem é | sem token, ou token expirado |
| **403 Forbidden** | Sei quem você é, mas não pode | tentar acessar recurso de outro usuário |
| **404 Not Found** | Não existe | id que não existe |
| **409 Conflict** | Conflito com o estado atual | excluir conta que tem transações |
| **422 Unprocessable** | Sintaxe ok, mas viola regra de negócio | saldo insuficiente |

**401 × 403** cai em entrevista: 401 é *não sei quem você é*; 403 é *sei, e você não
pode*. Se a API devolve 401 quando deveria ser 403 (ou vice-versa), isso é bug de
contrato — e você reporta.

**400 × 422** é a fronteira sutil: 400 é "não entendi o que você mandou"; 422 é "entendi
perfeitamente, mas não posso fazer". Saldo insuficiente é 422, porque o pedido estava
bem formado.

### 5xx — o servidor errou
| | Quando |
| --- | --- |
| **500 Internal Server Error** | Explodiu do lado de lá |

**Todo 500 é bug**, sempre, sem exceção. Não existe 500 esperado. Se você mandar lixo e a
API devolver 500, ela deveria ter devolvido 400 — o defeito é dela, não seu. Este é um
dos achados mais fáceis e mais valiosos de um QA júnior.

---

## 4. Autenticação com JWT

Nesta API, quase tudo exige token.

1. `POST /v1/auth/login` com e-mail e senha → recebe `access_token` e `refresh_token`.
2. Em toda chamada seguinte, mande o header:
   `Authorization: Bearer <access_token>`
3. O access token expira em **1 hora**. Passou disso, tudo vira 401.
4. `POST /v1/auth/refresh` com o `refresh_token` (válido 7 dias) → novo par de tokens.

**Cenários de teste que nascem daqui** — anote, porque são a base dos seus primeiros
casos:

- sem header nenhum → 401
- header sem o prefixo `Bearer ` → 401
- token de outro usuário → dados de quem?
- token adulterado (mude um caractere) → 401
- token expirado → 401
- refresh com token de acesso (o errado) → deveria falhar
- refresh duas vezes com o mesmo refresh token → deveria funcionar? pergunte à Renata

---

## 5. Postman

### Configuração que você faz uma vez e usa o curso inteiro

**Environment** — variáveis do ambiente. Crie `finance-local`:

| Variável | Valor |
| --- | --- |
| `base_url` | `http://localhost:3000/v1` |
| `token` | *(vazio, preenchido automaticamente)* |

Assim você escreve `{{base_url}}/accounts` em vez de repetir a URL, e trocar de ambiente
é um clique.

**Login que guarda o token sozinho.** Na requisição de login, aba **Scripts → Post-response**:

```javascript
const body = pm.response.json();
pm.environment.set("token", body.access_token);
```

Agora, nas outras requisições, use `Bearer {{token}}` no Authorization. Você loga uma vez
e todas as outras funcionam. Sem isso, você vai copiar e colar token o dia inteiro.

### Collection — organize por recurso

```
Finance API
├── Auth        register, login, refresh, logout
├── Accounts    CRUD completo
├── Categories
├── Transactions
├── Budgets
├── Goals
└── Reports
```

### Assertions — onde o Postman vira ferramenta de teste

Sem assertion, você só está *olhando* a resposta. Com assertion, o Postman **julga** por
você e diz Pass/Fail:

```javascript
pm.test("Status code é 201", function () {
  pm.response.to.have.status(201);
});

pm.test("Retorna o id da conta criada", function () {
  const body = pm.response.json();
  pm.expect(body).to.have.property("id");
});

pm.test("Saldo inicial é aplicado corretamente", function () {
  const body = pm.response.json();
  pm.expect(Number(body.balance)).to.eql(1000);
});

pm.test("Responde em menos de 500ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(500);
});
```

Quatro padrões que resolvem 90% dos casos: **status code**, **campo existe**,
**valor está correto**, **tempo de resposta**.

Com assertions escritas, o **Collection Runner** roda a coleção inteira de uma vez e te
dá um relatório. Isso é o seu smoke test: build nova chegou, roda a coleção, dois minutos,
e você sabe se dá para começar a testar.

---

## 6. Sua vez

Em `qa-course/sprints/sprint-1/entregas/04-postman/`:

1. Crie o environment `finance-local` com `base_url` e `token`.
2. Monte a collection com as pastas acima.
3. Implemente, com assertions em cada uma:
   - `POST /auth/register` — usuário novo
   - `POST /auth/register` — e-mail repetido *(que status code você espera? confira no Swagger antes)*
   - `POST /auth/login` — sucesso, salvando o token no environment
   - `POST /auth/login` — senha errada
   - `GET /users/me` — com token
   - `GET /users/me` — **sem** token
   - `POST /accounts` — criando conta com saldo inicial
   - `GET /accounts` — listando
4. Rode o Collection Runner e exporte o resultado.
5. Exporte a collection e o environment (JSON) e commite na pasta.

**Regra:** antes de executar cada requisição, escreva no papel qual status code você
espera. Depois execute. Onde a realidade divergiu da sua expectativa, investigue: ou você
entendeu errado, ou achou um bug. Essa é a essência do trabalho.

---

## 7. Como a IA ajuda aqui

Este é o módulo em que a IA mais economiza tempo real de QA.

**Escrever assertion.** Poucos QAs manuais gostam de escrever JavaScript, e não precisam:

> Escreva um teste de Postman que valide que a resposta tem status 201, que o campo
> balance é igual a 1000, e que o array de contas retornado está ordenado por nome.

Ela acerta quase sempre. **Mas leia antes de colar** — assertion errada é pior que
assertion nenhuma, porque passa verde e te dá falsa segurança. O erro clássico: ela
compara `body.balance` (que vem como string `"1000.00"`) com o número `1000`, e o teste
falha sem motivo real.

**Gerar massa de teste.** *"Gere 20 payloads JSON de transação para o endpoint POST
/transactions, variando tipo, valor com e sem centavos, datas passadas e futuras, e
incluindo casos inválidos."* Excelente uso — e nota que centavos e datas são justamente
onde bug se esconde.

**Ler documentação.** Cole um trecho do Swagger e peça para explicar o que o endpoint
espera. Rápido e confiável.

**Onde ela não substitui você:** decidir **o que** testar. Ela gera assertion para o
cenário que você descrever. Se você não pensou em testar o token de outro usuário, ela
não vai lembrar sozinha. O cenário é seu; a implementação pode ser dela.

**Um hábito que vale carreira:** depois de escrever seus casos, pergunte *"que cenário
importante eu deixei de fora?"*. Metade da resposta vai ser ruído. A outra metade, de vez
em quando, salva a sua sprint.

---

## 8. Vocabulário

| Inglês | Significa |
| --- | --- |
| **request / response** | requisição / resposta |
| **header** | cabeçalho |
| **payload / body** | corpo da requisição |
| **query parameter** | parâmetro depois do `?` |
| **path parameter** | parâmetro dentro do caminho (`/accounts/:id`) |
| **status code** | código de resposta |
| **endpoint** | caminho de um recurso |
| **authentication / authorization** | autenticação / autorização |
| **assertion** | verificação automática |
| **idempotent** | repetir dá o mesmo resultado |
| **collection** | conjunto de requisições no Postman |

---

Fim da Sprint 1. Rode `/qa-curso retro` antes de seguir.

Próximo: `/qa-curso modulo 5` — Técnicas de teste.
