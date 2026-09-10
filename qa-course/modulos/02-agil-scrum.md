# Módulo 02 — Ágil, Scrum e o QA na sprint

**Sprint 1 · ~2 horas**

---

## Por que isso importa

A pergunta "como é o seu dia a dia numa sprint?" separa quem já trabalhou de quem só
estudou. Não dá para responder bem sem ter vivido. É por isso que este curso inteiro é
uma sprint atrás da outra.

---

## 1. O problema que o ágil resolve

Antes, se construía software como se constrói prédio: seis meses levantando requisito,
seis meses codando, dois meses testando, e no fim o cliente dizia "não era isso".

O ágil quebrou isso em ciclos curtos. A cada duas semanas, alguma coisa funcionando na
mão do usuário. Para o QA a mudança é enorme: você não testa mais no fim, testa junto —
e participa desde o momento em que a funcionalidade é descrita.

---

## 2. Os papéis

| Papel | Responsabilidade | No nosso time |
| --- | --- | --- |
| **PO** (Product Owner) | Decide **o quê** e em que ordem. Dona do backlog e do valor de negócio | **Renata** |
| **Scrum Master** | Faz o processo funcionar, remove impedimentos, protege o time | **Paula** |
| **Dev** | Constrói | **Marcelo** |
| **QA** | Garante que o que foi construído é o que foi pedido, e que continua funcionando | **você** |

Em time ágil o QA **não é um portão no fim da esteira**. É membro do time, do primeiro
dia da sprint ao último.

---

## 3. As cerimônias e o que você faz em cada uma

### Refinement (refinamento)

O PO apresenta o que vem por aí. O time pergunta, estima e detalha.

**É a cerimônia mais importante para você**, e a maioria dos QA júnior fica quieto nela.
Seu trabalho aqui é fazer as perguntas que ninguém fez. Você pensa em exceção
profissionalmente — o dev pensa em como construir, o PO pensa em valor, e ninguém
pergunta o que acontece quando dá errado.

Story real que a Renata vai te entregar:

> *"Como usuário, quero transferir dinheiro entre minhas contas."*

Perguntas que um QA faz nessa hora:

- E se a conta de destino for a mesma da origem?
- E se o saldo não cobrir? Depende do `allow_negative` da conta?
- Posso transferir valor zero? Negativo?
- Transferência pode ser agendada para o futuro?
- Se eu excluir a transferência depois, as duas pernas somem?
- A transferência entra no orçamento como despesa?

Cada pergunta dessas é um bug que não vai existir. **É assim que você prova valor
no primeiro mês de emprego.**

### Planning

O time decide o que cabe na sprint. Você diz quanto tempo precisa para testar e
levanta impedimento: *"a FIN-25 depende de massa de teste que eu não tenho ainda"*.

Erro clássico de júnior: aceitar sprint em que todas as stories ficam prontas na
sexta-feira. Você vira gargalo e ou testa mal, ou a sprint estoura.

### Daily

15 minutos, três perguntas: o que fiz, o que vou fazer, o que me impede.

Sua daily de QA soa assim:
> *"Ontem escrevi os casos da FIN-28 e executei os de conta. Hoje começo transferências.
> Estou bloqueada na FIN-25 — o endpoint volta 500 e não consigo seguir."*

Curto, específico, e o impedimento é dito em voz alta. Daily não é relatório de status
para o chefe; é sincronização entre pares.

### Review (demo)

O time mostra o que ficou pronto para o PO e stakeholders. Você já testou tudo — a review
não é o momento de descobrir bug. Se um bug aparece na review, alguma coisa falhou antes.

### Retrospective

O time olha para o **processo**, não para o produto. O que foi bem, o que foi mal, o que
mudamos. É onde você diz "as builds chegaram todas na quinta e eu não tive tempo" — e
isso é ouvido, sem culpar ninguém.

Neste curso, toda retro tem um item fixo: **qual bug escapou, e por quê**.

---

## 4. User Story

Formato:

> **Como** [quem], **quero** [o quê], **para** [por quê].

O "para" é a parte que todo mundo pula e é a que mais importa — é ela que te diz o que
realmente precisa funcionar.

> *Como usuário, quero definir um orçamento mensal por categoria, **para saber quando
> estou gastando demais.***

Esse "para" te diz que o coração da funcionalidade é o **alerta**, não o cadastro. Se o
alerta dispara na hora errada, a story falhou mesmo com o CRUD perfeito. É por isso que
você vai testar `alert_threshold` com carinho.

### INVEST — como reconhecer story ruim

| Letra | Significa | Cheiro de story ruim |
| --- | --- | --- |
| **I**ndependent | Não depende de outra | "depende da FIN-30 estar pronta" |
| **N**egotiable | Não é especificação fechada | vem com solução técnica pronta |
| **V**aluable | Tem valor para alguém | "refatorar o service" não é story |
| **E**stimable | Dá para estimar | ninguém sabe o tamanho |
| **S**mall | Cabe numa sprint | "fazer o módulo financeiro" |
| **T**estable | **Dá para verificar** | "o sistema deve ser rápido" |

O **T** é seu. Se você não consegue imaginar como provar que a story está pronta, ela
não está pronta para entrar na sprint — e falar isso no refinement é sua obrigação.

---

## 5. Critérios de aceite e Definition of Done

**Critério de aceite** é por story: as condições que fazem ela ser aceita.

> Dado que tenho uma conta com saldo R$ 500 e `allow_negative = false`
> Quando eu tentar transferir R$ 700 para outra conta
> Então a API deve retornar 422 com `code: INSUFFICIENT_BALANCE`
> E o saldo das duas contas deve permanecer inalterado

**Definition of Done** é do time inteiro, vale para toda story. Nossa DoD:

- [ ] Código na branch e revisado
- [ ] Testes automatizados do dev passando
- [ ] Casos de teste escritos e executados pelo QA
- [ ] Nenhum defeito de severidade Alta ou Crítica em aberto
- [ ] Documentação (Swagger) atualizada
- [ ] Evidências anexadas no Jira

Repare: **story sem QA não está Done.** Isso não é favor, é a regra do time — e é por
isso que a Paula corta o "a gente testa depois".

---

## 6. Sua vez

Em `qa-course/sprints/sprint-1/entregas/02-agil.md`:

1. Leia a story FIN-01 em `qa-course/sprints/sprint-1/stories.md` e escreva
   **no mínimo 8 perguntas de refinement**. Não vale perguntar coisa que o README
   responde — vale perguntar o que ele não responde.
2. Escreva a sua daily de amanhã, fictícia, incluindo um impedimento.
3. Avalie a FIN-01 pelo INVEST. Ela é testável do jeito que está? O que falta?

Depois de entregar, rode `/qa-curso sprint 1`: eu viro a Renata e respondo suas perguntas
uma a uma. As que você não fizer viram bug lá na frente. Sem aviso.

---

## 7. Como a IA ajuda aqui

**O uso mais valioso do curso inteiro está aqui:** IA é excelente em gerar listas de
perguntas de refinement. Ela é incansável em pensar em exceção — que é justamente onde o
cérebro humano cansa depois da quinta pergunta.

> Sou QA e vou para um refinement. A story é: "Como usuário, quero transferir dinheiro
> entre minhas contas." O sistema é uma API de finanças pessoais com contas que têm saldo
> e uma flag allow_negative. Liste perguntas que exponham ambiguidade e casos de exceção
> que o PO provavelmente não pensou.

**Onde ela falha:** ela não conhece o seu produto. Vai perguntar sobre limite diário de
transferência e antifraude — coisas que não existem aqui. Metade da lista vai ser ruído,
e **separar o ruído exige que você conheça o sistema**. Por isso a ordem do curso é
técnica primeiro, IA depois.

**O erro que custa caro:** levar a lista da IA crua para o refinement. Você queima
quinze minutos do time com perguntas irrelevantes e perde credibilidade. Gere, filtre,
priorize as cinco melhores, e **entenda cada uma** — porque a Renata vai perguntar
"por que isso importa?" e você precisa saber responder.

**Regra deste exercício:** escreva as suas 8 perguntas primeiro, sozinha. Depois, se
quiser, gere com IA e compare. O que ela pensou e você não é o seu ponto cego — e
descobrir o próprio ponto cego vale mais que a lista.

---

## 8. Vocabulário

| Inglês | Significa |
| --- | --- |
| **backlog** | lista priorizada de trabalho |
| **sprint** | ciclo de trabalho, aqui de 2 semanas |
| **refinement / grooming** | detalhamento das stories |
| **acceptance criteria** | critérios de aceite |
| **definition of done** | definição de pronto |
| **impediment / blocker** | impedimento |
| **stakeholder** | parte interessada |
| **story points** | unidade de estimativa de esforço |

---

Próximo: `/qa-curso modulo 3` — Jira e Qase na prática.
