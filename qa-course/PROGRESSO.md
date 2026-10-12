# Progresso

> Arquivo mantido pelo `/qa-curso`. Você pode ler à vontade — e editar, se quiser
> corrigir alguma coisa.

**Ponto atual:** Sprint 1 · Módulo 04 🟨 em andamento — bloco 4 de 5 ✅ concluído (assertions)
**Última sessão:** 2026-10-12 — bloco 4 aceito na 2ª rodada: regressões da collection desfeitas (com `git diff` contra o bloco 3 no checklist), mutação de ausência provada, assertion de texto exato removida, tabelas escapadas, `unset` no login justificado e `account_id` movido para a collection. (Em 2026-10-05: refinement das FIN-02 a FIN-05, critérios em `stories.md`.)
**Próximo passo:** 2 commits (refinement 05/10 e bloco 4) → `/qa-curso modulo 4`, bloco 5 (Collection Runner, IA, vocabulário), o último do módulo. 

**Plano do Módulo 04 (≈5h, 5 blocos):** 1) API, anatomia, métodos · 2) status codes + JWT · 3) Postman: environment, collection, login que salva token · 4) assertions + as 8 requisições · 5) Collection Runner, export, commit, IA e vocabulário

---

## Módulos

| # | Módulo | Status |
| --- | --- | --- |
| 00 | Ambiente e primeiro contato | ✅ concluído |
| 01 | Fundamentos de QA | ✅ |
| 02 | Ágil, Scrum e o QA na sprint | ✅ |
| 03 | Jira e Qase na prática | ✅ |
| 04 | API REST e Postman do zero | 🟨 bloco 5/5 |
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
- [x] Postman instalado
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
| `sprints/sprint-1/entregas/04-postman/02-status-jwt.md` | 1 | 2026-09-29 | 1ª rodada: ajustar — Parte A e fronteiras 401×403 / 400×422 / 409×422 muito boas; achou sozinha a divergência register × critério de aceite da FIN-01. Problemas: esperado da Parte B copiado da execução (ids e timestamps reais) e com fonte declarada diferente da real; cenários pedidos ausentes (e-mail inexistente, register inválido com contagem de `details`, 2 cenários próprios, coluna `code`); previsões de refresh sem fonte e contra o Swagger; ferramenta de decodificação não informada. **2ª rodada (2026-09-29):** os 5 pontos foram corrigidos e o conteúdo está aprovado; falta completar a tabela 4 (dúvidas #2 a #4 citadas mas não escritas). **3ª rodada (2026-09-29): ajustar** — resposta da Renata à #1 registrada na tabela 4 (coluna nova); #2 a #4 seguem sem ser escritas, então a Renata ainda não tem o que responder |
| `sprints/sprint-1/entregas/04-postman/03-setup-postman.md` + JSONs | 1 | 2026-10-01 | 1ª rodada: ajustar — herança de auth provada pelo Console, experimento do `if` muito bem explicado, register idempotente com `Date.now()` e o 409 verificado de fato. Problemas: `base_url` e `password` exportados vazios, porque o grep tratou qualquer valor como segredo, e a collection não roda para quem importa; cenário 1 marcado como "bateu" só pelo status, sendo que a previsão incluía os dados do usuário (achado #1); senha de teste aparece em texto no próprio md, que diz não ter senha. **2ª rodada (2026-10-01): aceito**, os 3 itens corrigidos, com a tabela segredo × configuração × gerado aplicada e a conclusão de que a collection roda para quem importa sem preencher nada |
| `sprints/sprint-1/entregas/04-postman/04-assertions.md` + collection | 1 | 2026-10-12 | 1ª rodada: ajustar — 10 requisições, 79 assertions, rodadas no Newman por iniciativa própria; achado #2 com análise excelente (a própria API se contradiz: `total_balance` number × `balance` string); 3 red tests do achado #1 mantidos. Problemas: `password` vazio de novo e requisições de auth voltaram a herdar o token (regressões do bloco 3); faltou a mutação de uma assertion de ausência; assertion no texto exato "Dados inválidos."; tabelas da seção 2 quebradas pelo `|` não escapado; o `unset` no login e o `account_id` no environment contradizem decisões dela mesma no bloco 3, sem justificativa. **2ª rodada (2026-10-12): aceito**, os 5 pontos corrigidos; o `unset` ficou justificado (token antigo mascararia login quebrado no Runner) e o checklist ganhou um `git diff` contra a versão aceita |

## Decisões da PO (valem como critério até a story ser refinada)

| Data | Story | Decisão (Renata) |
| --- | --- | --- |
| 2026-09-29 | FIN-01 | A resposta do cadastro deve trazer os dados do usuário (id, nome, e-mail) além dos tokens. O critério de aceite prevalece sobre o Swagger. |
| 2026-09-29 | FIN-03 | O refresh token pode ser reutilizado até vencer (7 dias). A rotação a cada uso vai para o backlog. O access token já emitido continua valendo até vencer. |
| 2026-09-29 | FIN-02 | Login com senha errada e com e-mail inexistente devem ter resposta idêntica (status, `code` e `message`). O 409 do cadastro, que revela e-mail existente, é um risco aceito. |
| 2026-09-29 | (Sprint 2) contas | `total_balance` soma só as contas ativas e não excluídas. Saldo negativo entra subtraindo. |
| 2026-10-05 | FIN-02 a FIN-05 | Refinement realizado. Os critérios de aceite agora estão em `stories.md` e já incorporam as decisões acima de FIN-02 e FIN-03; só o que não foi perguntado segue sem critério. |
| 2026-10-05 | FIN-03 / FIN-04 | Contestada pela QA com argumento de segurança, a Renata passa a achar desejável encerrar as outras sessões ao trocar a senha. Nesta versão continua não encerrando (risco aceito, os testes da sprint esperam isso) e vira story de backlog com prioridade alta, ainda a abrir no Jira. |

## Achados pendentes de bug report

*(o report formal entra no Jira depois do Módulo 08)*

| # | Achado | Onde | Origem | Status |
| --- | --- | --- | --- | --- |
| 1 | `POST /auth/register` responde só com os tokens, mas o critério de aceite da FIN-01 pede também os dados do usuário (id, nome, e-mail) | `POST /v1/auth/register` | `02-status-jwt.md`, dúvida para a PO; Renata confirmou em 2026-09-29 que o critério vale | aguardando report |
| 2 | `balance` das contas vem como string (`"500.00"`), mas o Swagger define `Money` como `number`; no mesmo `GET /accounts`, `total_balance` vem como number | `POST /v1/accounts`, `GET /v1/accounts` | `04-assertions.md`, seção 4 (bloco 4) | aguardando report — o contrato será discutido na triagem |

## Anotações da retrospectiva

*(o que melhorar na próxima sprint, escrito por você ao fim de cada uma)*
