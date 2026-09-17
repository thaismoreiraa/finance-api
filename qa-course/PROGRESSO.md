# Progresso

> Arquivo mantido pelo `/qa-curso`. Você pode ler à vontade — e editar, se quiser
> corrigir alguma coisa.

**Ponto atual:** Sprint 1 · Módulo 01 — Fundamentos de QA · ✅ concluído
**Última sessão:** 2026-09-17 — exercício final (sanity × regressão) aceito, módulo 01 encerrado
**Próximo passo:** `/qa-curso modulo 2` — Ágil, Scrum e o QA na sprint

---

## Módulos

| # | Módulo | Status |
| --- | --- | --- |
| 00 | Ambiente e primeiro contato | ✅ concluído |
| 01 | Fundamentos de QA | ✅ |
| 02 | Ágil, Scrum e o QA na sprint | ⬜ |
| 03 | Jira e Qase na prática | ⬜ |
| 04 | API REST e Postman do zero | ⬜ |
| 05 | Técnicas de teste | ⬜ |
| 06 | Casos de teste e critérios de aceite | ⬜ |
| 07 | SQL para QA | ⬜ |
| 08 | Bug report e ciclo de vida do defeito | ⬜ |
| 09 | Teste exploratório e state transition | ⬜ |
| 10 | Reteste, regressão e rastreabilidade | ⬜ |
| 11 | Performance, relatório final e portfólio | ⬜ |

Legenda: ⬜ não iniciado · 🟨 em andamento · ✅ concluído

## Sprints

| Sprint | Área | Status | Bugs achados | Bugs escapados |
| --- | --- | --- | --- | --- |
| 0 | Setup | 🟨 | — | — |
| 1 | Auth + Users | ⬜ | — | — |
| 2 | Accounts + Categories | ⬜ | | |
| 3 | Transactions | ⬜ | | |
| 4 | Budgets, Goals, Recurrences | ⬜ | | |
| 5 | Reports + Auditoria | ⬜ | | |

## Ferramentas configuradas

- [x] Docker Desktop instalado e rodando
- [x] Banco `finance_db` criado e migrado
- [x] API subindo em `localhost:3000`
- [x] Swagger acessível
- [ ] Postman instalado
- [ ] Conta Jira Cloud criada
- [ ] Projeto Jira configurado com workflow de bug
- [ ] Conta Qase criada e integrada ao Jira
- [ ] Cliente SQL (DBeaver ou psql) conectado ao banco
- [x] Git configurado com nome e e-mail

## Entregas

*(preenchido conforme você entrega — arquivo, sprint, data da revisão, veredito)*

| Arquivo | Sprint | Data | Veredito |
| --- | --- | --- | --- |
| `sprints/sprint-1/entregas/00-setup.md` | 0 | 2026-09-14 | aceito — conteúdo correto, mas resultado esperado/observado vago demais ("deu tudo certo"); feedback dado, sem necessidade de reescrever |
| `sprints/sprint-1/entregas/01-fundamentos.md` (itens 1-2) | 1 | 2026-09-14 | aceito após 1 rodada de ajuste — item 1 veio sem exemplo concreto do finance-api (pedido explícito do enunciado), reescreveu com exemplo real (categoria com transações vinculadas); item 2 (erro/defeito/falha) correto de primeira |
| `sprints/sprint-1/entregas/01-fundamentos.md` (checklist de cobertura, `TransactionService.test.js`) | 1 | 2026-09-15 | aceito após 1 rodada de ajuste — 1ª versão tratou nome de teste como "coberto" sem checar corpo (todos os `it()` do arquivo são `// TODO`, vazios); corrigiu para "não vi teste" em todos os 9 pontos. Bônus: levantou sozinha 4 perguntas de regra de negócio não documentadas no README (data futura, edição/exclusão de status, transferência com duas pernas) — guardadas para o refinement da Sprint 3 |
| `sprints/sprint-1/entregas/01-fundamentos.md` (sanity × regressão) | 1 | 2026-09-17 | aceito — exemplo de regressão muito bom (orçamento dependente do saldo da transação); exemplo de sanity indistinguível do reteste na prática, feedback dado, sem necessidade de reescrever (módulo de fundamentos, não é corte rígido) |

## Anotações da retrospectiva

*(o que melhorar na próxima sprint, escrito por você ao fim de cada uma)*
