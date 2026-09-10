# Sprint 3 — Transações

**Duração:** 2 semanas · **Módulos:** 07, 08

---

## Contexto

> **Renata:** Chegamos no coração do produto. Transação é o que o usuário faz todo dia, e
> é onde o dinheiro se move. Se der problema aqui, a pessoa desinstala.
>
> **Marcelo:** Essa foi pesada. Transferência gera duas transações espelhadas, editar tem
> que recalcular saldo, excluir tem que reverter, e ainda tem a auditoria. Está na
> `build/sprint-3`. Testei bastante, mas essa parte é complicada mesmo.
>
> **Paula:** Reservei mais tempo de QA nesta sprint. Se precisar de mais, fala na daily.

**Tradução:** os defeitos desta sprint são de **cálculo**. A resposta da API vem 200 ou
201, tudo parece certo, e o número no banco está errado. **Não dá para achar sem SQL.**

---

## Objetivos

1. Aprender SQL do zero e conciliar dados *(Módulo 07)*
2. Escrever bug reports profissionais, em inglês *(Módulo 08)*
3. Rodar o ciclo completo do defeito, incluindo a triagem com o Marcelo
4. Retestar as correções

## Como pegar a build

```bash
git switch build/sprint-3
git pull
npm run migration:run
npm run dev
```

## A regra desta sprint

**Nenhum caso de teste que envolva dinheiro é marcado como "Passou" sem conferência no
banco.** Resposta 201 da API não prova nada sobre o saldo.

Depois de cada bloco de testes, rode a query de conciliação do Módulo 07. Quando as duas
colunas divergirem, você tem um bug de alta severidade com evidência pronta.

## Entregas

| # | Entrega | Arquivo |
| --- | --- | --- |
| 1 | As 9 queries do exercício, com resultados | `entregas/07-sql.md` |
| 2 | Casos de teste de transações | `entregas/casos-transacoes.md` |
| 3 | Bug reports **em inglês**, com evidência de banco | `entregas/08-bugs/` |
| 4 | Registro da triagem: o que foi aceito, recusado e por quê | `entregas/08-triagem.md` |
| 5 | Registro dos retestes com build e commit | `entregas/08-retestes.md` |
| 6 | Test Run do Qase | `entregas/test-run-sprint-3.pdf` |

## Definition of Done

- [ ] Casos cobrindo criação, edição, exclusão, transferência e agendamento
- [ ] Toda validação de dinheiro tem query SQL anexada como evidência
- [ ] Bug reports em inglês, com resultado esperado citando a regra do README
- [ ] Todo bug passou pela triagem
- [ ] Correções retestadas na build correta, com o commit registrado
- [ ] Nenhum bug de severidade Alta em aberto sem aceite explícito da PO

## Sobre a IA nesta sprint

Liberada para: formatação de casos de teste, escrita de SQL, revisão dos bug reports e
tradução para inglês.

Continua sua: decidir o que testar, definir o resultado esperado, julgar severidade, e
executar. Ela nunca marca um caso como "Passou" no seu lugar.
