# Módulo 08 — Bug report e ciclo de vida do defeito

**Sprint 3 · ~3 horas**

---

## Por que isso importa

Achar o bug é metade do trabalho. A outra metade é fazer alguém consertar.

Um bug report ruim volta com "não consegui reproduzir", queima três dias de ida e volta e
corrói a sua reputação com o time. Um bug report bom é lido em dois minutos, corrigido no
mesmo dia, e faz o dev confiar em você.

**A partir deste módulo, seus bug reports são escritos em inglês.** Eu corrijo o inglês
junto com o conteúdo.

---

## 1. Antes de reportar

Quatro perguntas, sempre, sem exceção:

**1. Reproduzi duas vezes, do zero?**
Bug que só acontece uma vez costuma ser estado sujo do seu ambiente. Refaça do começo,
com dados novos.

**2. É bug mesmo, ou eu entendi o requisito errado?**
Releia o critério de aceite. Se a regra não estiver escrita em lugar nenhum, **não abra
bug: pergunte à PO**. "Comportamento não especificado" não é defeito — é lacuna de
requisito, e o ticket certo pode ser outro.

**3. Já existe ticket para isso?**
Busque no Jira antes. Duplicata irrita e polui a base.

**4. Um dev que nunca viu esse fluxo consegue reproduzir só com o que escrevi?**
Se não, o report está incompleto — e a culpa do "cannot reproduce" vai ser sua.

---

## 2. A anatomia

### Título — a parte mais importante

É o que aparece na lista, no board e no e-mail. Tem que dizer tudo sozinho.

**Fórmula:** *o quê* + *onde* + *quando/condição*.

| Ruim | Por quê | Bom |
| --- | --- | --- |
| "Erro no saldo" | Qual erro? Onde? | "Saldo da conta não é revertido ao excluir transação de despesa" |
| "Não funciona" | Nada | "Transferência entre contas aceita origem e destino iguais" |
| "Bug no orçamento" | Qual? | "Orçamento não marca alert_triggered quando o gasto atinge exatamente o alert_threshold" |

Se o título precisa que a pessoa abra o ticket para entender o problema, o título falhou.

### Ambiente

Branch e commit, URL, banco, data e hora. Sem isso, o dev testa na `main`, funciona, e
fecha como "cannot reproduce".

### Pré-condições e passos

Comece de um estado **conhecido**. "Tenha uma conta" não serve; "conta corrente com saldo
R$ 500,00 e `allow_negative = false`" serve.

Passos numerados, uma ação por passo, com os dados exatos. Inclua a requisição inteira:

```
3. POST /v1/transactions
   {
     "account_id": "8f3e...",
     "type": "expense",
     "amount": 200.00,
     "date": "2026-09-10"
   }
```

### Resultado esperado — **sempre citando a fonte**

Este campo é o que transforma opinião em fato:

> **Esperado:** conforme o README, seção Transações — *"Ao excluir uma transação, o saldo
> da conta deve ser revertido"* — o saldo da conta deveria voltar de R$ 300,00 para
> R$ 500,00.

Com a citação, o dev não tem como responder "é assim mesmo". Sem ela, vira discussão de
achismo — e você perde, porque ele escreveu o código.

### Resultado atual

O que aconteceu de verdade: status code, corpo da resposta, e o dado do banco se for o
caso. Colado, não parafraseado.

### Evidência

Print do Postman com requisição e resposta; print da query com o resultado; trecho do log
da aplicação se houver erro. Evidência é o que faz o ticket sobreviver a "aqui funciona".

---

## 3. Severidade × Prioridade

A confusão mais comum da profissão, e a pergunta mais provável da sua entrevista.

| | Mede | Quem decide |
| --- | --- | --- |
| **Severidade** | O tamanho do estrago técnico | **QA** |
| **Prioridade** | A urgência de corrigir | **PO** |

### Escala de severidade neste projeto

| Nível | Quando | Exemplo |
| --- | --- | --- |
| **Crítica** | Perda ou vazamento de dados, sistema fora, brecha de segurança | Usuário A vê contas do usuário B |
| **Alta** | Regra de negócio principal quebrada, sem contorno | Saldo calculado errado |
| **Média** | Funcionalidade quebrada com contorno, ou regra secundária | Filtro por tipo ignora o parâmetro |
| **Baixa** | Cosmético, mensagem confusa, caso raro | Mensagem de erro sem acento |

### Por que são independentes

| Situação | Sev | Pri |
| --- | --- | --- |
| Vazamento de dados entre usuários | Crítica | Crítica |
| Saldo errado num caso raríssimo de transferência agendada | Alta | Média |
| Nome da empresa escrito errado na resposta da API pública | Baixa | **Alta** |
| Crash num endpoint que ninguém usa há dois anos | Alta | Baixa |

**Como justificar a sua severidade** — duas frases:

> **Severidade: Alta.** O saldo fica permanentemente incorreto e não há como o usuário
> corrigir pela aplicação. Afeta todo usuário que excluir uma despesa, que é uma operação
> de uso diário.

Impacto + abrangência. É isso que sustenta a nota quando o dev discorda.

---

## 4. O ciclo de vida do defeito

```
       ┌───────────────── Reopened ◄────────────┐
       ▼                                        │ reteste reprovou
      New ──► Open ──► In Progress ──► Ready for Retest ──► Closed
               │                                              ▲
               ├──► Won't Fix ────────────────────────────────┤
               ├──► Duplicate ────────────────────────────────┤
               └──► Cannot Reproduce ─────────────────────────┘
```

**As três regras que você não quebra:**

1. **Só QA fecha bug.** O dev move para *Ready for Retest*. Se ele fechar, você reabre.
2. **Reteste é executar os passos originais, na build nova.** Não é "perguntar se
   arrumou", não é "olhar o código da correção".
3. **Depois do reteste vem a regressão.** Correção conserta uma coisa e quebra outra —
   isso é a regra, não a exceção. Módulo 10.

### Quando o dev recusa

**"Cannot reproduce."** Na maioria das vezes falta informação no seu report, ou vocês
estão em builds diferentes. Não brigue: acrescente a informação que faltava, confirme a
branch e o commit, grave um vídeo se precisar, e devolva. Se depois disso continuar
irreproduzível, pode ser bug intermitente — e aí o próprio fato de ser intermitente é
informação valiosa.

**"É comportamento esperado."** Aqui você não cede sem argumento. Volte com a citação:

> O critério de aceite da FIN-15 diz *"o saldo das duas contas deve permanecer
> inalterado"*. O saldo da conta de origem mudou. Se o comportamento correto é outro, o
> critério de aceite precisa ser atualizado pela Renata — nesse caso, movo para
> *Won't Fix* e abro uma task de ajuste de requisito.

Sem rispidez, sem recuo. Você não está defendendo o seu ego; está defendendo o requisito.
Se a Renata decidir que o comportamento é aceitável, ótimo: vira *Won't Fix* com
justificativa registrada, e isso é uma decisão de negócio legítima, não uma derrota.

**"Isso é melhoria, não bug."** Às vezes é verdade. Se a regra não está escrita em lugar
nenhum, o dev tem razão — o ticket certo é uma story de melhoria. Aprender a diferença
entre "está errado" e "podia ser melhor" é sinal de maturidade.

---

## 5. Exemplo completo, em inglês

> **Title:** Account balance is not restored after deleting an expense transaction
>
> **Environment:** `build/sprint-3`, commit `a1b2c3d` · `http://localhost:3000/v1` ·
> PostgreSQL `finance_db` (local) · 2026-09-24, 14:30
>
> **Preconditions:**
> 1. User `qa@teste.com` authenticated with a valid access token
> 2. Checking account "Conta Corrente" (`id: 8f3e...`) with balance **500.00** and
>    `allow_negative = false`
>
> **Steps to reproduce:**
> 1. `POST /v1/transactions` with `{"account_id": "8f3e...", "type": "expense",
>    "amount": 200.00, "date": "2026-09-24"}` → returns 201
> 2. `GET /v1/accounts` → account balance is **300.00** (correct)
> 3. `DELETE /v1/transactions/<id from step 1>` → returns 204
> 4. `GET /v1/accounts`
>
> **Expected result:** per the README, Transactions section — *"Ao excluir uma transação,
> o saldo da conta deve ser revertido"* — the balance should return to **500.00**.
>
> **Actual result:** the balance remains **300.00**.
>
> ```json
> { "id": "8f3e...", "name": "Conta Corrente", "balance": "300.00" }
> ```
>
> Confirmed in the database — the stored balance does not match the sum of active
> confirmed transactions:
>
> ```sql
> SELECT a.name, a.balance,
>        COALESCE(SUM(CASE WHEN t.type='income' THEN t.amount ELSE -t.amount END), 0) AS computed
> FROM accounts a
> LEFT JOIN transactions t ON t.account_id = a.id AND t.status='confirmed' AND t.deleted_at IS NULL
> WHERE a.id = '8f3e...'
> GROUP BY a.id, a.name, a.balance;
> ```
> → `balance = 300.00`, `computed = 500.00`
>
> The transaction row is correctly soft-deleted (`deleted_at` is set), so the reversal
> step is the one failing.
>
> **Severity: High.** The balance becomes permanently incorrect with no way for the user
> to fix it through the application. It affects every user who deletes an expense, which
> is a daily operation.
>
> **Priority (suggested): High.**
> **Frequency:** always.
> **Related story:** FIN-18 · **Test case:** CT-031

Repare no que esse report faz: cita a regra, prova pelo banco, isola qual etapa falhou
(*o soft delete funcionou, a reversão não*), e justifica a severidade com impacto e
abrangência. **Isolar a etapa que falhou economiza uma hora do dev** — e é isso que faz
um QA ser chamado para as conversas importantes.

---

## 6. Sua vez

1. Execute os casos da Sprint 3 na build `build/sprint-3`.
2. Para cada falha, abra o bug no Jira **em inglês**, usando
   `qa-course/templates/bug-report.md`, com evidência e validação no banco quando
   envolver dinheiro.
3. Salve as cópias em `qa-course/sprints/sprint-3/entregas/08-bugs/`.
4. `/qa-curso revisar qa-course/sprints/sprint-3/entregas/08-bugs/` — eu reviso com rigor.
5. `/qa-curso triagem` — eu viro o Marcelo. Traga um bug por vez e defenda.
6. Quando ele liberar a correção, **reteste** e mova para Closed ou Reopened.

**Aviso:** o Marcelo vai recusar pelo menos um dos seus bugs. Pode ser porque o report
está incompleto, pode ser porque ele acha que é comportamento esperado. Faz parte. Não
aceite calado nem discuta no impulso — volte com a regra na mão.

---

## 7. Como a IA ajuda aqui

**O melhor uso, disparado: revisar o seu report antes de publicar.**

> Sou QA. Revise este bug report como se fosse o desenvolvedor que vai recebê-lo. O que
> está faltando para você conseguir reproduzir sem me perguntar nada? *(cole o report)*

Ela aponta o passo vago, a pré-condição ausente, o resultado esperado sem fonte. É uma
segunda leitura de graça, e evita metade dos "cannot reproduce". **Adote isso como
hábito permanente** — QA sênior faz.

**Escrever em inglês.** Ela traduz e corrige o tom. Bug report tem um registro próprio —
impessoal, direto, sem "I think" — e ela acerta esse registro. Peça: *"reescreva em inglês
técnico de bug report, tom neutro e objetivo"*. Leia a saída e aprenda os padrões; a ideia
é que daqui a três meses você escreva direto.

**Sugerir causa raiz.** Cole o trecho do serviço e o sintoma: *"por que o saldo não seria
revertido nessa função?"*. Frequentemente ela acerta a linha. Isso te dá um report muito
mais forte — mas **cuidado com o tom**: escreva "a reversão parece não tratar despesas" e
não "você errou na linha 279". Você aponta o comportamento; a causa é território do dev, e
invadir isso azeda a relação rápido.

**Onde ela atrapalha, e é grave:**

- **Ela não decide severidade.** Não conhece o seu negócio, o seu usuário, o seu contrato.
  Vai chutar "Média" para quase tudo. Severidade é julgamento profissional — é seu, e é
  parte do que a empresa está pagando.
- **Ela infla o texto.** Bug report gerado por IA vem com introdução, "resumo executivo" e
  parágrafo de conclusão. Dev não lê isso. Corte tudo que não ajuda a reproduzir.
- **Ela inventa detalhe.** Se você não der o status code exato, ela escreve um plausível.
  Um número inventado no campo "resultado atual" destrói a credibilidade do ticket inteiro.
- **Ela não reproduz.** Nunca abra bug baseado em suposição da IA sobre o código. Só se
  reporta o que se viu acontecer.

**A divisão certa:** você observa, reproduz, julga a severidade e cita a regra. A IA
revisa a clareza e ajusta o inglês. As duas coisas que importam — *aconteceu* e *quanto
importa* — continuam suas.

---

## 8. Vocabulário

| Inglês | Significa |
| --- | --- |
| **steps to reproduce** | passos para reproduzir |
| **expected / actual result** | resultado esperado / obtido |
| **severity / priority** | severidade / prioridade |
| **cannot reproduce** | não foi possível reproduzir |
| **won't fix** | não será corrigido |
| **duplicate** | duplicado |
| **root cause** | causa raiz |
| **workaround** | contorno provisório |
| **triage** | triagem |
| **reopen** | reabrir |
| **attachment / evidence** | anexo / evidência |

---

Fim da Sprint 3. Rode `/qa-curso retro`.

Próximo: `/qa-curso modulo 9` — Teste exploratório e transição de estados.
