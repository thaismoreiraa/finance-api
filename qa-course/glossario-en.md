# Glossário de inglês técnico para QA

Vaga júnior não cobra fluência. Cobra que você **leia documentação sem travar** e
consiga escrever um bug report que um time internacional entenda.

A partir da **Sprint 3**, seus bug reports passam a ser escritos em inglês. Eu corrijo
o inglês junto com o conteúdo.

---

## O essencial (decore estes)

| Inglês | Português | Como aparece |
| --- | --- | --- |
| **expected result** | resultado esperado | *Expected result: the account balance returns to 500.00* |
| **actual result** | resultado obtido | *Actual result: the balance remains at 300.00* |
| **steps to reproduce** | passos para reproduzir | *Steps to reproduce: 1. Create an account…* |
| **severity** | severidade | *Severity: High — data corruption* |
| **priority** | prioridade | *Priority: Medium* |
| **environment** | ambiente | *Environment: local, build/sprint-3* |
| **requirement** | requisito | *This violates the requirement in the Transactions section* |
| **test case** | caso de teste | *Test case TC-014 failed* |
| **test scenario** | cenário de teste | |
| **regression** | regressão | *Run the regression suite before release* |
| **retest** | reteste | *Ready for retest* |
| **defect / bug / issue** | defeito | |
| **root cause** | causa raiz | |
| **workaround** | contorno provisório | *Workaround: create the transaction with yesterday's date* |

## Status de defeito (é assim que aparece no Jira)

| Status | Significa |
| --- | --- |
| **New / Open** | Reportado, ainda não olhado |
| **In Progress** | Dev está corrigindo |
| **Ready for Retest** | Corrigido, aguardando você validar |
| **Closed** | Você validou e está correto |
| **Reopened** | Você validou e continua errado |
| **Won't Fix** | Não vai ser corrigido — decisão de negócio |
| **Cannot Reproduce** | O dev não conseguiu reproduzir *(geralmente culpa do report)* |
| **Duplicate** | Já existe outro ticket para isso |

## Vocabulário de API

| Inglês | Significa |
| --- | --- |
| **endpoint** | o caminho que você chama: `/accounts/:id` |
| **request / response** | requisição / resposta |
| **header** | cabeçalho — onde vai o token |
| **payload / body** | o conteúdo enviado |
| **query parameter** | o que vem depois do `?` na URL |
| **path parameter** | o que faz parte do caminho: o `:id` |
| **status code** | o número da resposta: 200, 404, 422 |
| **authentication** | quem é você |
| **authorization** | o que você pode fazer |
| **token expired** | token vencido |
| **payload too large** | corpo grande demais |
| **rate limit** | limite de chamadas por período |

## Vocabulário de banco

| Inglês | Significa |
| --- | --- |
| **row / record** | linha / registro |
| **table** | tabela |
| **query** | consulta |
| **join** | junção entre tabelas |
| **constraint** | restrição — regra que o banco impõe |
| **foreign key** | chave estrangeira |
| **soft delete** | exclusão lógica — marca como excluído sem apagar |
| **rollback** | desfazer |

## Frases prontas para o dia a dia

- *I couldn't reproduce this on the latest build.* — não consegui reproduzir na build mais recente
- *This is working as expected, per the acceptance criteria.* — está funcionando conforme o critério de aceite
- *Could you clarify what should happen when the destination account doesn't exist?* — pergunta de refinement
- *Blocked by FIN-42 — I can't test this until the login is fixed.* — impedimento na daily
- *This looks like a regression introduced in the last release.* — parece regressão

## Frases de entrevista

- *I'm responsible for writing and executing test cases, reporting defects and validating fixes.*
- *I use boundary value analysis and equivalence partitioning to reduce the number of test cases without losing coverage.*
- *I validate data directly in the database, not only through the API response.*
