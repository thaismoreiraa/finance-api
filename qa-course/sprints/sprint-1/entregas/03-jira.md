# Módulo 03 — Jira e Qase

## Board

![Board do Jira com as colunas configuradas](./assets/board-jira.png)
![Colunas mapeadas por status](./assets/board-jira-columns.png)

## Workflow do bug

![Workflow do bug](./assets/workflow-bug-jira.png)
![Workflow do bug — detalhe](./assets/workflow-bug-jira-02.png)
![Workflow do bug - restrição](./assets/restrict-issue-transition.png)

## Árvore de suítes (Qase)

![Árvore de suítes no Qase](./assets/qase-suites.png)

## O que foi mais difícil de configurar

A parte mais difícil foi montar o workflow via API reaproveitando status que já existiam na instância. No Jira, os status são globais, então não é possível criar um novo status com o mesmo nome de um já existente, como In Review ou Ready for Retest. Só entendi isso depois de receber um erro 400 indicando nome duplicado ao tentar criar o workflow. Para resolver, precisei consultar o endpoint /rest/api/3/statuses/search, identificar o ID de cada status existente e referenciá-lo no payload do workflow, em vez de declarar o status como novo. Só assim consegui associar os status corretamente às transições.
