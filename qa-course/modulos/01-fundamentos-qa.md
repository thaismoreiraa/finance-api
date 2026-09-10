# Módulo 01 — Fundamentos de QA

**Sprint 1 · ~3 horas**

---

## Por que isso importa

Toda entrevista de QA júnior começa com alguma variação de "o que é QA?". A resposta
decorada da internet é reconhecível a um quilômetro. A resposta boa usa exemplo próprio —
e no fim deste curso você vai ter os seus.

---

## 1. QA × QC × Testing

Três palavras que quase todo mundo usa como sinônimo e não são.

| | O que é | Quando acontece | Pergunta que responde |
| --- | --- | --- | --- |
| **QA** — Quality Assurance | Garantir que o **processo** produz qualidade | Durante todo o desenvolvimento | "Estamos construindo do jeito certo?" |
| **QC** — Quality Control | Verificar se o **produto** ficou correto | Depois de construído | "O que foi construído está certo?" |
| **Testing** | A atividade de executar e verificar | Dentro do QC | "Isso funciona?" |

**No finance-api:**

- **QA** é você, no refinement, perguntando à PO: *"o que acontece se a conta de destino
  da transferência for a mesma conta de origem?"*. Você preveniu um bug antes de existir
  uma linha de código. Isso é assurance.
- **QC** é você conferindo, depois de pronto, se a transferência realmente criou duas
  transações espelhadas.
- **Testing** é o ato de mandar o `POST /transactions` e olhar a resposta.

QA é o guarda-chuva. Prevenção vale mais que detecção — achar o bug no refinement custa
uma pergunta; achar em produção custa dinheiro e cliente.

---

## 2. Os 7 princípios de teste

Não decore a lista. Entenda dois deles de verdade, porque são os que aparecem no dia a dia.

**1. Teste mostra a presença de defeitos, nunca a ausência.**
Você nunca vai poder dizer "o sistema está sem bugs". Só "eu executei 47 casos e 3
falharam". Isso muda como você se comunica: nunca prometa que não tem bug.

**2. Teste exaustivo é impossível.**
O campo `amount` de uma transação aceita infinitos valores. Você não vai testar todos —
vai testar 0, um negativo, um positivo, um com centavos, um absurdamente grande. Isso é
o Módulo 05 inteiro.

**3. Teste cedo (*shift left*).**
Quanto antes, mais barato.

**4. Agrupamento de defeitos.**
Bugs se concentram. Se você achou dois na transferência, procure o terceiro **ali**.
Vale ouro neste curso.

**5. Paradoxo do pesticida.**
Rodar sempre os mesmos casos para de achar bug. Por isso existe teste exploratório.

**6. Teste depende do contexto.**
Testar uma API financeira não é como testar um blog. Aqui, errar centavos é grave.

**7. Ausência de erros é uma falácia.**
Um sistema sem bugs que não resolve o problema do usuário é inútil.

---

## 3. Erro × Defeito × Falha

A confusão mais comum em entrevista.

| Termo | O que é | No finance-api |
| --- | --- | --- |
| **Erro** (*error/mistake*) | O engano humano | O dev pensou "excluir só precisa reverter receita" |
| **Defeito** (*defect/bug*) | O erro materializado no código | A linha que reverte o saldo só trata `income` |
| **Falha** (*failure*) | O comportamento errado observado | Você exclui uma despesa de R$ 200 e o saldo não volta |

Você observa a **falha**. Reporta o **defeito**. O **erro** foi a causa.
Isso importa na prática: nem todo defeito vira falha (pode estar num caminho que ninguém
executa), e é por isso que "não deu erro nenhum" não significa "não tem bug".

---

## 4. Níveis de teste e a pirâmide

Este projeto tem os três níveis escritos, o que é raro — vamos olhar código de verdade.

```
        /\        E2E          tests/e2e/          poucos, lentos, caros
       /  \                    fluxo inteiro pela API
      /----\     Integração    tests/integration/  alguns
     /      \                  serviço + banco de verdade
    /--------\   Unitário      tests/unit/         muitos, rápidos, baratos
```

Abra `tests/unit/utils/pagination.test.js`. É um teste unitário: pega **uma função
isolada** e verifica a saída para uma entrada. Não sobe banco, não sobe servidor. Roda
em milissegundos.

Agora abra `tests/e2e/transactions.e2e.test.js`. É outro mundo: cria usuário, faz login,
cria conta, cria transação, confere saldo. Passa pela API inteira e pelo banco. É lento,
mas é o que mais se parece com o uso real.

Rode os dois e sinta a diferença:

```bash
npm run test:unit
npm run test:e2e
```

**Por que a pirâmide é pirâmide?** Porque teste unitário é barato e específico — quando
falha, você sabe exatamente onde. E2E é caro e vago — quando falha, pode ser qualquer
coisa no caminho. Time que inverte a pirâmide (muito E2E, pouco unitário) tem suíte
lenta e instável.

**Onde o QA manual entra?** Acima de tudo isso. Os testes automatizados verificam o que
o dev **pensou** em verificar. Você verifica o que ninguém pensou.

> ### Exercício de leitura — vale mais que teoria
>
> Abra `tests/unit/services/TransactionService.test.js` e responda:
> **o que o dev testou, e o que ele deixou de fora?**
>
> Não precisa entender JavaScript. Leia os nomes dos testes — eles são frases. Faça
> uma lista de duas colunas: "coberto" e "não vi teste para isso". Traga a lista.
>
> Essa é a habilidade que separa QA júnior de QA que o time chama para o refinement.

---

## 5. Tipos de teste

| Tipo | Quando você usa | Exemplo no finance-api |
| --- | --- | --- |
| **Funcional** | Verificar se a regra funciona | Transferência debita a origem e credita o destino |
| **Smoke** | Build nova chegou: dá para testar? | Login funciona, `GET /accounts` responde 200. 5 minutos |
| **Sanity** | Correção pontual chegou: aquilo específico melhorou? | O saldo agora reverte ao excluir despesa |
| **Reteste** | Validar a correção de **um bug específico** | Repetir os passos exatos do FIN-42 |
| **Regressão** | O que já funcionava continua funcionando? | Depois de mexer no saldo, refazer os testes de transferência e orçamento |
| **Exploratório** | Sem roteiro, caçando o inesperado | Módulo 09 |
| **Usabilidade** | A experiência faz sentido? | Numa API: as mensagens de erro explicam o que fazer? |
| **Performance** | Aguenta carga? | `GET /transactions` com 10.000 registros |

**A diferença que mais cai em entrevista — reteste × regressão:**
Reteste é mirado no bug corrigido. Regressão é ao redor dele, procurando o estrago que a
correção causou. Você faz os dois, sempre nessa ordem.

---

## 6. SDLC, STLC e V-Model

**SDLC** é o ciclo de vida do software: requisito → design → desenvolvimento → teste →
entrega → manutenção.

**STLC** é o ciclo de vida do teste, que roda dentro dele:

```
análise de requisito → planejamento → desenho dos casos →
preparação do ambiente → execução → encerramento
```

Repare que **executar teste é só a quinta etapa**. Quase todo mundo acha que QA é a
quinta etapa. O trabalho de verdade está antes.

**V-Model** é a mesma coisa desenhada em V, mostrando que cada etapa de construção tem
uma etapa de verificação correspondente — e que o teste de aceitação é planejado lá no
começo, junto com o requisito, não no fim.

```
Requisito ──────────────────── Teste de aceitação
  Análise ──────────────────  Teste de sistema
    Design ──────────────  Teste de integração
      Código ─────────  Teste unitário
```

Neste curso você vive o V toda sprint: recebe a story, escreve o caso de teste **antes**
da build chegar, e executa quando ela chega.

---

## 7. Sua vez

Em `qa-course/sprints/sprint-1/entregas/01-fundamentos.md`:

1. A tabela de leitura dos testes do dev (exercício da seção 4).
2. Com suas palavras, três a cinco linhas: **o que é QA e qual a diferença para testing**,
   usando um exemplo do finance-api. Essa é a resposta que você vai dar na entrevista —
   escreva como se estivesse falando.
3. Classifique cada situação em erro, defeito ou falha:
   - a. O saldo da conta ficou R$ 200 menor do que a soma das transações.
   - b. A dev esqueceu que transferência tem duas pernas.
   - c. A função de exclusão não trata `transfer_pair_id`.
4. Dê um exemplo, no finance-api, de teste de **sanity** e um de **regressão**, e explique
   por que são diferentes.

---

## 8. Como a IA ajuda aqui

**Onde ela é boa:** explicar conceito sob medida. Em vez de ler dez artigos sobre
V-Model, pergunte:

> Me explique V-Model usando como exemplo uma API REST de finanças pessoais com contas
> e transações. Sou iniciante, não use jargão sem definir.

**Onde ela atrapalha um iniciante:** ela responde qualquer pergunta com confiança, então
você não sente onde está a sua lacuna. Um conceito que você "entendeu lendo" some em duas
semanas; um conceito que você aplicou fica.

**A regra:** use IA para *entender*, nunca para *entregar*. Se você me mandar a resposta
do item 2 escrita por IA, eu vou perceber — texto de IA sobre QA tem um cheiro específico
(muito "garantir a qualidade do produto final", nenhum exemplo concreto do projeto). E
mais importante: em entrevista, você não tem a IA ao lado.

**O que um QA sênior faz de verdade com IA nesta etapa:** pede para ela ser a
entrevistadora. *"Me faça 10 perguntas de entrevista para QA júnior sobre fundamentos de
teste, uma por vez, e critique minhas respostas."* Isso é treino, não muleta.

---

## 9. Vocabulário

| Inglês | Significa |
| --- | --- |
| **quality assurance** | garantia de qualidade — foco no processo |
| **quality control** | controle de qualidade — foco no produto |
| **defect / bug** | defeito no código |
| **failure** | falha — o comportamento errado observado |
| **test level** | nível de teste (unit, integration, e2e) |
| **test type** | tipo de teste (funcional, regressão…) |
| **smoke test** | teste rápido de "dá para prosseguir?" |
| **regression testing** | teste de regressão |
| **shift left** | testar mais cedo no ciclo |
| **coverage** | cobertura |

---

Próximo: `/qa-curso modulo 2` — Ágil, Scrum e o QA na sprint.
