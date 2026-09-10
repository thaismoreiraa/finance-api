# Módulo 09 — Teste exploratório e transição de estados

**Sprint 4 · ~4 horas**

---

## Por que isso importa

Até aqui você testou o que **planejou** testar. O problema é que caso de teste só encontra
o bug que alguém imaginou — e os defeitos que chegam a produção são justamente os que
ninguém imaginou.

Teste exploratório é o antídoto. E transição de estados é a técnica que acha a categoria
de bug mais cara de todas: o sistema que fica preso num estado do qual não sai.

---

## 1. Teste exploratório não é clicar aleatoriamente

A definição que vale: **aprendizado, desenho de teste e execução ao mesmo tempo.** Você
usa o que acabou de descobrir para decidir o próximo passo — coisa que um roteiro escrito
há duas semanas não consegue fazer.

| | Teste roteirizado | Teste exploratório |
| --- | --- | --- |
| O que testar | Decidido antes | Decidido durante |
| Força | Cobertura, repetibilidade, evidência | Achar o inesperado |
| Fraqueza | Só acha o previsto | Difícil de repetir e medir |
| Quando | Sempre, como base | Depois dos roteirizados, ou quando o requisito é vago |

Os dois são necessários. Roteirizado prova que o combinado funciona; exploratório
descobre o que ninguém combinou.

---

## 2. Session-Based Test Management

O jeito profissional de fazer exploratório — e a resposta que impressiona em entrevista,
porque a maioria acha que exploratório é bagunça.

Uma **sessão** tem:

| Elemento | O que é |
| --- | --- |
| **Charter** | A missão da sessão, em uma frase |
| **Timebox** | 60 a 90 minutos, cronômetro ligado |
| **Notas** | O que fez, o que viu, o que estranhou |
| **Debrief** | O que aprendeu, bugs achados, o que investigar depois |

### Exemplo de charter

> **Charter:** explorar o comportamento das transferências quando as contas envolvidas
> têm configurações diferentes de `allow_negative`, procurando inconsistências de saldo.
>
> **Timebox:** 75 minutos.

Repare: tem foco (transferências + `allow_negative`) e tem alvo (inconsistência de saldo).
Não é "testar o sistema" — isso não é charter, é desejo.

### Charters para a Sprint 4

1. Explorar orçamentos com gasto **exatamente** no limite de alerta, procurando divergência
   entre `usage_percent`, `remaining` e `alert_triggered`.
2. Explorar metas próximas ao valor-alvo, procurando estados inconsistentes.
3. Explorar recorrências com os três `update_scope`, procurando efeito em transações que
   não deveriam ser afetadas.
4. Explorar orçamentos em meses de tamanhos diferentes — fevereiro, mês de 30 e de 31
   dias — procurando despesas que ficam de fora do período.
5. Explorar o sistema com **dois usuários**, procurando qualquer dado de um visível pelo outro.

### Como tomar nota

Enquanto explora, registre em três colunas:

| O que fiz | O que vi | O que achei estranho |
| --- | --- | --- |

A terceira coluna é a mais valiosa. "Estranho" não é bug ainda — é pista. No debrief você
decide o que virou bug, o que virou caso de teste novo e o que virou pergunta para a PO.

### Heurísticas para não travar

Quando não souber o que fazer, use uma destas:

- **Interromper.** Comece uma operação e pare no meio. Mande a requisição sem um campo obrigatório.
- **Repetir.** Faça a mesma coisa duas, cinco vezes seguidas. Dá duplicado?
- **Inverter a ordem.** Exclua o filho depois do pai. Use um id excluído.
- **Extremos.** Zero, negativo, gigante, com centavos, com acento, com emoji.
- **Trocar de identidade.** Faça no usuário A, tente ver no B.
- **Voltar no tempo.** Data de ontem, de hoje, de amanhã, de 1900, de 2999.
- **Contrariar o fluxo feliz.** O sistema espera que você faça X depois de Y? Faça Y depois de X.

---

## 3. Transição de estados, a sério

No Módulo 05 você viu a ideia. Agora vamos usar como ferramenta de caça.

### Passo 1 — Desenhe o diagrama

Metas (`goals`), conforme o README:

```
                 deposit (current < target)
                    ┌─────┐
                    │     ▼
   [criada] ──►  active ──────────────────► completed
                    │   deposit atinge target
                    │
                    ▼
                cancelled?     ← existe? o README não diz
```

### Passo 2 — Monte a tabela de transições

Uma linha para **cada** combinação de estado atual × evento. Inclusive as que não deveriam
existir — são elas que pegam bug.

| Estado atual | Evento | Estado esperado | Resultado observado |
| --- | --- | --- | --- |
| active | deposit abaixo do alvo | active | |
| active | deposit que atinge **exatamente** o alvo | completed | |
| active | deposit que ultrapassa o alvo | completed | |
| **completed** | deposit | *rejeitado, 400* | |
| **completed** | aumentar `target_amount` via PATCH | ? **o README não diz** | |
| completed | diminuir `target_amount` | ? | |
| active | `deposit` com valor zero | ? | |
| active | `deposit` com valor negativo | ? | |

As linhas com "?" são as mais valiosas do curso inteiro. Cada uma é uma pergunta para a
Renata **ou** um bug. Nunca deixe uma célula "?" sem resolver — é ali que mora o defeito
que ninguém previu.

### Passo 3 — Procure os quatro padrões clássicos

**1. Estado sem saída (armadilha).** Entrou e não sai. *Uma meta que virou `completed` tem
como voltar a `active`? Uma transação que virou `scheduled` tem caminho de volta para
`confirmed`?* Se não tem, o usuário fica preso — e "fica preso" é sempre pelo menos
severidade Média.

**2. Transição inválida permitida.** O sistema aceita ir de um estado para outro que não
deveria. Depositar em meta cancelada, confirmar transação excluída.

**3. Efeito colateral inconsistente.** A transição muda o estado mas esquece a
consequência. Virar `confirmed` deveria mexer no saldo — mexe **em todos** os caminhos que
levam a `confirmed`?

**4. Estado que não reflete os dados.** Meta marcada `completed` com progresso em 20%.
Transação `confirmed` que não aparece no saldo. **Este é o mais grave**, porque nada
"quebra" visivelmente — o dado só fica mentindo.

### Onde aplicar na Sprint 4

| Objeto | Estados |
| --- | --- |
| **Transaction** | `scheduled` · `pending` · `confirmed` · `cancelled` |
| **Goal** | `active` · `completed` (e `cancelled`?) |
| **Budget** | não tem status, mas tem `alert_triggered` ligando e desligando conforme o gasto |
| **Recurrence** | ativa/inativa, com `next_due_date` avançando |

---

## 4. Sua vez

Em `qa-course/sprints/sprint-4/entregas/09-exploratorio/`:

1. **Três sessões exploratórias.** Escolha três charters da lista (ou escreva os seus).
   Para cada um: charter, timebox, notas nas três colunas, debrief. **Respeite o
   cronômetro** — sessão sem timebox vira navegação sem rumo.
2. **Dois diagramas de estado** — transação e meta — com a tabela de transições completa,
   incluindo as inválidas, e a coluna "resultado observado" preenchida por execução.
3. Toda célula "?" resolvida: virou pergunta para a Renata ou virou bug.
4. Bugs encontrados reportados em inglês, como no Módulo 08.

**Meta desta sprint:** achar pelo menos um bug que **nenhum dos seus casos de teste
roteirizados pegaria**. Se conseguir, você entendeu para que serve o exploratório.

---

## 5. Como a IA ajuda aqui

Aqui a relação se inverte: **este é o módulo em que a IA menos substitui você** — e vale
entender por quê, porque é o melhor argumento sobre o futuro da profissão.

Exploratório depende de reagir ao que acabou de acontecer na tela. A IA não está olhando.
Ela não sente que a resposta demorou mais que o normal, não estranha que o saldo mudou
duas casas decimais, não tem a intuição de "isso aqui está esquisito". Intuição é
justamente o que ela não tem.

**O que ela faz bem mesmo assim:**

- **Gerar charters.** *"Sou QA testando orçamentos mensais por categoria com alerta
  percentual. Sugira 8 charters de sessão exploratória, cada um com foco e alvo
  específicos."* Bom ponto de partida quando você travou.
- **Montar a tabela de transições.** Você dá os estados e os eventos, ela monta todas as
  combinações sem esquecer linha. Trabalho combinatório, ela é ótima.
- **Ser advogada do diabo depois da sessão.** *"Explorei transferências entre contas com
  allow_negative diferente e achei isto: (…). Que áreas relacionadas eu deveria explorar
  em seguida?"* Ela conecta com áreas adjacentes que você não pensou — orçamento,
  relatório, auditoria.
- **Gerar massa esquisita.** Nomes com emoji, acento, aspas, 10.000 caracteres, datas
  absurdas. Trabalho chato, ela faz em segundos.

**O que ela não faz:**

- Explorar. Sessão exploratória é execução ao vivo com julgamento a cada passo.
- Sentir o "estranho". A coluna mais valiosa das suas notas é inacessível para ela.
- Decidir se "?" é bug ou lacuna de requisito. Isso é conversa com pessoa.

**A conclusão que vale para a sua carreira:** a IA já escreve caso de teste melhor e mais
rápido que muito QA júnior. O que ela não faz é **perceber que alguma coisa está errada
sem ser avisada**. É por isso que exploratório é a habilidade mais à prova de futuro que
você pode desenvolver agora — e é uma resposta forte para a pergunta "IA não vai substituir
QA?" numa entrevista.

---

## 6. Vocabulário

| Inglês | Significa |
| --- | --- |
| **exploratory testing** | teste exploratório |
| **charter** | missão da sessão |
| **timebox** | tempo fixo reservado |
| **debrief** | conversa de fechamento da sessão |
| **heuristic** | heurística — regra prática |
| **state transition** | transição de estado |
| **invalid transition** | transição inválida |
| **dead end state** | estado sem saída |
| **side effect** | efeito colateral |

---

Próximo: `/qa-curso modulo 10` — Reteste, regressão e rastreabilidade.
