# Sprint 3 — Stories

> Escritas pela **Renata (PO)**.

---

## FIN-14 — Registrar entrada e saída de dinheiro

**Como** usuário
**quero** lançar o que entrou e o que saiu
**para** acompanhar meu dinheiro.

**Notas da PO:** o valor sempre positivo, e a pessoa escolhe se é entrada ou saída. O
saldo da conta tem que atualizar na hora.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-15 — Transferir entre minhas contas

**Como** usuário
**quero** mover dinheiro de uma conta para outra
**para** registrar quando tiro da poupança para a corrente.

**Notas da PO:** isso não é gasto nem ganho, é só mudança de lugar. Não pode aparecer
como despesa no relatório do mês, senão parece que gastei duas vezes.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-16 — Agendar um lançamento futuro

**Como** usuário
**quero** lançar uma conta que ainda vai vencer
**para** me programar.

**Notas da PO:** enquanto não chegou a data, não pode contar no saldo. Quando chega,
conta.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-17 — Corrigir um lançamento

**Como** usuário
**quero** editar uma transação que lancei errado
**para** manter meu controle correto.

**Notas da PO:** se eu lancei 100 e era 150, o saldo tem que refletir os 150. E o
Marcelo falou que fica guardado quem mudou o quê — é importante para a gente conseguir
investigar reclamação de cliente.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-18 — Excluir um lançamento

**Como** usuário
**quero** apagar uma transação lançada por engano
**para** meu saldo ficar certo.

**Notas da PO:** o saldo tem que voltar ao que era. E também tem que ficar registrado que
alguém apagou.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-19 — Buscar e filtrar meus lançamentos

**Como** usuário
**quero** filtrar minhas transações
**para** achar o que procuro sem rolar a lista inteira.

**Notas da PO:** por conta, por categoria, por período, por tipo, e uma busca por texto na
descrição.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-20 — Importar extrato

**Como** usuário
**quero** subir o extrato do banco
**para** não digitar tudo na mão.

**Notas da PO:** o sistema mostra o que vai importar antes de confirmar, e avisa se já
tem alguma transação repetida.

**Critérios de aceite:** *a definir no refinement*

---

## Antes do refinement

- Transferência para a mesma conta de origem e destino — pode?
- Transferência entre contas de moedas diferentes?
- Valor zero? Valor com mais de duas casas decimais? Valor de R$ 999.999.999,99?
- Data de 1900? De 2999? Data inválida como 31/02?
- Editar transferência: edita as duas pernas ou só uma?
- Excluir uma perna da transferência: e a outra?
- Editar uma transação mudando a conta: o saldo das **duas** contas ajusta?
- Transação agendada que teve a data mudada para o passado — o que acontece?
- Excluir transação agendada, que ainda não afetou o saldo — reverte o quê?
- Transferência entre contas com `allow_negative` diferente?
- O que exatamente vai para a auditoria? Dá para consultar por algum endpoint?
