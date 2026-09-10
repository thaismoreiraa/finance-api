# Curso prático de QA — finance-api

Um curso de QA em formato de emprego. Você não vai assistir aula sobre teste de
software: você vai **trabalhar como QA** num time que tem PO, dev, sprint de duas
semanas, Jira, build com bug e prazo.

O produto sob teste é a API deste repositório — um sistema de controle de finanças
pessoais com contas, transações, transferências, orçamentos, metas e auditoria.

## Como usar

Abra o Claude Code nesta pasta e digite:

```bash
/qa-curso
```

Ele lê o `PROGRESSO.md`, descobre onde você parou e continua. Não precisa reexplicar
nada, em nenhuma sessão nova.

| Comando | Para quê |
| --- | --- |
| `/qa-curso` | Continuar de onde parou |
| `/qa-curso modulo 5` | Aula de um módulo específico |
| `/qa-curso sprint 2` | Abrir a sprint (planning + stories do PO) |
| `/qa-curso build` | Receber a build do dev para testar |
| `/qa-curso revisar qa-course/sprints/sprint-2/entregas/casos-conta.md` | Revisão rigorosa da sua entrega |
| `/qa-curso triagem` | Levar seu bug report para o dev |
| `/qa-curso retro` | Retrospectiva da sprint |
| `/qa-curso status` | Onde você está e quantos bugs achou |

## O caminho

| Sprint | Área da API | O que você aprende | Bugs |
| --- | --- | --- | --- |
| **0** | — | Ambiente, Docker, Swagger, Git | — |
| **1** | Auth + Users | Fundamentos de QA · Ágil · Jira e Qase · REST e Postman | — |
| **2** | Accounts + Categories | Técnicas de teste · Casos de teste e critérios de aceite | 🟢 |
| **3** | Transactions | SQL para QA · Bug report e ciclo do defeito | 🟡 |
| **4** | Budgets, Goals, Recurrences | Teste exploratório · State transition · Reteste e regressão | 🔴 |
| **5** | Reports + Auditoria | Performance · Rastreabilidade · Relatório final | 🔴 |

Ritmo previsto: ~1h por dia, sprints de 2 semanas, **cerca de 2 meses e meio**.
Não tem problema atrasar. Tem problema pular módulo.

## Módulos

| # | Módulo | Sprint |
| --- | --- | --- |
| 00 | [Ambiente e primeiro contato](modulos/00-ambiente.md) | 0 |
| 01 | [Fundamentos de QA](modulos/01-fundamentos-qa.md) | 1 |
| 02 | [Ágil, Scrum e o QA na sprint](modulos/02-agil-scrum.md) | 1 |
| 03 | [Jira e Qase na prática](modulos/03-jira-qase.md) | 1 |
| 04 | [API REST e Postman do zero](modulos/04-api-postman.md) | 1 |
| 05 | [Técnicas de teste](modulos/05-tecnicas-de-teste.md) | 2 |
| 06 | [Casos de teste e critérios de aceite](modulos/06-casos-de-teste.md) | 2 |
| 07 | [SQL para QA](modulos/07-sql-para-qa.md) | 3 |
| 08 | [Bug report e ciclo de vida do defeito](modulos/08-bug-report.md) | 3 |
| 09 | [Teste exploratório e state transition](modulos/09-exploratorio-state-transition.md) | 4 |
| 10 | [Reteste, regressão e rastreabilidade](modulos/10-regressao-rastreabilidade.md) | 4 |
| 11 | [Performance, relatório final e portfólio](modulos/11-performance-relatorio.md) | 5 |

## As regras do jogo

**Sobre os bugs.** Cada sprint entrega uma branch `build/sprint-N` com defeitos
plantados, além dos que já existem no código de verdade. Ninguém vai te dizer quais são,
quantos são, nem em que área estão. Se você não achar, você fica sabendo só na
retrospectiva — exatamente como quando um bug escapa para produção.

**Sobre o time.** O PO escreve story curta e ambígua de propósito. Se você não perguntar
no refinement, você vai testar a coisa errada. O dev recusa bug report mal escrito com
"não consegui reproduzir". Isso não é implicância: é o dia a dia, e aprender a se
defender disso é metade do trabalho.

**Sobre a correção.** Você pediu rigor de QA Sênior. Suas entregas vão voltar marcadas.
Cada crítica vem com o porquê e com o modelo do jeito certo.

## Estrutura

```
qa-course/
├── PROGRESSO.md      onde você parou (atualizado automaticamente)
├── modulos/          as aulas
├── sprints/
│   └── sprint-N/
│       ├── briefing.md    o contexto da sprint
│       ├── stories.md     as stories do PO, prontas para o Jira
│       └── entregas/      SUAS entregas vão aqui
├── templates/        modelos de caso de teste, bug report e relatório
└── glossario-en.md   o inglês que a vaga vai cobrar
```

## Ferramentas que você vai precisar

| Ferramenta | Para quê | Custo |
| --- | --- | --- |
| Docker Desktop | Subir o banco de dados | Grátis |
| Postman | Testar a API | Grátis |
| Jira Cloud | Stories, sprint, bugs | Grátis até 10 pessoas |
| Qase | Casos de teste e ciclos de execução | Plano gratuito |
| DBeaver *(ou psql)* | Consultar o banco | Grátis |
| Git + GitHub | Versionar tudo o que você produzir | Grátis |

O Módulo 00 instala e configura tudo isso com você, um passo por vez.

## Ao final

Você vai ter, versionado neste repositório e publicado no Jira:

- um projeto ágil completo, com 5 sprints e o ciclo de vida do defeito rodado de verdade;
- uma suíte de casos de teste rastreada até as stories no Qase;
- uma coleção Postman com assertions cobrindo a API inteira;
- bug reports de verdade, escritos em português e em inglês, com evidência;
- consultas SQL de validação de dados;
- um relatório final de testes.

Isso é o projeto final do seu portfólio. É o que você mostra na entrevista.
