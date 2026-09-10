# Módulo 11 — Performance, relatório final e portfólio

**Sprint 5 · ~4 horas · fechamento**

---

## Por que isso importa

Falta uma coisa para o seu projeto virar portfólio: alguém precisa conseguir **entender o
que você fez** sem você estar do lado explicando.

E falta uma noção de performance — não para você virar especialista, mas para não travar
quando o entrevistador perguntar "você já testou performance?".

---

## 1. Noções de performance

### Os tipos (saiba a diferença, não precisa dominar)

| Tipo | Pergunta que responde |
| --- | --- |
| **Load** (carga) | Aguenta o volume esperado do dia a dia? |
| **Stress** | Onde quebra? E como quebra — degrada ou cai? |
| **Spike** (pico) | Aguenta uma multidão de uma vez? |
| **Soak** (resistência) | Aguenta horas rodando? Vaza memória? |
| **Volume** | Aguenta uma base grande de dados? |

### O que dá para fazer sem ferramenta nenhuma

Você já tem o Postman e ele mede tempo de resposta:

```javascript
pm.test("Responde em menos de 500ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(500);
});
```

**O teste de volume que importa aqui.** Esta API tem paginação e filtros em
`GET /v1/transactions`. Com 20 transações tudo é rápido. A pergunta é: e com 10.000?

Gere massa direto no banco:

```sql
INSERT INTO transactions (id, user_id, account_id, type, amount, date, status, description)
SELECT
  gen_random_uuid(),
  '<seu-user-id>',
  '<sua-account-id>',
  CASE WHEN random() < 0.5 THEN 'income' ELSE 'expense' END,
  round((random() * 500 + 1)::numeric, 2),
  CURRENT_DATE - (random() * 365)::int,
  'confirmed',
  'Carga de teste ' || g
FROM generate_series(1, 10000) AS g;
```

> `generate_series(1, 10000)` gera 10.000 linhas. `random()` varia os valores, inclusive
> os centavos — que é justamente onde bug de arredondamento aparece.
>
> **Depois disso o saldo da conta não vai bater com as transações**, porque você inseriu
> por fora da aplicação. Use uma conta separada só para carga, ou refaça a massa depois.

Agora meça:

| O que medir | Como |
| --- | --- |
| `GET /transactions` sem filtro | tempo antes e depois da carga |
| Com filtro de data | o índice está ajudando? |
| Última página (`?page=500`) | costuma ser bem mais lenta que a primeira |
| `GET /reports/summary` | agregação em cima de 10 mil linhas |
| `GET /accounts` | o saldo consolidado ficou lento? |

Se algum passar de dois segundos, é achado legítimo. Reporte como bug de performance, com
o número, o volume de dados e o critério: *"`GET /transactions` leva 4,2s com 10.000
registros; com 20 registros levava 80ms."*

### Se quiser ir além (opcional)

**k6** (`k6.io`) é a ferramenta mais amigável para quem vem de JavaScript:

```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = { vus: 10, duration: '30s' };

export default function () {
  const res = http.get('http://localhost:3000/v1/accounts', {
    headers: { Authorization: `Bearer ${__ENV.TOKEN}` },
  });
  check(res, { 'status 200': (r) => r.status === 200 });
}
```

`vus: 10` = 10 usuários virtuais simultâneos por 30 segundos. É o suficiente para dizer
com honestidade em entrevista que você já rodou um teste de carga.

**O que não fazer:** dizer que sabe performance porque rodou k6 uma vez. Diga a verdade —
*"tenho noções, rodei teste de carga básico com k6 e sei interpretar tempo de resposta e
taxa de erro"*. Honestidade calibrada vale mais que exagero, e sênior percebe exagero na
segunda pergunta.

---

## 2. O relatório final de testes

Um relatório responde a uma pergunta: **podemos liberar?** Tudo que não ajuda a responder
isso é enfeite.

Use `qa-course/templates/relatorio-de-testes.md`. O relatório final do projeto consolida
as cinco sprints.

**As três seções que realmente importam:**

**Resumo executivo** — cinco linhas, para quem não vai ler o resto:

> Foram executados 87 casos de teste ao longo de 5 sprints, cobrindo autenticação,
> contas, categorias, transações, orçamentos, metas e relatórios. Foram encontrados 23
> defeitos, sendo 1 crítico (vazamento de dados entre usuários) e 6 de severidade alta,
> a maioria concentrada no cálculo de saldo. 21 foram corrigidos e validados; 2
> permanecem abertos com aceite do PO. **Recomendação: liberar com ressalvas.**

**Recomendação com justificativa.** Liberar, liberar com ressalvas, ou não liberar — e
por quê. Você não decide sozinha se libera; você **recomenda com base em evidência**, e
o negócio decide. Saber essa fronteira é sinal de maturidade.

**Riscos e o que não foi testado.** A seção mais honesta e a que mais impressiona:

> Não foi testado: comportamento com múltiplas requisições simultâneas na mesma conta
> (risco de condição de corrida no cálculo de saldo); importação de CSV com arquivos
> acima de 1MB; comportamento após expiração do refresh token de 7 dias.

QA júnior esconde o que não testou. QA sênior declara, porque **risco não declarado é
risco que o negócio assume sem saber**.

---

## 3. Fechando o portfólio

Tudo o que você produziu precisa estar legível para um estranho.

### O README do seu trabalho de QA

Crie `qa-course/PORTFOLIO.md` com:

1. **O que é** — a API testada, em três linhas.
2. **Como você trabalhou** — o ciclo: story → critério de aceite → caso de teste →
   execução → bug → reteste → regressão → relatório. Com print do board.
3. **Números** — casos escritos, executados, defeitos por severidade, sprints.
4. **Destaques** — os três bugs mais interessantes que você achou. Para cada um: o report,
   como você chegou nele e qual técnica usou. **Esta é a seção que o entrevistador lê.**
5. **Ferramentas** — Jira, Qase, Postman, SQL, Git, Docker.
6. **O que você faria diferente** — autocrítica honesta vale mais que lista de conquistas.

### Sobre os bugs de destaque

Escolha por **variedade de técnica**, não por gravidade. Um achado por valor limite, um
por conciliação no banco, um por exploratório. Isso mostra repertório.

Escreva assim:

> **Saldo não revertido ao excluir despesa** — encontrado ao conciliar o campo `balance`
> com a soma das transações confirmadas via SQL, depois de executar os casos de exclusão.
> A API respondeu 204 e a transação foi corretamente marcada como excluída, então o
> defeito era invisível pela resposta. Severidade Alta: o saldo fica permanentemente
> incorreto, sem correção possível pela aplicação.

Repare no que essa narrativa mostra: **método**, não sorte. Ninguém contrata sorte.

### Git

```bash
git switch -c qa/portfolio-final
git add qa-course/
git commit -m "docs: relatório final e portfólio de QA do projeto finance-api"
git push -u origin qa/portfolio-final
```

Abra o **Pull Request** no GitHub, descrevendo o que está entregando. Esse PR é a prova
de que você entende o fluxo `branch → commit → push → PR → review → merge` — e ele fica
público no seu perfil.

---

## 4. Sua vez

1. Gere 10.000 transações e meça os endpoints da tabela da seção 1.
2. Reporte os achados de performance que passarem do critério.
3. Escreva o relatório final consolidando as cinco sprints.
4. Escreva o `PORTFOLIO.md`.
5. Abra o PR.
6. `/qa-curso revisar qa-course/PORTFOLIO.md` — revisão final, com rigor de entrevista.

---

## 5. Como a IA ajuda aqui

**Gerar massa de carga.** SQL de `generate_series`, script de k6, payloads variados — ela
faz bem e economiza horas. Um cuidado: **peça massa realista**. Se todas as transações
tiverem valor redondo e data de hoje, o teste de volume não representa nada e você perde
os bugs de arredondamento e de intervalo de datas.

**Escrever o relatório.** Dê os números e peça o resumo executivo. Ela organiza bem e o
tom sai profissional. **Mas os números são seus** — se você deixar ela estimar, ela
inventa, e relatório com número inventado é falta grave em qualquer empresa.

**Revisar o portfólio.** *"Leia este portfólio de QA como se fosse um recrutador técnico
avaliando uma candidata júnior. O que está fraco? O que você perguntaria numa
entrevista?"* — excelente. Ela antecipa as perguntas difíceis, e você chega preparada.

**Simular entrevista.** *"Me entreviste para uma vaga de QA júnior. Uma pergunta por vez,
critique cada resposta antes de seguir."* Faça isso umas cinco vezes antes da primeira
entrevista de verdade. É o uso de IA com melhor retorno de todo o curso.

**Onde ela estraga:** portfólio escrito por IA tem cara de portfólio escrito por IA.
Genérico, com "busco sempre garantir a excelência do produto", zero detalhe específico. É
reconhecível na primeira linha e joga contra você. **A sua vantagem é justamente o
detalhe concreto** — o bug do arredondamento de centavos, a query de conciliação, o
argumento que você usou para defender um bug que o dev queria fechar. Nada disso a IA
sabe. Escreva você; use IA só para revisar a clareza.

---

## 6. A pergunta que vai cair: "como você usa IA no seu trabalho?"

Você viu IA em todos os módulos. Consolide numa resposta honesta:

> Uso principalmente em três frentes. Antes do refinement, para gerar listas de perguntas
> sobre casos de exceção — ela pensa em exceção incansavelmente, e eu filtro o que faz
> sentido no contexto do produto. Na escrita de casos de teste, para converter cenários
> que eu defini em casos formatados, revisando linha a linha o resultado esperado, porque
> ela não conhece as regras do sistema e erra justamente aí. E para revisar meus bug
> reports antes de publicar, na pele do desenvolvedor, o que reduziu muito o meu retrabalho
> com "não consegui reproduzir".
>
> O que eu não delego é decidir **o que** testar e **qual o comportamento esperado** — isso
> depende do requisito e do risco do negócio, e é onde ela erra com confiança. Teste
> exploratório também continua manual: ela não percebe que algo está estranho sem ser
> avisada.

Essa resposta mostra três coisas ao mesmo tempo: que você usa a ferramenta, que conhece os
limites dela, e que sabe onde está o seu próprio valor. É bem mais forte do que "uso o
ChatGPT para gerar casos de teste" e infinitamente melhor que "não uso IA".

---

## 7. Vocabulário

| Inglês | Significa |
| --- | --- |
| **load / stress / spike / soak testing** | os tipos de teste de performance |
| **response time** | tempo de resposta |
| **throughput** | vazão — requisições por segundo |
| **virtual user (VU)** | usuário virtual simulado |
| **bottleneck** | gargalo |
| **test summary report** | relatório de encerramento de testes |
| **exit criteria** | critérios de saída — quando parar de testar |
| **release recommendation** | recomendação de liberação |
| **known issues** | defeitos conhecidos e aceitos |

---

## Fim

Você rodou o ciclo completo cinco vezes, com ferramenta de verdade, produto de verdade e
bug de verdade. Isso é mais experiência prática do que a maioria dos candidatos a QA
júnior tem quando aplica.

Segundo o roteiro, é agora que você começa a mandar currículo — e continua estudando
automação em paralelo, durante o processo seletivo. Não espere se sentir pronta: ninguém
se sente.

`/qa-curso status` para ver tudo o que você fez.
