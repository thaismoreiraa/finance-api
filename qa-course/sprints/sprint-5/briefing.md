# Sprint 5 — Relatórios, Auditoria e Fechamento

**Duração:** 2 semanas · **Módulo:** 11

---

## Contexto

> **Renata:** Última sprint antes do lançamento. Os relatórios são o que a pessoa mostra
> para o cônjuge no fim do mês, então precisam estar certos. E a auditoria é exigência
> legal — se um cliente reclamar que sumiu lançamento, a gente tem que conseguir provar o
> que aconteceu.
>
> **Paula:** Depois desta sprint vai o relatório final de testes para a diretoria. É a
> sua recomendação de liberar ou não que vai na mesa.
>
> **Marcelo:** `build/sprint-5`. Relatórios, exportação e a parte de auditoria.

**Tradução:** esta sprint tem o bug mais grave do curso inteiro, e ele é do tipo que
**quase nenhum QA júnior encontra** — porque exige testar com dois usuários e pensar em
autorização, não só em funcionalidade.

Tem também um defeito **invisível pela API**. Só o banco conta.

---

## Objetivos

1. Testar relatórios e agregações
2. Validar a auditoria pelo banco
3. Teste de volume com massa grande *(Módulo 11)*
4. Regressão completa antes da liberação
5. Relatório final e portfólio

## Como pegar a build

```bash
git switch build/sprint-5
git pull
npm run migration:run
npm run dev
```

## Entregas

| # | Entrega | Arquivo |
| --- | --- | --- |
| 1 | Casos de relatórios, com conferência SQL de cada número | `entregas/casos-relatorios.md` |
| 2 | Validação da auditoria pelo banco | `entregas/auditoria.md` |
| 3 | Teste de volume: tempos antes e depois de 10 mil transações | `entregas/11-performance.md` |
| 4 | Execução da regressão completa | `entregas/11-regressao-final/` |
| 5 | **Relatório final consolidando as 5 sprints** | `entregas/RELATORIO-FINAL.md` |
| 6 | **Portfólio** | `qa-course/PORTFOLIO.md` |
| 7 | Pull Request aberto no GitHub | link no portfólio |

## Definition of Done

- [ ] Todo número de relatório conferido por query SQL independente
- [ ] Auditoria validada no banco para edição **e** exclusão
- [ ] Teste de volume executado com números registrados
- [ ] Suíte de regressão completa executada nesta build
- [ ] Relatório final com recomendação de liberação **justificada**
- [ ] Seção honesta de riscos e do que não foi testado
- [ ] Portfólio escrito e PR aberto

## A última dica que você recebe neste curso

Antes de escrever a recomendação de liberação, pare e pergunte: **"eu testei este sistema
como se fosse outra pessoa usando?"**

Não "eu testei tudo que estava no plano". Outra pessoa. Outro usuário. Outra conta.
