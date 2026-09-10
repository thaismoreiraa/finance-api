# Sprint 5 — Stories

> Escritas pela **Renata (PO)**.

---

## FIN-27 — Resumo do mês

**Como** usuário
**quero** ver um resumo do meu mês
**para** entender se sobrou ou faltou dinheiro.

**Notas da PO:** total que entrou, total que saiu, o saldo do período, e a divisão por
categoria. Transferência não é entrada nem saída — cuidado com isso.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-28 — Fluxo de caixa

**Como** usuário
**quero** ver a evolução do meu dinheiro ao longo dos meses
**para** saber se estou melhorando.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-29 — Exportar meus dados

**Como** usuário
**quero** baixar meus lançamentos
**para** guardar ou mandar para o contador.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-30 — Histórico de alterações

**Como** usuário
**quero** saber o que foi alterado ou apagado nos meus lançamentos
**para** entender o que aconteceu quando algo não bater.

**Notas da PO:** isso é exigência jurídica. Toda edição e toda exclusão de lançamento tem
que ficar registrada, com o que era antes e o que ficou depois.

**Critérios de aceite:** *a definir no refinement*

---

## Antes do refinement

- Transferência entra no total de despesas do resumo? *(a Renata já disse que não — prove)*
- Transação agendada entra no relatório do mês em que foi agendada?
- Transação excluída sai do relatório retroativamente?
- Mês sem nenhuma transação: erro ou resumo zerado?
- A soma das categorias bate com o total geral?
- Transação sem categoria aparece onde no relatório por categoria?
- O relatório respeita o fuso horário? Transação do dia 1 às 00:30 cai em qual mês?
- A exportação traz as transações excluídas?
- A exportação de um usuário traz dados de outro?
- Existe endpoint para consultar a auditoria, ou só dá para ver no banco?
- A auditoria registra a exclusão? *(confira no banco, não na API)*

E a pergunta que vale a sprint inteira: **o que acontece se eu usar o token do usuário A
com o id de um recurso do usuário B?** Teste isso em todos os endpoints, não só em um.
