# Automação do Jira (FIN) via API

Scripts para montar o projeto `FIN — Finance API` no Jira Cloud pela REST API, já
que não existe conector MCP para o Jira. Cobre o que o
[módulo 03](../../modulos/03-jira-qase.md) pede: tipos de issue, workflow de bug,
campos obrigatórios e board.

Site: `dfmoreira.atlassian.net` · Projeto `FIN` (id 10001, company-managed/classic).

## Setup (uma vez)

1. Gere um API token em https://id.atlassian.com/manage-profile/security/api-tokens
   (conta Atlassian associada ao e-mail que administra o site).
2. Copie `.env.example` para `.env` nesta pasta e preencha `JIRA_SITE_URL`,
   `JIRA_EMAIL` e `JIRA_API_TOKEN` **diretamente no arquivo** — não cole o token no
   chat. `.env` já está no `.gitignore` da raiz do repo.
3. Rode `node scripts/00-test-connection.js` para validar a conexão.

## Scripts (rodar em ordem, todos idempotentes — reexecutar é seguro)

| Script | O que faz |
| --- | --- |
| `00-test-connection.js` | Valida token e mostra se o projeto já existe |
| `01-create-project.js` | Cria o projeto `FIN` (Scrum, company-managed) |
| `02-create-bug-workflow.js` | Cria o workflow `FIN Bug Workflow`: 9 status (New, Open, In Progress, Ready for Retest, Closed, Reopened, Won't Fix, Duplicate, Cannot Reproduce) e as 10 transições do diagrama do módulo 03 |
| `03-assign-bug-workflow.js` | Associa esse workflow só ao tipo **Bug** (Story/Task/Epic continuam no workflow padrão do Scrum) |
| `04-create-bug-fields.js` | Cria os campos custom `Severity` (lista: Crítica/Alta/Média/Baixa), `Steps to Reproduce`, `Expected Result`, `Actual Result`. `Environment` já existe como campo de sistema do Jira |
| `05-add-fields-to-bug-screen.js` | Adiciona esses campos à tela do Bug |

Estado de cada etapa fica salvo em `state/*.json` (gitignored — específico deste
site).

### Pegadinha resolvida: reaproveitar status existentes

`Open`, `In Progress`, `Closed` e `Reopened` já existem como status globais do
Jira (sistema) e não podem ser recriados — e a API de bulk-create/update de
workflow rejeita silenciosamente uma referência a um status existente a menos
que você informe o campo `id` (não documentado na doc renderizada, só na spec
OpenAPI) junto com `statusReference` no catálogo de status do payload. A
solução usada aqui: copiar (`POST /workflows/copy`) um workflow existente que
já contém esses 4 status, depois estender via `POST /workflows/update`
informando `id` + `statusReference` para os reaproveitados e só um UUID novo
para os status genuinamente novos.

## O que é automatizável vs manual

| Etapa | Via API? |
| --- | --- |
| Criar o site/conta Jira Cloud | ❌ manual (cadastro) |
| Criar o projeto `FIN` | ✅ script `01` |
| Tipos de issue (Story/Bug/Task/Sub-task) | ✅ já vêm no template Scrum |
| Workflow do bug + transições | ✅ scripts `02`/`03` |
| Campos do Bug (Severity, Steps to Reproduce, etc.) | ✅ scripts `04`/`05` |
| Colunas do board (`To Do → In Progress → In QA → Done`) | ❌ manual — a API do Jira Cloud não expõe endpoint público para editar colunas de board (só leitura via `GET /rest/agile/1.0/board/{id}/configuration`) |

O projeto é **company-managed** (clássico), não team-managed/simplificado —
necessário para o workflow customizado do módulo 03 funcionar via API.

## Passo manual restante: colunas do board

Board `FIN board` (scrum). Hoje tem só 3 colunas (To Do/In Progress/Done),
mapeadas para o workflow padrão do Scrum — o workflow do Bug ainda não está
mapeado em nenhuma coluna. Na UI: **Board → ⋯ → Board settings → Columns**:

1. Adicione uma coluna **In QA** entre "In Progress" e "Done".
2. Arraste os status de cada workflow para as colunas:

| Coluna | Status |
| --- | --- |
| To Do | To Do (Story/Task), New, Open (Bug) |
| In Progress | In Progress (Story/Task), In Progress, Reopened (Bug) |
| In QA | Ready for Retest (Bug) |
| Done | Done (Story/Task), Closed, Won't Fix, Duplicate, Cannot Reproduce (Bug) |

"Ready for Retest" cair sozinho na coluna "In QA" é exatamente o ponto do
módulo: um bug corrigido pelo dev fica visível ali até o QA validar, em vez
de sumir direto pra "Done".
