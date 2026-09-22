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
| `06-update-story-descriptions.js` | Formata a description das stories (Como/quero/para + Notas da PO + Critérios de aceite) em ADF |
| `07-restrict-close-transition.js` | Restringe a transição para **Closed** a quem reportou o bug (regra "quem abre é quem fecha" do módulo 03) |
| `08-move-card.js` | Move um card pra um status específico (uso ad hoc, não faz parte do setup — ver seção abaixo) |

Estado de cada etapa fica salvo em `state/*.json` (gitignored — específico deste
site).

## Simulando o Marcelo (dev): `08-move-card.js`

Convenção combinada com a usuária: as movimentações que, num time real, seriam
feitas pelo dev (To Do → In Progress → In QA nas stories; New → Open →
In Progress → Ready for Retest nos bugs) são feitas por aqui via API, quando
a narrativa do curso indicar que o Marcelo fez algo ("começou a trabalhar",
"entregou a build", "corrigiu o bug"). As movimentações que são da QA (In QA
→ Done; Ready for Retest → Closed/Reopened) a usuária faz na mão, pela UI —
são as que ela está de fato praticando.

```bash
node scripts/08-move-card.js FIN-2 "In Progress" "Marcelo começou o login."
```

O terceiro argumento (comentário) é opcional; quando informado, vira um
comentário na issue, então fica um rastro de "por que" a movimentação
aconteceu.

**Limitação importante:** a API só tem o token da própria usuária — não existe
uma conta separada para o "Marcelo". Todo comentário e toda movimentação feita
por este script aparece no histórico do Jira como sendo da mesma conta
(`thais.dfmoreira@icloud.com`), só com o texto do comentário narrando a
persona. Não é um usuário real "Marcelo" fazendo isso — é simulação.

### Pegadinha resolvida #2: "descrição da regra" não é a mesma coisa que "permissão"

A transição pra Closed nasceu (script `02`) só com a description "Só QA fecha
bug" — sem nenhuma condição de permissão de verdade, então qualquer pessoa com
permissão padrão de mover issue conseguia fechar um bug. O script `07`
corrige isso com uma condição `system:restrict-issue-transition` e
`accountIds: "allow-reporter"`. A doc da OpenAPI diz que esse valor "is only
supported in team-managed projects", mas isso parece erro de doc: o workflow
clássico que copiamos no script `02` (`classic default workflow`, um projeto
company-managed) já usava `allow-assignee` do mesmo jeito nativamente — e
`allow-reporter` funcionou igual no FIN (confirmado lendo a condição de volta
depois de aplicar).

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
