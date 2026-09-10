# Módulo 10 — Reteste, regressão e rastreabilidade

**Sprint 4 · ~3 horas**

---

## Por que isso importa

Correção quebra coisa. Não às vezes: **frequentemente**. O dev conserta o cálculo do saldo
na exclusão e, sem perceber, quebra a exclusão de transferências.

Se você só reteste o bug corrigido e libera, o estrago vai para produção com o seu aval.
Regressão é o que protege você disso.

---

## 1. Reteste × Regressão

| | Reteste | Regressão |
| --- | --- | --- |
| **O que faz** | Repete os passos exatos do bug corrigido | Roda testes ao redor da correção |
| **Escopo** | Um bug | Uma área, ou o sistema |
| **Objetivo** | A correção funcionou? | A correção quebrou algo? |
| **Quando** | Assim que a build chega | Logo depois do reteste |

Ordem: **reteste primeiro**. Se a correção nem funcionou, não faz sentido gastar tempo com
regressão ainda.

Essa distinção é pergunta quase certa em entrevista. A resposta curta:
*"reteste é mirado no defeito; regressão é ao redor dele, procurando o que a correção
quebrou."*

---

## 2. Reteste bem feito

**As regras:**

1. **Passos originais, sem improviso.** Se você mudar os dados, não está retestando —
   está testando outra coisa.
2. **Build nova, confirmada.** `git switch build/sprint-4 && git pull`, e anote o commit.
   Reteste na build errada é o erro mais constrangedor do ofício.
3. **Ambiente limpo.** Dados velhos escondem regressão.
4. **Registre a build no ticket.** *"Retested on `build/sprint-4`, commit `d4e5f6a` — passed."*

**Passou** → você move para Closed. Só você.
**Não passou** → Reopened, com o que mudou. Não abra ticket novo: o histórico do ticket
original é o que mostra que a primeira correção foi insuficiente.

**Reteste não é só "o erro sumiu".** Confira também o **efeito** completo: o saldo voltou
ao valor certo? A linha de auditoria foi gerada? A perna oposta da transferência também
foi tratada? Correção parcial é o padrão, não a exceção — e "o erro sumiu na minha
verificação superficial" é como bug volta para produção.

---

## 3. Montando a suíte de regressão

Você não vai reexecutar 200 casos a cada build. Precisa escolher.

### O que sempre entra

| Critério | No finance-api |
| --- | --- |
| Fluxo crítico de negócio | Login · criar transação · conferir saldo |
| Onde envolve dinheiro | Todo cálculo de saldo, orçamento e meta |
| Segurança | Autenticação e isolamento entre usuários |
| Área que já quebrou antes | O histórico do Qase te diz quais são |
| Integrações entre módulos | Transação que afeta orçamento que dispara alerta |

### O que entra por causa desta correção

Aqui está o julgamento. Pergunte: **o que mais toca esse código?**

O saldo da conta é mexido por: criar transação, editar, excluir, transferir, importar CSV,
confirmar importação. Uma correção na reversão de saldo obriga a retestar **todos** esses
caminhos, não só o da exclusão.

Como descobrir isso sem ler código:
- procure no README todas as regras que citam a mesma entidade;
- procure no Qase os casos da mesma suíte;
- **pergunte ao dev**: *"o que mais essa mudança toca?"* — pergunta simples, e a resposta
  economiza horas. Fazer essa pergunta também mostra que você pensa em risco.

### Suíte de regressão da Sprint 4 — o mínimo

- [ ] Login e acesso autenticado
- [ ] Criar receita → saldo aumenta
- [ ] Criar despesa → saldo diminui
- [ ] Despesa sem saldo com `allow_negative = false` → 422 e saldo intacto
- [ ] Transferência → debita origem, credita destino, duas pernas ligadas
- [ ] Editar transação → saldo recalculado
- [ ] Excluir transação → saldo revertido **e** auditoria gerada
- [ ] Conciliação SQL: `balance` bate com a soma das transações
- [ ] Orçamento: `spent`, `remaining`, `usage_percent` e `alert_triggered` coerentes
- [ ] Meta: depósito atualiza progresso e completa no alvo
- [ ] Isolamento: usuário A não vê nada do usuário B

**Toda build nova roda essa lista.** É o seu contrato de qualidade — e é isso que você
mostra numa entrevista quando perguntarem "como você garante que nada quebrou?".

---

## 4. Matriz de rastreabilidade

Uma tabela que liga requisito → story → caso de teste → execução → defeito.

| Requisito | Story | Casos | Executados | Passou | Defeitos |
| --- | --- | --- | --- | --- | --- |
| Saldo revertido ao excluir | FIN-18 | CT-031, CT-032 | 2 | 1 | FIN-42 |
| Transferência gera duas pernas | FIN-15 | CT-014 a CT-018 | 5 | 5 | — |
| Alerta de orçamento no limite | FIN-22 | CT-044 a CT-047 | 4 | 3 | FIN-51 |

**Para que serve de verdade** — três perguntas que aparecem no trabalho:

1. *"Essa story foi testada?"* — a linha responde.
2. *"Requisito sem nenhum caso de teste?"* — **linha vazia é buraco de cobertura**, e é o
   uso mais valioso da matriz.
3. *"Vamos mudar essa regra. O que reteste?"* — a linha te dá a lista pronta.

No Qase, com a integração do Jira configurada, essa matriz sai de graça. Faça uma
manualmente uma vez, para entender o que a ferramenta está fazendo por você.

---

## 5. Sua vez

Em `qa-course/sprints/sprint-4/entregas/10-regressao/`:

1. **Suíte de regressão** — monte a sua, no Qase, marcando os casos com a tag `regression`.
   Justifique em uma linha por que cada caso entrou.
2. **Reteste** dos bugs corrigidos na sprint. Para cada um, registre no ticket a build, o
   commit e o veredito. Confira o efeito completo, não só o sintoma.
3. **Regressão** — depois de cada reteste, rode a suíte e registre o Test Run.
4. **Matriz de rastreabilidade** — para todas as stories da Sprint 4, no formato acima.
   Aponte explicitamente qualquer critério de aceite sem caso de teste.
5. Se a regressão achar bug novo, reporte marcando como **regressão** — é uma informação
   importante para o time, porque regressão frequente é sintoma de processo, não de pessoa.

**Aviso justo:** pelo menos uma das correções desta sprint está incompleta. Reteste que
só olha o sintoma vai aprovar. É de propósito, e é a lição mais importante do módulo:
**correção não testada de verdade é bug novo com aval do QA.**

---

## 6. Como a IA ajuda aqui

**Análise de impacto — o melhor uso do módulo.**

> A correção mexeu na função que reverte o saldo da conta ao excluir uma transação. O
> sistema também tem transferências (duas transações espelhadas), importação de CSV,
> orçamentos que somam gastos por categoria e metas. Que áreas eu deveria incluir na
> regressão?

Ela lista as conexões, inclusive algumas que você não tinha pensado. Para isso ela é
genuinamente boa: enxergar relação entre módulos a partir de uma descrição.

**Priorizar a suíte.** Cole a lista de casos e peça uma ordenação por risco, explicando o
critério. Você não aceita a ordem crua — você discute com ela e decide.

**Detectar buraco na matriz.** Cole os critérios de aceite e os títulos dos casos e
pergunte quais critérios não têm caso correspondente. Trabalho de conferência cruzada,
ela faz bem e você faria mal às onze da noite.

**Onde ela erra:** ela **superestima o escopo**. Vai sugerir regressão completa do sistema
para uma correção de duas linhas — o que é seguro e impraticável. Regressão é orçamento
de tempo: você tem dois dias e precisa escolher. Essa escolha é julgamento profissional,
e é para isso que a empresa contrata um QA e não um script.

**O outro limite:** ela não sabe o que já quebrou antes neste projeto. Esse histórico está
no Qase e na sua cabeça — e é a informação mais preditiva que existe para escolher
regressão. **Bug se agrupa** (princípio 4, Módulo 01): onde já quebrou, quebra de novo.

---

## 7. Vocabulário

| Inglês | Significa |
| --- | --- |
| **retest / confirmation testing** | reteste |
| **regression testing** | teste de regressão |
| **regression suite** | conjunto fixo de casos de regressão |
| **impact analysis** | análise de impacto |
| **traceability matrix** | matriz de rastreabilidade |
| **coverage gap** | requisito sem caso de teste |
| **smoke test** | verificação rápida de build |
| **build** | versão compilada entregue para teste |

---

Fim da Sprint 4. Rode `/qa-curso retro`.

Próximo: `/qa-curso modulo 11` — Performance, relatório final e portfólio.
