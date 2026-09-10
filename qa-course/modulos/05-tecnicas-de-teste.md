# Módulo 05 — Técnicas de teste

**Sprint 2 · ~4 horas**

---

## Por que isso importa

O campo `amount` de uma transação aceita infinitos valores. Você tem uma sprint. Testar
tudo é impossível — e testar aleatoriamente é sorte.

Técnica de teste é o método para escolher **poucos casos que pegam muito bug**. É a
diferença entre "testei bastante" e "cobri as classes de equivalência e os limites de
todos os campos da story". A segunda frase é a que te contrata.

---

## 1. Particionamento de equivalência

**A ideia:** se dois valores são tratados igual pelo sistema, testar os dois é
desperdício. Divida a entrada em grupos que se comportam do mesmo jeito e teste **um**
de cada.

O campo `password` no `POST /v1/auth/register` exige mínimo de 8 caracteres:

| Partição | Exemplo | Esperado |
| --- | --- | --- |
| Menos de 8 | `"abc"` | Rejeita, 400 |
| 8 ou mais | `"senha12345"` | Aceita, 201 |
| Vazio | `""` | Rejeita, 400 |
| Ausente | *(campo não enviado)* | Rejeita, 400 |

Quatro casos, não quarenta. Testar `"abc"`, `"abcd"` e `"abcde"` é o mesmo teste três
vezes: todos são "menos de 8".

**A armadilha:** as partições nem sempre são óbvias. No campo `type` de conta, os valores
`checking`, `savings`, `credit`, `investment` e `cash` parecem uma partição só ("válido").
Mas `credit` é um cartão — será que o saldo se comporta igual? Se a regra de negócio
trata diferente, é **outra partição**. Sempre pergunte: *o sistema faz algo diferente com
esse valor?*

---

## 2. Análise de valor limite

**A ideia:** o bug mora na borda. Programador escreve `>` quando era `>=` o tempo todo —
é o erro mais comum do mundo. Então teste **em cima da borda e nos vizinhos**.

Para todo limite, três valores: **imediatamente antes, exatamente no limite,
imediatamente depois.**

Senha com mínimo de 8:

| Valor | Tamanho | Esperado |
| --- | --- | --- |
| `"1234567"` | 7 | Rejeita |
| `"12345678"` | **8** | **Aceita** |
| `"123456789"` | 9 | Aceita |

O caso de 8 é o que importa. Se o dev escreveu `length > 8` em vez de `>= 8`, só esse
caso pega — e é exatamente o tipo de bug que passa por dez QAs distraídos.

### Onde tem limite no finance-api

Faça essa varredura em toda story que receber:

| Limite | Valores a testar |
| --- | --- |
| `initial_balance` mínimo | -1, 0, 1 |
| `amount` deve ser positivo | -0.01, 0, 0.01 |
| `currency` tem 3 caracteres | `"BR"`, `"BRL"`, `"BRLX"` |
| `name` de conta, 1 a 100 chars | vazio, 1, 100, 101 |
| `alert_threshold` percentual | 0, 1, 79, 80, 81, 100, 101 |
| Saldo com `allow_negative = false` | saldo que deixa em -0.01, exatamente 0, +0.01 |
| Data da transação | ontem, **hoje**, amanhã |
| Paginação `per_page` | 0, 1, 100, 101 |

**A linha das datas merece atenção especial.** "Hoje" é o limite entre passado e futuro, e
a regra diz que data futura vira `scheduled`. Quem testa só com "semana que vem" nunca
descobre o que acontece hoje. Em software financeiro, data é a maior fonte de defeito que
existe — perde só para dinheiro com centavos.

---

## 3. Tabela de decisão

**Quando usar:** quando o resultado depende da **combinação** de várias condições. Aí
partição e limite não bastam — você precisa de um mapa.

Regra do finance-api: *"Se `allow_negative = false`, a API deve rejeitar transações do
tipo `expense` que deixariam o saldo negativo."*

Três condições em jogo: o tipo da transação, a flag da conta, e se o saldo cobre.

| # | type | allow_negative | Saldo cobre? | Resultado esperado |
| --- | --- | --- | --- | --- |
| 1 | expense | false | Sim | 201, saldo debitado |
| 2 | expense | false | **Não** | **422 INSUFFICIENT_BALANCE**, saldo intacto |
| 3 | expense | true | Sim | 201, saldo debitado |
| 4 | expense | true | Não | 201, **saldo fica negativo** |
| 5 | income | false | — | 201, saldo creditado |
| 6 | income | true | — | 201, saldo creditado |
| 7 | transfer | false | Não | 422 na origem |
| 8 | transfer | true | Não | 201, origem negativa |

Oito casos e a regra inteira está coberta. Sem a tabela, você teria testado o caso 2 (o
óbvio) e esquecido o 4 — que é onde a flag realmente prova que funciona.

**Como montar:** liste as condições, monte as combinações, **elimine as impossíveis**
(saldo não importa para income), e cada linha que sobra é um caso de teste.

---

## 4. Transição de estados

**Quando usar:** quando o objeto tem estados e o comportamento depende de onde ele está.

Uma transação tem `status`: `scheduled`, `pending`, `confirmed`, `cancelled`.

```
                 data futura
   [criada] ──────────────────► scheduled
      │                            │ chega a data
      │ data hoje/passada          ▼
      └──────────────────────► confirmed ──► (afeta o saldo)
                                   │
                                   ▼
                              cancelled
```

O que testar num diagrama de estados:

1. **Cada transição válida** — scheduled vira confirmed?
2. **As transições inválidas** — dá para ir de `cancelled` de volta para `confirmed`?
   *Deveria*? Se a API deixa e não deveria, é bug.
3. **As transições que faltam** — existe caminho de volta de `scheduled` para
   `confirmed` quando a data muda? *Repare bem nessa pergunta.*
4. **O efeito colateral de cada transição** — virar `confirmed` mexe no saldo. Virar
   `cancelled` desfaz?

O mesmo vale para metas: `active → completed`. Tem volta? O que acontece se o alvo
aumentar depois de completa?

**Esta técnica acha os bugs mais sofisticados.** Aprofundamos no Módulo 09.

---

## 5. Error guessing

Não tem método. É experiência: você "cheira" onde tem bug. Como você ainda não tem
experiência, use esta lista emprestada — ela funciona em qualquer sistema:

- **Zero.** Valor zero, lista vazia, string vazia, resultado zero.
- **Negativo** onde só deveria haver positivo.
- **Nulo** e campo ausente — são coisas diferentes: `{"name": null}` não é o mesmo que
  não mandar `name`.
- **Duplicado.** Mande o mesmo POST duas vezes. Crie duas contas com o mesmo nome.
- **Muito grande.** Nome com 10.000 caracteres. Valor com 15 dígitos.
- **Centavos.** 10,50 e 0,01. Dinheiro quebrado quebra software.
- **Acento, emoji, aspas.** `"Conta do José"`, `"Conta 'principal'"`, `"Conta 💰"`.
- **Espaço.** Só espaços em branco num campo obrigatório.
- **Fora de ordem.** Excluir o pai antes do filho. Usar um id já excluído.
- **Simultâneo.** Duas requisições ao mesmo tempo na mesma conta.
- **Outro usuário.** Sempre. Crie dois usuários e tente cruzar os dados.

O último item é o mais esquecido por QA júnior e o mais grave quando escapa.

---

## 6. Caixa-preta e caixa-branca

**Caixa-preta:** você testa pelo comportamento, sem olhar o código. É 90% do trabalho de
QA e é tudo o que vimos até aqui.

**Caixa-branca:** você olha o código para decidir o que testar. Você não precisa saber
programar para se beneficiar disso — precisa saber **ler**.

Abra `src/services/GoalService.js` e procure a função `deposit`. Mesmo sem saber
JavaScript, dá para ler:

```javascript
if (goal.status !== 'active') {
  throw new AppError('Só é possível depositar em metas ativas.', 400, ...);
}
```

Isso te diz, sem adivinhação: **existe um caminho de erro para meta não-ativa**, e ele
devolve 400. Agora você sabe que precisa testar depósito em meta `completed` — e sabe
exatamente qual status code esperar.

Duas coisas que a leitura de código te dá e a caixa-preta não:

1. **Caminhos que a documentação não menciona.** Todo `if` no código é uma bifurcação, e
   toda bifurcação é pelo menos um caso de teste.
2. **Valores exatos.** Você para de escrever "deve dar erro" e passa a escrever "422 com
   `code: INSUFFICIENT_BALANCE`".

**Cuidado com o viés:** se você escrever os casos **só** olhando o código, você vai testar
o que o dev implementou — inclusive as regras que ele implementou errado. O código te diz
o que o sistema **faz**; o README te diz o que ele **deveria fazer**. Bug é a diferença
entre os dois. Por isso a ordem correta é: escreva os casos pelo requisito, **depois**
leia o código para achar caminhos que você não previu.

---

## 7. Sua vez

Sprint 2 é sobre **Contas e Categorias**. Em
`qa-course/sprints/sprint-2/entregas/05-tecnicas.md`:

1. **Particionamento** — para `POST /v1/accounts`, liste as partições de cada campo:
   `name`, `type`, `initial_balance`, `currency`, `allow_negative`.
2. **Valor limite** — para cada campo com limite, os três valores. Justifique um deles.
3. **Tabela de decisão** — monte a tabela de `DELETE /v1/categories/:id`, considerando:
   a categoria tem transações vinculadas?, tem subcategorias?, é de outro usuário?
4. **Error guessing** — cinco cenários "malandros" para contas e categorias, com o que
   você espera que aconteça em cada um.
5. **Caixa-branca** — leia `src/services/CategoryService.js` e liste todos os caminhos de
   erro que encontrar, com o status code de cada um. Depois compare com o Swagger: bate?

Sem executar nada ainda. Este módulo é sobre **pensar antes**.

---

## 8. Como a IA ajuda aqui

Aqui a IA é genuinamente forte, porque é trabalho combinatório — e é justamente onde o
cérebro humano cansa e pula linha.

**Tabela de decisão** é o melhor caso de uso:

> Monte uma tabela de decisão para esta regra: "transações do tipo expense são rejeitadas
> se allow_negative for false e o saldo resultante ficar negativo". Considere os tipos
> income, expense e transfer. Marque as combinações impossíveis.

Ela monta em segundos, sem esquecer linha. Você revisa se as combinações fazem sentido
para **este** negócio.

**Valores limite** também:

> Para um campo percentual com limite de alerta que dispara em 80%, quais valores de
> teste você recomenda?

Ela devolve 0, 79, 80, 81, 100, e provavelmente 101 e -1. Bom ponto de partida.

**Onde ela derrapa, e é sério:** ela não sabe qual é o **comportamento esperado** no seu
sistema. Ela vai preencher a coluna "resultado esperado" com o que costuma ser verdade em
sistemas parecidos — e vai errar com a mesma confiança com que acerta. Se você copiar a
tabela dela sem conferir cada linha contra o README, você vai **executar testes com o
gabarito errado**: o sistema faz o certo, seu teste diz que falhou, e você reporta um bug
que não existe. Perder credibilidade com o dev assim é caríssimo, e é um erro típico de
QA júnior com IA.

**A divisão certa de trabalho:**
- IA: gerar a **estrutura** (combinações, listas de valores, formato da tabela).
- Você: preencher e validar o **resultado esperado**, sempre contra o requisito.

**O outro risco, mais silencioso:** delegar a técnica antes de dominá-la. Se você nunca
montou uma tabela de decisão na mão, você não sabe reconhecer quando a da IA está errada.
Faça os exercícios deste módulo sozinha. Depois disso, use IA à vontade — é o que o QA
sênior faz.

---

## 9. Vocabulário

| Inglês | Significa |
| --- | --- |
| **equivalence partitioning** | particionamento de equivalência |
| **boundary value analysis** | análise de valor limite |
| **decision table** | tabela de decisão |
| **state transition testing** | teste de transição de estados |
| **error guessing** | suposição de erro |
| **black box / white box** | caixa-preta / caixa-branca |
| **edge case** | caso extremo, na borda |
| **happy path** | caminho feliz — o fluxo sem erro |
| **negative testing** | teste com entrada inválida |
| **test data** | massa de teste |

---

Próximo: `/qa-curso modulo 6` — Casos de teste e critérios de aceite.
