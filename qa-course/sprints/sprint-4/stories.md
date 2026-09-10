# Sprint 4 — Stories

> Escritas pela **Renata (PO)**.

---

## FIN-21 — Definir orçamento por categoria

**Como** usuário
**quero** definir quanto pretendo gastar por categoria no mês
**para** me controlar.

**Notas da PO:** um orçamento por categoria por mês. Não faz sentido ter dois orçamentos
para "Alimentação" em março.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-22 — Acompanhar o orçamento

**Como** usuário
**quero** ver quanto já gastei do que planejei
**para** saber se posso gastar mais.

**Notas da PO:** quero ver quanto gastei, quanto sobra e a porcentagem. E quando eu chegar
perto do limite, o sistema tem que me avisar. A pessoa configura a partir de quantos por
cento quer ser avisada.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-23 — Criar uma meta de economia

**Como** usuário
**quero** definir uma meta de dinheiro guardado
**para** juntar para uma viagem.

**Notas da PO:** a pessoa define o valor alvo e pode colocar uma data limite. Vai
guardando aos poucos.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-24 — Depositar na meta

**Como** usuário
**quero** registrar quanto guardei
**para** ver meu progresso.

**Notas da PO:** quando chegar no valor da meta, o sistema marca como concluída
automaticamente. É legal ver a barrinha enchendo.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-25 — Contas que se repetem todo mês

**Como** usuário
**quero** cadastrar as contas fixas
**para** não ter que lançar aluguel e luz todo mês na mão.

**Notas da PO:** pode ser diária, semanal, mensal ou anual. Ao cadastrar, já lança a
primeira.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-26 — Alterar uma conta recorrente

**Como** usuário
**quero** mudar o valor de uma conta fixa
**para** quando o aluguel reajustar.

**Notas da PO:** essa é a parte chata. Às vezes eu quero mudar só aquele mês, às vezes
daquele mês em diante, às vezes tudo. O Marcelo chamou isso de `update_scope`, com três
opções.

**Critérios de aceite:** *a definir no refinement*

---

## Antes do refinement

- O alerta dispara **em** 80% ou **acima** de 80%? Pergunte com essas palavras.
- Dá para configurar alerta em 0%? Em 100%? Em 150%?
- O que acontece com `remaining` quando eu estouro o orçamento?
- O orçamento cobre o mês inteiro? Do dia 1 ao último dia? E fevereiro?
- Transferência entra na conta do orçamento?
- Transação agendada conta como gasto antes de confirmar?
- Depósito que atinge **exatamente** o valor da meta: completa ou não?
- Meta completa: dá para depositar mais? Dá para aumentar o alvo? Volta a ficar ativa?
- Depósito com valor zero? Negativo?
- Meta com prazo vencido — muda alguma coisa?
- `this_and_future` mexe em transação já confirmada do passado?
- Excluir uma recorrência: as transações já geradas somem também?
