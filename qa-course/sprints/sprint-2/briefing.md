# Sprint 2 — Contas e Categorias

**Duração:** 2 semanas · **Módulos:** 05, 06

---

## Contexto

> **Paula:** Sprint dois. Agora entra código novo, então você vai receber build para
> testar de verdade.
>
> **Marcelo (Dev):** Terminei contas e categorias. Está na branch `build/sprint-2`. Fiz
> os testes automatizados, então acho que está tranquilo — mas dá uma olhada aí.
>
> **Renata (PO):** Contas é a base de tudo. Se o saldo estiver errado aqui, todo o resto
> desanda. E categoria eu quero bem amarrado: não pode misturar categoria de gasto com
> entrada de dinheiro, senão o relatório vira uma sopa.

**Tradução:** primeira build com defeito. Eles não são difíceis — se você escrever bons
casos de teste e executá-los com atenção, você acha. É de propósito: a sprint 2 é para
ganhar confiança.

---

## Objetivos

1. Aplicar as técnicas de teste na prática *(Módulo 05)*
2. Escrever casos de teste que outra pessoa consegue executar *(Módulo 06)*
3. Executar na build e registrar no Qase
4. Abrir os primeiros bugs no Jira e rodar o ciclo até Closed

## Como pegar a build

```bash
git switch build/sprint-2
git pull
npm run migration:run
npm run dev
```

**Confira em qual branch você está antes de reportar qualquer coisa.** Reportar bug que
só existe porque você estava na branch errada é o vexame clássico do QA júnior.

## Entregas

| # | Entrega | Arquivo |
| --- | --- | --- |
| 1 | Técnicas aplicadas: partições, limites, tabela de decisão, error guessing, caixa-branca | `entregas/05-tecnicas.md` |
| 2 | Lista de cenários (mínimo 20) | `entregas/06-cenarios.md` |
| 3 | Oito casos de teste completos, escritos à mão | `entregas/06-casos-contas.md` |
| 4 | Critérios de aceite em Given/When/Then de duas stories | `entregas/06-criterios.md` |
| 5 | Bugs reportados (cópia dos tickets) | `entregas/bugs/` |
| 6 | Test Run do Qase exportado | `entregas/test-run-sprint-2.pdf` |

## Definition of Done

- [ ] Todos os critérios de aceite têm pelo menos um caso de teste
- [ ] Casos cadastrados no Qase e vinculados às stories
- [ ] Test Run executado com resultado registrado
- [ ] Todo caso que falhou virou bug com evidência
- [ ] Nenhum bug de severidade Alta em aberto ao fim da sprint
- [ ] Bugs corrigidos foram retestados **por você** e fechados **por você**

## Regra da sprint

Os oito casos de teste da entrega 3 são escritos **por você, à mão**. Sem IA. A partir da
Sprint 3 a IA entra na formatação — e a gente compara a qualidade das duas.
