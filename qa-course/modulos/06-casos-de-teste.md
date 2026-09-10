# Módulo 06 — Casos de teste e critérios de aceite

**Sprint 2 · ~4 horas**

---

## Por que isso importa

Caso de teste é o seu produto. É o que fica quando você sai de férias, o que outra pessoa
executa, e o que prova numa auditoria que a funcionalidade foi verificada.

E é o artefato mais fácil de fazer mal. "Testar login" não é caso de teste — é um lembrete.

---

## 1. Cenário × Caso de teste

| | O quê | Exemplo |
| --- | --- | --- |
| **Cenário** | *O que* vai ser testado, em uma frase | "Exclusão de conta com transações vinculadas" |
| **Caso de teste** | *Como* testar, passo a passo, com dados e resultado esperado | os 6 campos abaixo |

Um cenário costuma virar vários casos: o cenário "exclusão de conta" vira o caso da conta
sem transações (deve excluir), o da conta com transações (409), o da conta de outro
usuário (404 ou 403), o da conta já excluída.

Fluxo de trabalho: story → cenários (lista rápida, sem detalhe) → priorizar → detalhar os
casos que importam. Não detalhe cenário que você não vai executar.

---

## 2. Anatomia de um caso de teste

| Campo | Por que existe |
| --- | --- |
| **ID** | Para o bug report apontar "quem pegou" |
| **Título** | O comportamento verificado, não a tela |
| **Pré-condições** | O estado exato antes de começar |
| **Dados de teste** | Os valores concretos |
| **Passos** | Numerados, reproduzíveis |
| **Resultado esperado** | Verificável e único |
| **Prioridade** | Para quando faltar tempo — e sempre falta |
| **Rastreabilidade** | A qual story pertence |

### O teste do caso de teste

**Outra pessoa consegue executar sem te perguntar nada?** Se a resposta é não, está
incompleto. É o único critério que importa.

### Ruim × bom

**Ruim:**

> **Título:** Testar transferência
> **Passos:** Fazer uma transferência entre contas
> **Esperado:** Deve funcionar corretamente

Três problemas fatais: não diz quais contas nem com que saldo; "deve funcionar" não é
verificável; e se falhar, ninguém sabe qual regra foi violada.

**Bom:**

> **ID:** CT-014 · **Story:** FIN-15 · **Prioridade:** Alta
> **Título:** Transferência entre contas próprias debita a origem e credita o destino
>
> **Pré-condições:**
> 1. Usuário `qa@teste.com` autenticado com token válido
> 2. Conta A "Corrente", `checking`, saldo R$ 1.000,00, `allow_negative = false`
> 3. Conta B "Poupança", `savings`, saldo R$ 0,00
>
> **Dados:** `amount: 250.00`, `date` = hoje, `type: transfer`
>
> **Passos:**
> 1. `POST /v1/transactions` com `type: transfer`, `account_id` = A, `destination_account_id` = B, `amount: 250.00`, `date` = hoje
> 2. `GET /v1/accounts`
> 3. `GET /v1/transactions?account_id=<A>`
>
> **Resultado esperado:**
> 1. Passo 1 retorna **201** com `transfer_pair_id` preenchido
> 2. Passo 2: conta A com `balance: 750.00` e conta B com `balance: 250.00`
> 3. Passo 3: **duas** transações do tipo `transfer` ligadas pelo `transfer_pair_id`, uma em cada conta
>
> **Validação no banco:**
> ```sql
> SELECT id, account_id, type, amount, transfer_pair_id
> FROM transactions
> WHERE transfer_pair_id IS NOT NULL AND deleted_at IS NULL;
> ```

A diferença não é tamanho — é **precisão**. Cada afirmação do resultado esperado pode ser
provada verdadeira ou falsa, sem discussão.

---

## 3. Critérios de aceite e Given/When/Then

Critério de aceite é do **PO**: as condições para a story ser aceita. Caso de teste é
**seu**: como você verifica.

O formato padrão vem do BDD:

```gherkin
Dado que [contexto inicial]
Quando [ação]
Então [resultado observável]
E [resultado adicional]
```

Aplicado à story de orçamento:

```gherkin
Cenário: Alerta dispara ao atingir o limite configurado
  Dado que existe um orçamento de R$ 1.000,00 para a categoria "Alimentação"
    E que o alert_threshold está configurado em 80%
    E que já foram gastos R$ 790,00 na categoria no período
  Quando eu registrar uma despesa de R$ 10,00 nessa categoria
  Então o campo usage_percent deve retornar 80
    E o campo alert_triggered deve retornar true
```

**Por que Given/When/Then é bom:** força três coisas que a gente esquece — o **estado
inicial** (Dado), a **ação única** (Quando) e o **resultado observável** (Então).

**O erro clássico:** colocar ação no "Dado" ou verificação no "Quando". Se o seu "Quando"
tem duas ações, são dois cenários.

**Noções de BDD:** é uma prática em que essas frases são escritas *antes* do código, em
conjunto por PO, dev e QA — as três cabeças, o mesmo entendimento, antes de existir
código. Ferramentas como Cucumber transformam esse texto em teste automatizado. Você não
precisa disso agora; precisa saber o que é e por que existe.

---

## 4. Prioridade dos casos

Sempre falta tempo. Priorizar não é opcional.

| Prioridade | O que entra | Executa quando |
| --- | --- | --- |
| **Alta** | Caminho feliz principal + regras de dinheiro + segurança | Sempre, toda build |
| **Média** | Validações, erros esperados, filtros | Toda sprint |
| **Baixa** | Casos extremos raros, campos opcionais, cosmético | Quando dá |

**Critério prático:** *se isso quebrar em produção, o usuário perde dinheiro, perde
acesso, ou vê dado de outra pessoa?* Se sim, é Alta. Sem discussão.

Num sistema financeiro, "saldo calculado errado" é sempre Alta, mesmo que a chance de
acontecer seja baixa. Impacto manda mais que probabilidade quando o assunto é dinheiro.

---

## 5. Rastreabilidade

É a corrente que liga tudo:

```
Requisito (README) → Story (FIN-15) → Critério de aceite → Caso de teste (CT-014) → Execução → Bug (FIN-42)
```

Serve para responder três perguntas que aparecem de verdade no trabalho:

1. *"Essa story foi testada?"* — mostra os casos vinculados e o resultado.
2. *"Esse bug afeta o quê?"* — sobe do bug para a story e para o requisito.
3. *"Se mudarmos essa regra, o que preciso retestar?"* — desce do requisito para os casos.

No Qase, vincular cada caso à story do Jira faz a corrente sozinha. É por isso que
configuramos a integração.

---

## 6. Sua vez

A Sprint 2 tem stories de **Contas** e **Categorias**.

Etapa 1 — **Cenários.** Em `qa-course/sprints/sprint-2/entregas/06-cenarios.md`, liste
todos os cenários das stories da sprint. Uma linha cada, sem detalhar. Mire em pelo menos
20. Use as técnicas do Módulo 05 como checklist para não esquecer classe nenhuma.

Etapa 2 — **Um caso modelo, escrito por mim.** Peça: `/qa-curso modulo 6 exemplo`. Eu
escrevo um caso completo de conta, comentando cada decisão. Estude e use como referência.

Etapa 3 — **Oito casos, escritos por você.** Em
`qa-course/sprints/sprint-2/entregas/06-casos-contas.md`, use o template em
`qa-course/templates/caso-de-teste.md`. Cubra obrigatoriamente:

- criação de conta com dados válidos
- pelo menos dois casos de valor limite
- exclusão de conta **sem** transações
- exclusão de conta **com** transações
- listagem com o saldo consolidado
- pelo menos um caso de categoria com tipo incompatível
- pelo menos um caso envolvendo dois usuários diferentes

Etapa 4 — **Critérios de aceite.** Escreva em Given/When/Then os critérios de aceite de
duas stories da sprint, como se você fosse ajudar a Renata a completá-las.

Etapa 5 — **Revisão.** `/qa-curso revisar qa-course/sprints/sprint-2/entregas/06-casos-contas.md`

Prepare-se: a primeira revisão volta bem marcada. É assim para todo mundo. O que
importa é que a segunda volte mais limpa.

Etapa 6 — Cadastre os casos aprovados no Qase, vinculados às stories.

---

## 7. Como a IA ajuda aqui

Este é **o** uso de IA mais comum em QA hoje. Vale entender bem os dois lados.

**O que ela faz muito bem: volume e formato.**

> Aqui está o critério de aceite de uma story: *(cole)*. Escreva 8 casos de teste no
> formato ID, título, pré-condições, dados, passos, resultado esperado. Inclua casos
> negativos e de valor limite.

Ela devolve oito casos bem formatados em vinte segundos. Digitar isso na mão leva uma
hora. **Esse ganho é real e é por isso que times adotaram IA.**

Ela também é ótima em:
- converter caso de teste em Given/When/Then e vice-versa;
- traduzir casos para inglês;
- gerar o CSV de importação do Qase;
- **revisar** os seus casos: *"esse caso de teste está completo? o resultado esperado é
  verificável?"* — como segunda opinião, é excelente.

**Onde ela falha, e é sempre no mesmo lugar: o resultado esperado.**

Ela não conhece o seu sistema. Vai escrever "deve retornar 400" onde esta API retorna
422, "deve excluir a conta" onde a regra manda 409. **Caso de teste com resultado esperado
errado é pior do que não ter caso de teste**, porque ele gera bug report falso — e depois
que você abre dois bugs que não existem, o dev passa a ler os seus tickets com má vontade.
Credibilidade de QA leva meses para construir e uma semana para perder.

Ela também produz **casos redundantes com cara de completude**: cinco casos que são a
mesma partição de equivalência, o que dá a sensação de cobertura sem cobertura nenhuma.
Só quem domina o Módulo 05 percebe isso.

E ela **não conhece o risco do seu negócio**. Não sabe que nesta empresa o cálculo de
saldo é sagrado e o campo `icon` não interessa a ninguém. Priorização é sua.

**O fluxo que um QA sênior usa de verdade:**

1. Você lista os cenários — **essa parte é sua**, sai do requisito e do risco.
2. IA transforma cenário em caso formatado.
3. Você revisa **linha por linha** o resultado esperado, contra o README e o Swagger.
4. Você corta os redundantes e prioriza.

Repare que a IA entra no meio, na parte mecânica. As pontas — decidir o que testar e
validar o que é esperado — continuam suas. É exatamente por isso que a profissão não
acabou: o gargalo nunca foi digitar.

**Regra desta sprint:** os oito casos da Etapa 3 são escritos por você, à mão. Na Sprint 3
você libera a IA para a formatação e a gente compara a qualidade. Você vai ver a
diferença — e vai saber revisar.

---

## 8. Vocabulário

| Inglês | Significa |
| --- | --- |
| **test scenario** | cenário de teste |
| **test case** | caso de teste |
| **preconditions** | pré-condições |
| **test steps** | passos |
| **expected result** | resultado esperado |
| **actual result** | resultado obtido |
| **acceptance criteria** | critérios de aceite |
| **traceability matrix** | matriz de rastreabilidade |
| **given / when / then** | dado / quando / então |
| **BDD** | behavior-driven development |

---

Fim da teoria da Sprint 2. Agora rode `/qa-curso build` e vá testar de verdade.

Próximo: `/qa-curso modulo 7` — SQL para QA.
