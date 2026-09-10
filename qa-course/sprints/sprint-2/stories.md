# Sprint 2 — Stories

> Escritas pela **Renata (PO)**.

---

## FIN-06 — Criar conta bancária

**Como** usuário
**quero** cadastrar minhas contas
**para** organizar meu dinheiro por onde ele está.

**Notas da PO:** a pessoa tem conta corrente, poupança, cartão de crédito, investimento e
o dinheiro vivo da carteira. Precisa dar para informar quanto já tem em cada uma quando
cadastra.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-07 — Ver minhas contas e o total

**Como** usuário
**quero** ver todas as minhas contas e quanto tenho no total
**para** saber minha situação de um relance.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-08 — Editar uma conta

**Como** usuário
**quero** corrigir os dados de uma conta
**para** arrumar quando eu errar o cadastro.

**Notas da PO:** dá para mudar o nome, o tipo, a cor, o ícone. O saldo não — o saldo vem
das transações.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-09 — Excluir uma conta

**Como** usuário
**quero** remover uma conta que não uso mais
**para** deixar minha lista limpa.

**Notas da PO:** se a conta já tem movimentação, não pode sumir, senão o histórico
quebra. Tem que dar uma mensagem explicando.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-10 — Contas que podem ficar negativas

**Como** usuário com cartão de crédito
**quero** que algumas contas aceitem saldo negativo
**para** conseguir lançar gastos no cartão.

**Notas da PO:** na conta corrente eu não quero deixar ficar negativo, mas no cartão sim.
Então tem que ser configurável por conta.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-11 — Categorias de receita e despesa

**Como** usuário
**quero** classificar meu dinheiro por categoria
**para** saber para onde ele está indo.

**Notas da PO:** categoria de gasto é uma coisa, categoria de entrada é outra. Não pode
misturar de jeito nenhum — se "Salário" aparecer como despesa no relatório, perdi a
confiança no sistema.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-12 — Subcategorias

**Como** usuário
**quero** ter subcategorias
**para** detalhar melhor. Tipo "Alimentação" com "Mercado" e "Restaurante" dentro.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-13 — Excluir categoria

**Como** usuário
**quero** apagar uma categoria que não uso
**para** manter a lista organizada.

**Notas da PO:** se tem gasto usando aquela categoria, a pessoa precisa reclassificar
antes. Não pode simplesmente sumir e deixar os gastos órfãos.

**Critérios de aceite:** *a definir no refinement*

---

## Antes do refinement

Perguntas que essas stories não respondem — e ninguém vai responder se você não perguntar:

- Duas contas podem ter o mesmo nome?
- Saldo inicial pode ser negativo? E se `allow_negative` for `false`?
- Dá para mudar `allow_negative` de `true` para `false` numa conta que já está negativa?
- Excluir conta com transações: qual código de erro exatamente? *(confira o Swagger)*
- Subcategoria pode ter subcategoria? Quantos níveis?
- Subcategoria pode ser de tipo diferente da categoria pai?
- Excluir categoria que tem subcategorias com transações — o que acontece?
- Categoria excluída ainda aparece em algum lugar da API?

Continue a lista. Cada furo que você deixar passar é um bug que vai nascer.
