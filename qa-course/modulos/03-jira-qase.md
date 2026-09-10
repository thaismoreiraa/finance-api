# Módulo 03 — Jira e Qase na prática

**Sprint 1 · ~3 horas**

---

## Por que isso importa

"Experiência com Jira" está em praticamente toda vaga de QA. Não porque a ferramenta seja
difícil — é fácil — mas porque quem já usou entende o **fluxo** que ela representa. É
esse fluxo que a vaga está comprando.

Aqui não tem módulo teórico. Você monta o projeto e usa.

---

## 1. As duas ferramentas e por que são duas

| | Para quê | O que fica lá |
| --- | --- | --- |
| **Jira** | Gestão do trabalho | Stories, tasks, bugs, sprint, board |
| **Qase** | Gestão de teste | Casos de teste, suítes, ciclos de execução, resultados |

**Por que não fazer tudo no Jira?** Porque caso de teste não é ticket. Um caso de teste é
executado várias vezes, em builds diferentes, com resultados diferentes. Se ele fosse uma
issue do Jira, você teria que criar uma cópia a cada execução. Ferramenta de gestão de
teste existe justamente para separar **o caso** (escrito uma vez) da **execução**
(repetida a cada ciclo).

Times pequenos fazem tudo no Jira e sofrem. Times maduros usam Xray, Zephyr, TestRail ou
Qase. Estamos usando Qase porque tem plano gratuito permanente — o conceito é idêntico
nos outros, e você vai saber falar sobre isso em entrevista.

---

## 2. Montando o Jira

### Passo 1 — Criar

`atlassian.com/software/jira` → conta gratuita → **projeto Scrum** chamado
`FIN – Finance API`. Chave do projeto: `FIN`. As issues vão se chamar FIN-1, FIN-2…

### Passo 2 — Tipos de issue

Confira que existem, e crie o que faltar:

- **Story** — funcionalidade do ponto de vista do usuário
- **Bug** — defeito
- **Task** — trabalho sem cara de funcionalidade (montar massa de teste, configurar ambiente)
- **Sub-task** — quebra de qualquer um dos acima

### Passo 3 — O workflow do bug

Este é o coração do módulo. O ciclo de vida do defeito:

```
        ┌──────────────────── Reopened ◄──────────────┐
        │                                             │
        ▼                                             │ reteste reprovou
       New ──► Open ──► In Progress ──► Ready for Retest ──► Closed
                 │                                             ▲
                 ├──► Won't Fix ───────────────────────────────┤
                 ├──► Duplicate ───────────────────────────────┤
                 └──► Cannot Reproduce ────────────────────────┘
```

| Estado | Quem move | Significa |
| --- | --- | --- |
| **New** | QA | Acabou de ser reportado |
| **Open** | Dev/PO | Triado, aceito como defeito |
| **In Progress** | Dev | Sendo corrigido |
| **Ready for Retest** | Dev | Corrigido, bola com o QA |
| **Closed** | **QA** | QA validou. **Só QA fecha bug.** |
| **Reopened** | QA | Reteste reprovou |
| **Won't Fix** | PO | Decisão de negócio: não vamos corrigir |
| **Duplicate** | Dev/QA | Já existe ticket |
| **Cannot Reproduce** | Dev | Não conseguiu reproduzir — quase sempre report incompleto |

Configure isso em **Project settings → Workflows**. Vai dar trabalho. É a parte que
ninguém te ensina e que vale ponto na entrevista.

**A regra que você nunca esquece: quem abre o bug é quem fecha.** Dev não fecha bug. Se
o dev fechar, você reabre.

### Passo 4 — Campos obrigatórios no Bug

Adicione ao tipo Bug: **Severity** (Crítica/Alta/Média/Baixa), **Environment**,
**Steps to Reproduce**, **Expected Result**, **Actual Result**.

Prioridade já vem nativa. Severidade não — e são coisas diferentes. Isso é o Módulo 08.

### Passo 5 — O board

Colunas: `To Do → In Progress → **In QA** → Done`.

Repare na coluna **In QA**. Sem ela, story "pronta" pelo dev vai direto para Done e você
descobre depois. Com ela, o board mostra visualmente quando você está virando gargalo —
e isso vira assunto de retro.

---

## 3. Montando o Qase

`qase.io` → conta gratuita → projeto `FIN`.

### Estrutura de suítes

Espelhe os módulos da API:

```
FIN
├── Autenticação
│   ├── Registro
│   ├── Login
│   └── Refresh token
├── Contas
├── Categorias
├── Transações
│   ├── Receitas e despesas
│   ├── Transferências
│   └── Exclusão e auditoria
├── Orçamentos
├── Metas
└── Relatórios
```

### Test Run — o conceito que importa

No Qase, **caso de teste** e **execução** são coisas separadas:

1. Você escreve o caso **uma vez** (passos, resultado esperado).
2. A cada build, cria um **Test Run**: escolhe quais casos entram, executa, marca
   Passed/Failed/Blocked/Skipped.
3. O histórico fica: dá para ver que o CT-014 passou na sprint 2, falhou na 3, voltou a
   passar na 4.

Esse histórico é o que te deixa dizer numa reunião *"esse fluxo já quebrou duas vezes,
sugiro incluir na regressão fixa"*. Isso é fala de QA experiente.

### Integração com Jira

Em **Settings → Integrations → Jira Cloud**, conecte. Isso te dá:

- vincular caso de teste à story (rastreabilidade);
- criar o bug **direto do caso que falhou**, já com os passos preenchidos.

O segundo item economiza metade do seu tempo. Configure com carinho.

---

## 4. O fluxo completo, ponta a ponta

É este o ciclo que você vai repetir cinco vezes neste curso:

```
Renata escreve a story no Jira          FIN-12, status To Do
   ↓
Refinement: você pergunta, ela detalha  critérios de aceite entram na story
   ↓
Você escreve os casos no Qase           vinculados à FIN-12
   ↓
Marcelo entrega a build                 branch build/sprint-N
   ↓
Você cria o Test Run e executa          Passed / Failed
   ↓
Falhou → bug no Jira a partir do caso   FIN-42, status New
   ↓
Triagem com o Marcelo                   New → Open (ou recusado)
   ↓
Ele corrige                             In Progress → Ready for Retest
   ↓
Você reteste                            passou → Closed · falhou → Reopened
   ↓
Regressão ao redor                      novo Test Run
   ↓
Review e retro                          relatório da sprint
```

Cole esse desenho em algum lugar. Quando o entrevistador perguntar "como um QA participa
de uma sprint?", é isso que você descreve — e você vai ter vivido cada seta.

---

## 5. Sua vez

1. Crie o projeto no Jira com os tipos de issue, o workflow de bug completo e a coluna In QA.
2. Crie o projeto no Qase com a árvore de suítes acima.
3. Integre os dois.
4. Cadastre as stories da Sprint 1 (`qa-course/sprints/sprint-1/stories.md`) no Jira.
5. Crie a Sprint 1 no board e coloque as stories nela.
6. Em `qa-course/sprints/sprint-1/entregas/03-jira.md`: prints do board, do workflow do
   bug e da árvore de suítes, mais um parágrafo sobre o que foi mais difícil de configurar.

Os prints não são burocracia: são o portfólio que você mostra na entrevista.

---

## 6. Como a IA ajuda aqui

**Onde ela ajuda de verdade:** configuração de ferramenta. Jira é notoriamente confuso na
parte de workflow e permissões. *"No Jira Cloud gratuito, como adiciono um status
customizado 'Ready for Retest' ao workflow do tipo Bug?"* — resposta prática, em segundos,
melhor que a documentação oficial.

Também é boa para **converter formato**: você escreve os casos em Markdown e pede para ela
transformar no CSV que o Qase importa. Isso economiza horas de digitação.

**Onde ela erra:** as telas do Jira mudam com frequência e a IA descreve versões antigas
com total convicção. Se o botão não está onde ela disse, ela não está mentindo — está
desatualizada. Confira na documentação oficial quando o passo a passo não bater.

**O que ela não faz por você:** decidir o workflow. Quais estados o seu time precisa,
quem pode mover o quê — isso é desenho de processo, e depende do time. A IA te dá o
workflow genérico do livro; a decisão de ter ou não "Cannot Reproduce" separado de
"Won't Fix" é sua.

---

## 7. Vocabulário

| Inglês | Significa |
| --- | --- |
| **issue** | qualquer item de trabalho no Jira |
| **workflow** | os estados e transições permitidos |
| **board** | o quadro visual da sprint |
| **test suite** | agrupamento de casos de teste |
| **test run / test cycle** | execução de um conjunto de casos numa build |
| **traceability** | rastreabilidade: do requisito ao caso ao defeito |
| **assignee** | responsável pela issue |
| **triage** | triagem — decidir o que fazer com o bug reportado |

---

Próximo: `/qa-curso modulo 4` — API REST e Postman do zero.
