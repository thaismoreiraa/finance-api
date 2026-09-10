# Módulo 07 — SQL para QA

**Sprint 3 · ~5 horas**

---

## Por que isso importa

A API te devolve o que ela **acha** que aconteceu. O banco te mostra o que **realmente**
aconteceu. Quando os dois discordam, você achou um bug — e às vezes um bug grave que
ninguém veria pela tela.

É também o item mais cobrado em entrevista de QA júnior depois de Postman. E a pergunta
é sempre a mesma: *"você cadastrou um usuário pela aplicação. Como confirma no banco que
foi criado corretamente?"*. No fim deste módulo você responde isso com a query pronta.

---

## 1. Conectando

Instale o **DBeaver** (grátis) e crie uma conexão PostgreSQL:

| Campo | Valor |
| --- | --- |
| Host | `localhost` |
| Porta | `5432` |
| Database | `finance_db` |
| Usuário | `postgres` |
| Senha | `postgres` |

Ao conectar, abra **Databases → finance_db → Schemas → public → Tables**. Estão lá as
oito tabelas: `users`, `accounts`, `categories`, `transactions`, `budgets`, `goals`,
`recurrences`, `audit_logs`.

---

## 2. SELECT — lendo dados

Toda consulta tem a mesma espinha:

```sql
SELECT  quais colunas
FROM    qual tabela
WHERE   qual condição;
```

```sql
SELECT * FROM accounts;
```

O `*` traz todas as colunas. Serve para explorar, mas na prática você escolhe:

```sql
SELECT name, type, balance, allow_negative
FROM accounts;
```

**Ordenando e limitando** — na prática, sempre:

```sql
SELECT name, balance, created_at
FROM accounts
ORDER BY created_at DESC
LIMIT 10;
```

`ORDER BY ... DESC` = do mais recente para o mais antigo. **Este é o comando que você mais
vai usar no dia a dia**: cadastrei alguma coisa pela API, quero ver se chegou.

---

## 3. WHERE — filtrando

```sql
SELECT name, email, created_at
FROM users
WHERE email = 'qa@teste.com';
```

### Os operadores que importam

| Operador | Para quê | Exemplo |
| --- | --- | --- |
| `=` `<>` | Igual, diferente | `WHERE type = 'expense'` |
| `>` `<` `>=` `<=` | Comparação | `WHERE amount >= 100` |
| `AND` `OR` | Combinar condições | `WHERE type = 'expense' AND amount > 500` |
| `IN` | Está em uma lista | `WHERE status IN ('scheduled', 'pending')` |
| `BETWEEN` | Faixa, inclusiva nas pontas | `WHERE date BETWEEN '2026-01-01' AND '2026-01-31'` |
| `LIKE` / `ILIKE` | Texto parecido (`ILIKE` ignora maiúsculas) | `WHERE description ILIKE '%mercado%'` |
| `IS NULL` / `IS NOT NULL` | Vazio ou não | `WHERE deleted_at IS NULL` |

No `LIKE`, o `%` é "qualquer coisa": `'%mercado%'` acha em qualquer posição, `'mercado%'`
só no começo.

### NULL — a pegadinha que derruba QA em entrevista

`NULL` não é zero nem string vazia: é **ausência de valor**. E por isso:

```sql
WHERE deleted_at = NULL     -- ERRADO: nunca retorna nada
WHERE deleted_at IS NULL    -- certo
```

Comparação com NULL nunca dá verdadeiro, nem `= NULL`, nem `<> NULL`. Sempre `IS NULL` /
`IS NOT NULL`.

### `deleted_at IS NULL` — a linha que você vai escrever mil vezes

Este sistema usa **soft delete**: excluir não apaga a linha, só preenche `deleted_at`
com a data. O registro continua lá.

Consequências diretas para você:

```sql
-- Contas ATIVAS (o que a API deve listar)
SELECT name, balance FROM accounts WHERE deleted_at IS NULL;

-- Contas EXCLUÍDAS (não deveriam aparecer em lugar nenhum da API)
SELECT name, deleted_at FROM accounts WHERE deleted_at IS NOT NULL;
```

**Dois cenários de teste que nascem daí, e valem por dez:**

1. Excluí pela API. A linha ainda existe no banco com `deleted_at` preenchido? *(se
   sumiu de verdade, a regra de soft delete foi violada — é bug)*
2. O registro excluído **ainda aparece** em alguma listagem, soma ou relatório da API?
   *(se aparece, faltou o filtro em algum lugar — é bug, e é do tipo que passa despercebido)*

Toda vez que você olhar uma listagem desta API, pergunte: *"essa query filtrou o soft
delete?"*.

---

## 4. Funções de agregação — contando e somando

| Função | Faz |
| --- | --- |
| `COUNT(*)` | Conta linhas |
| `SUM(coluna)` | Soma |
| `AVG(coluna)` | Média |
| `MIN` / `MAX` | Menor / maior |

```sql
SELECT COUNT(*) FROM transactions WHERE deleted_at IS NULL;

SELECT SUM(amount) AS total_despesas
FROM transactions
WHERE type = 'expense'
  AND status = 'confirmed'
  AND deleted_at IS NULL;
```

`AS` dá um apelido à coluna do resultado. Use sempre — deixa o resultado legível.

---

## 5. GROUP BY — agregando por grupo

`SUM` sozinho dá um número. `GROUP BY` dá um número **por grupo**:

```sql
SELECT type, COUNT(*) AS quantidade, SUM(amount) AS total
FROM transactions
WHERE deleted_at IS NULL
GROUP BY type;
```

```
 type     | quantidade | total
----------+------------+----------
 income   |         12 |  8500.00
 expense  |         47 |  6230.50
 transfer |          4 |  1200.00
```

**A regra do GROUP BY:** toda coluna do `SELECT` ou está no `GROUP BY`, ou está dentro de
uma função de agregação. Errou isso, o Postgres reclama.

### HAVING — filtrando o resultado da agregação

`WHERE` filtra **linhas antes** de agrupar. `HAVING` filtra **grupos depois**:

```sql
SELECT account_id, COUNT(*) AS qtd, SUM(amount) AS total
FROM transactions
WHERE deleted_at IS NULL AND type = 'expense'
GROUP BY account_id
HAVING SUM(amount) > 1000;
```

*"Contas cujo total de despesas passou de mil"*. Essa diferença é pergunta de entrevista.

---

## 6. JOIN — juntando tabelas

A tabela `transactions` guarda `account_id`, não o nome da conta. Para ver o nome, junte
as tabelas.

### INNER JOIN — só o que casa dos dois lados

```sql
SELECT t.date, t.type, t.amount, a.name AS conta, c.name AS categoria
FROM transactions t
INNER JOIN accounts a ON a.id = t.account_id
INNER JOIN categories c ON c.id = t.category_id
WHERE t.deleted_at IS NULL
ORDER BY t.date DESC;
```

`transactions t` dá o apelido `t` à tabela. `ON a.id = t.account_id` é a costura entre elas.

**Cuidado, e isso é armadilha real:** `category_id` pode ser nulo, e o `INNER JOIN` com
`categories` **descarta** as transações sem categoria. Se você usar essa query para
conferir um total, o número vai vir menor e você vai reportar um bug que não existe.

### LEFT JOIN — tudo da esquerda, com ou sem par

```sql
SELECT t.date, t.amount, a.name AS conta, c.name AS categoria
FROM transactions t
INNER JOIN accounts a ON a.id = t.account_id
LEFT JOIN categories c ON c.id = t.category_id
WHERE t.deleted_at IS NULL;
```

Agora vêm todas as transações; as sem categoria mostram `categoria = NULL`.

**A regra prática:** se o campo é obrigatório, `INNER JOIN`. Se pode ser nulo, `LEFT JOIN`.
Errar isso é a causa número um de "conferência que não bate".

---

## 7. Subquery

Uma consulta dentro da outra:

```sql
-- Contas que nunca tiveram transação
SELECT name, balance
FROM accounts
WHERE deleted_at IS NULL
  AND id NOT IN (
    SELECT DISTINCT account_id FROM transactions WHERE deleted_at IS NULL
  );
```

Essas contas são as únicas que podem ser excluídas sem `409` — ou seja, esta query monta
sua massa de teste de exclusão em um segundo.

---

## 8. As queries que você vai usar no dia a dia

Guarde este bloco. É o seu kit de validação.

**1. O registro que criei chegou mesmo?**

```sql
SELECT id, name, email, currency, created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;
```

**2. Conciliação de saldo — a mais importante do curso**

O `balance` da conta é um campo guardado. As transações são a verdade. Os dois têm que
bater:

```sql
SELECT
  a.name,
  a.balance AS saldo_registrado,
  COALESCE(SUM(
    CASE
      WHEN t.type = 'income'  THEN  t.amount
      WHEN t.type = 'expense' THEN -t.amount
      ELSE 0
    END
  ), 0) AS soma_das_transacoes
FROM accounts a
LEFT JOIN transactions t
  ON t.account_id = a.id
  AND t.status = 'confirmed'
  AND t.deleted_at IS NULL
WHERE a.deleted_at IS NULL
GROUP BY a.id, a.name, a.balance;
```

> `CASE WHEN` é um "se" dentro da query: receita soma, despesa subtrai.
> `COALESCE(x, 0)` troca NULL por zero — conta sem transação nenhuma somaria NULL.
>
> Nota: esta query não considera o `initial_balance` nem as transferências. Adaptá-la para
> incluir os dois é parte do seu exercício.

Rode isso depois de cada bloco de testes de transação. Quando as duas colunas divergirem,
você tem em mãos um bug de alta severidade com evidência pronta.

**3. As duas pernas da transferência existem?**

```sql
SELECT id, account_id, type, amount, transfer_pair_id, deleted_at
FROM transactions
WHERE transfer_pair_id IS NOT NULL
ORDER BY created_at DESC;
```

Toda transferência deve produzir **duas** linhas apontando uma para a outra.

**4. A auditoria foi registrada?**

```sql
SELECT table_name, record_id, action, created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 10;
```

O README manda toda edição e exclusão de transação gerar um registro aqui. Confira depois
de cada `PATCH` e cada `DELETE` — **este é um bug que não tem sintoma nenhum pela API**.
Só o banco conta.

Para ver o que mudou:

```sql
SELECT action, old_data->>'amount' AS valor_antigo, new_data->>'amount' AS valor_novo
FROM audit_logs
WHERE table_name = 'transactions'
ORDER BY created_at DESC;
```

`->>` extrai um campo de dentro de uma coluna JSON.

**5. Vazamento entre usuários**

```sql
SELECT u.email, COUNT(a.id) AS contas
FROM users u
LEFT JOIN accounts a ON a.user_id = u.id AND a.deleted_at IS NULL
GROUP BY u.email;
```

Cruze com o que a API devolveu para cada usuário. Os números têm que bater exatamente.

---

## 9. Sua vez

Crie massa: **dois usuários**, com contas, categorias e transações variadas, incluindo
transferências e valores com centavos.

Em `qa-course/sprints/sprint-3/entregas/07-sql.md`, escreva a query que responde a cada
pergunta, com o resultado obtido:

1. Todas as transações confirmadas do último mês, com nome da conta e da categoria.
2. Total gasto por categoria no mês, do maior para o menor.
3. Categorias com mais de R$ 500 gastos no mês. *(HAVING)*
4. Contas cujo `balance` **não bate** com a soma das transações. *(adapte a query 2,
   incluindo o saldo inicial e as transferências)*
5. Transações excluídas nos últimos 7 dias, com quem excluiu e quando.
6. Transferências cuja perna oposta não existe ou está excluída.
7. Todas as transações de um usuário que estejam em contas de **outro** usuário.
   *(o resultado correto é: nenhuma)*
8. Orçamentos do mês com o valor gasto real ao lado do valor orçado.

Depois:

9. Execute os seus casos de teste da Sprint 3 pela API e, para cada um que mexa em
   dinheiro, **valide no banco**. Anexe a query e o resultado como evidência.

**A regra da Sprint 3:** nenhum caso de teste que envolva saldo é dado como "Passou" sem
conferência no banco. Resposta 200 da API não é prova de nada.

---

## 10. Como a IA ajuda aqui

SQL é onde a IA mais nivela o jogo para QA — porque escrever query é sintaxe, e sintaxe é
o que ela faz melhor.

**Ela é excelente em:**

> Tenho uma tabela `transactions` com colunas `account_id`, `type` ('income'/'expense'),
> `amount`, `status`, `deleted_at`, e uma tabela `accounts` com `id`, `name`, `balance`.
> Escreva uma query que mostre as contas cujo campo balance não bate com a soma das
> transações confirmadas.

Ela devolve a query com `CASE WHEN`, `COALESCE` e `GROUP BY` corretos. Um QA júnior levaria
uma hora nisso e erraria três vezes.

Também é ótima para **explicar query alheia** (cole e peça para explicar linha a linha) e
para **corrigir erro de sintaxe** (cole a mensagem do Postgres).

**Onde ela erra:**

- **Inventa colunas.** Se você não passar o schema exato, ela chuta `deleted` em vez de
  `deleted_at`, `value` em vez de `amount`. **Sempre cole a estrutura real da tabela** —
  isso resolve 80% dos erros.
- **Esquece o soft delete.** Ela não sabe que este sistema usa `deleted_at`, a não ser
  que você diga. Query sem esse filtro conta linha excluída e o número vem errado — e você
  reporta bug que não existe.
- **Confunde INNER com LEFT JOIN.** O erro mais silencioso de todos: a query roda, devolve
  número, e o número está errado por omissão.

**A regra de ouro, e não é negociável:** nunca rode em banco de produção uma query que
você não entende. Um `UPDATE` ou `DELETE` sugerido por IA, rodado sem `WHERE` correto,
apaga dados de cliente. **Em produção, QA só roda `SELECT`.** Se precisar alterar dado,
peça para quem tem responsabilidade por aquilo.

**Como validar uma query que a IA escreveu, mesmo sem dominar SQL:**

1. Rode primeiro sem filtro e veja quantas linhas voltam no total.
2. Rode a query dela e compare a quantidade — faz sentido?
3. Pegue **uma linha** do resultado e confira na mão, na tabela original.
4. Se envolve JOIN, confirme se o campo pode ser nulo.

Esse ritual de quatro passos é o que separa quem usa IA com segurança de quem reporta bug
falso com confiança.

---

## 11. Vocabulário

| Inglês | Significa |
| --- | --- |
| **query** | consulta |
| **row / record** | linha / registro |
| **table** | tabela |
| **join** | junção |
| **primary key / foreign key** | chave primária / estrangeira |
| **soft delete** | exclusão lógica |
| **constraint** | restrição imposta pelo banco |
| **aggregate function** | função de agregação |
| **subquery** | consulta aninhada |
| **reconciliation** | conciliação — conferir se dois números batem |

---

Próximo: `/qa-curso modulo 8` — Bug report e ciclo de vida do defeito.
