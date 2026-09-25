# Progresso

> Arquivo mantido pelo `/qa-curso`. Você pode ler à vontade — e editar, se quiser
> corrigir alguma coisa.

**Ponto atual:** Sprint 1 · Módulo 04 🟨 em andamento — bloco 1 de 5 ✅ concluído (anatomia de request/response, métodos, idempotência)
**Última sessão:** 2026-09-25 — `04-postman/01-anatomia.md` aceita na 2ª rodada: fonte do token no Swagger (cadeado), campos obrigatórios × opcionais (inclusive a nuance do PATCH com body obrigatório e campos todos opcionais), tokens mascarados e resultado esperado derivado dos critérios de aceite em vez do texto do Zod.
**Próximo passo:** commitar a pasta `04-postman/`; depois `/qa-curso modulo 4` → bloco 2 (status codes + JWT).

**Plano do Módulo 04 (≈5h, 5 blocos):** 1) API, anatomia, métodos · 2) status codes + JWT · 3) Postman: environment, collection, login que salva token · 4) assertions + as 8 requisições · 5) Collection Runner, export, commit, IA e vocabulário

---

## Módulos

| # | Módulo | Status |
| --- | --- | --- |
| 00 | Ambiente e primeiro contato | ✅ concluído |
| 01 | Fundamentos de QA | ✅ |
| 02 | Ágil, Scrum e o QA na sprint | ✅ |
| 03 | Jira e Qase na prática | ✅ |
| 04 | API REST e Postman do zero | 🟨 bloco 2/5 |
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
| 1 | Auth + Users | 🟨 | — | — |
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
- [x] Conta Jira Cloud criada
- [x] Projeto Jira configurado com workflow de bug
- [x] Conta Qase criada e integrada ao Jira
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
| `sprints/sprint-1/entregas/02-agil.md` | 1 | 2026-09-21 | aceito após 2 rodadas de ajuste — perguntas de refinement fortes desde a 1ª versão (concorrência espontânea, critério pra pular itens do checklist que não se aplicam); INVEST 1ª versão tinha contradição entre E (❌, faltam informações) e T (✅, "com base nos critérios de aceite" que nem existiam ainda) e V só reescrevia o "quero" em vez do "para" — corrigido na 2ª rodada; daily 1ª versão tinha impedimento vago e sem rastreio de story, 2ª rodada copiou meu modelo literalmente (pedi pra não copiar), 3ª versão trouxe cenário e impedimento originais (bug sem causa raiz identificada, troca de moeda no perfil) |
| `sprints/sprint-1/entregas/03-jira.md` | 1 | 2026-09-22 | aceito após 1 rodada de ajuste — board (5 stories na sprint) e árvore de suítes do Qase completos de primeira, workflow do bug com os 9 estados corretos e bônus espontâneo (mapeamento status→coluna do board); faltava evidência da condição `restrict-issue-transition` (só relatada verbalmente) e o parágrafo de dificuldade veio vago — 2ª rodada trouxe o print da condição e reescreveu o parágrafo com relato técnico concreto (erro 400 de status duplicado, uso da API pra referenciar por ID) |
| `sprints/sprint-1/entregas/04-postman/01-anatomia.md` | 1 | 2026-09-24 | 1ª rodada: ajustar — Parte B (idempotência) muito boa, com nuance espontânea de DELETE 204→404 e cenário criativo de POST inválido repetido; faltou dizer onde o Swagger indica token, marcar campos obrigatórios, mascarar tokens, e o resultado esperado do cenário copiou a mensagem exata do Zod em vez de derivar do critério de aceite. **2ª rodada (2026-09-25): aceito** — todos os 4 corrigidos; o esperado reescrito ficou melhor que o pedido (checa ausência de token e da senha no body, amarrando ao critério "senha nunca aparece em resposta") |

## Anotações da retrospectiva

*(o que melhorar na próxima sprint, escrito por você ao fim de cada uma)*
