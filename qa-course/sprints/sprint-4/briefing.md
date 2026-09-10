# Sprint 4 — Orçamentos, Metas e Recorrências

**Duração:** 2 semanas · **Módulos:** 09, 10

---

## Contexto

> **Renata:** Essa é a parte que faz o usuário voltar todo dia. Orçamento com alerta,
> meta de economia, e as contas que se repetem todo mês. É o diferencial do produto.
>
> **Marcelo:** `build/sprint-4` no ar. Confesso que a parte de recorrência com
> `update_scope` me deu nó na cabeça. E corrigi os bugs da sprint passada — pode retestar.
>
> **Paula:** Na retro passada combinamos que a regressão entra no escopo desta sprint. Não
> é opcional.

**Tradução:** os defeitos desta sprint são **sutis**. Eles só aparecem no limite exato ou
numa sequência específica de estados. Testar "por cima" passa direto. Você vai precisar
das técnicas do Módulo 05 aplicadas de propósito, não por sorte.

E tem mais: **pelo menos uma das correções da Sprint 3 está incompleta.** Reteste que só
confere o sintoma vai aprovar uma correção quebrada.

---

## Objetivos

1. Rodar sessões exploratórias com charter e timebox *(Módulo 09)*
2. Mapear transições de estado e caçar os quatro padrões clássicos *(Módulo 09)*
3. Retestar as correções da Sprint 3 conferindo o **efeito completo** *(Módulo 10)*
4. Montar e executar a suíte de regressão *(Módulo 10)*
5. Montar a matriz de rastreabilidade

## Como pegar a build

```bash
git switch build/sprint-4
git pull
npm run migration:run
npm run dev
```

## Entregas

| # | Entrega | Arquivo |
| --- | --- | --- |
| 1 | Três sessões exploratórias com charter, notas e debrief | `entregas/09-exploratorio/` |
| 2 | Diagramas e tabelas de transição de transação e meta | `entregas/09-estados.md` |
| 3 | Suíte de regressão no Qase, com justificativa de cada caso | `entregas/10-regressao/suite.md` |
| 4 | Retestes da Sprint 3 com veredito e commit | `entregas/10-regressao/retestes.md` |
| 5 | Matriz de rastreabilidade das stories da sprint | `entregas/10-matriz.md` |
| 6 | Bugs em inglês, marcando quais são regressão | `entregas/bugs/` |

## Definition of Done

- [ ] Três sessões exploratórias com timebox respeitado
- [ ] Toda célula "?" das tabelas de transição resolvida — virou bug ou pergunta para a PO
- [ ] Suíte de regressão executada **depois de cada** correção
- [ ] Retestes verificaram o efeito completo, não apenas o sintoma
- [ ] Matriz sem critério de aceite descoberto — ou com o buraco apontado explicitamente
- [ ] Pelo menos um bug encontrado por exploratório que nenhum caso roteirizado pegaria

## Aviso

Nesta sprint você vai errar alguma coisa. Ou vai fechar um bug mal corrigido, ou vai
deixar um defeito sutil escapar. As duas coisas são material de retrospectiva, não motivo
para desânimo — QA sênior também deixa escapar, a diferença é que ele sabe **por que**
escapou e ajusta o processo.
