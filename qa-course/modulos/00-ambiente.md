# Módulo 00 — Ambiente e primeiro contato

**Sprint 0 · ~4 horas · pré-requisito de tudo**

---

## Por que isso importa

Sua primeira semana como QA vai ser exatamente isto: receber um repositório, um README
e a missão de fazer aquilo rodar na sua máquina. Ninguém vai te ensinar. E o QA que
consegue subir o ambiente sozinho vira o QA que os devs respeitam.

Também tem um motivo prático: **você não pode testar o que não consegue rodar.**

---

## 1. O que é este sistema

A finance-api é uma API de controle de finanças pessoais. Não tem tela. É um servidor
que recebe requisições e devolve dados em JSON.

O usuário pode:

- criar **contas** (corrente, poupança, cartão, dinheiro);
- lançar **transações** (receita, despesa e transferência entre contas);
- classificar por **categorias**;
- definir **orçamentos** mensais por categoria e receber alerta ao se aproximar do limite;
- guardar dinheiro em **metas**;
- criar **recorrências** (a conta de luz que cai todo mês);
- ver **relatórios** de fluxo de caixa.

Tudo isso guardado em um banco PostgreSQL, com autenticação por token.

**Sua primeira tarefa de QA:** leia o `README.md` da raiz do projeto, seção
"Regras de Negócio". Leia inteiro, sem pressa. É o documento de requisitos do produto —
e é contra ele que você vai julgar se um comportamento é bug ou não.

---

## 2. As peças do ambiente

| Peça | O que é | Por que você precisa |
| --- | --- | --- |
| **Node.js** | O motor que roda a API | Sem ele o servidor não sobe |
| **Docker** | Roda o banco de dados isolado | Instalar PostgreSQL na máquina é dor de cabeça; Docker resolve em um comando |
| **PostgreSQL** | O banco onde os dados ficam | Você vai consultar direto nele, no Módulo 07 |
| **Postman** | Cliente de API | É por onde você vai testar |
| **DBeaver** | Cliente de banco visual | É por onde você vai olhar os dados |

Node já está instalado nesta máquina (v22). Falta o resto.

### Passo 1 — Docker

Baixe o Docker Desktop em `docker.com`, instale e **abra o aplicativo**. Ele precisa
estar rodando (ícone da baleia na barra superior). Confira:

```bash
docker ps
```

Se listar uma tabela vazia, funcionou. Se der erro, o Docker não está aberto.

### Passo 2 — Subir o banco

Na pasta do projeto:

```bash
docker compose up -d
```

Isso lê o `docker-compose.yml` e sobe **dois** bancos: `finance_db` (porta 5432, o de
verdade) e `finance_test_db` (porta 5433, usado pelos testes automatizados do dev).

Confira que subiram:

```bash
docker ps
```

Você deve ver dois contêineres `postgres:15`.

### Passo 3 — Criar as tabelas

O banco subiu vazio. Quem cria as tabelas é a **migration** — um script versionado que
descreve a estrutura do banco:

```bash
npm run migration:run
```

> **Termo novo: migration.** É como um "commit" do banco de dados. Toda vez que o time
> muda a estrutura (nova coluna, nova tabela), cria uma migration. Assim todo mundo tem
> o mesmo banco. Isso importa para você: se um bug só acontece na sua máquina, a primeira
> pergunta é "rodei todas as migrations?".

### Passo 4 — Subir a API

```bash
npm run dev
```

Deve aparecer:

```
Database connected successfully.
Server running on port 3000
```

Deixe esse terminal aberto. Ele é o **log da aplicação** — quando algo quebrar, o erro
aparece aqui. QA que lê log acha a causa raiz; QA que não lê só reporta o sintoma.

### Passo 5 — Abrir a documentação

No navegador: **http://localhost:3000/v1/docs**

Isso é o **Swagger**: a documentação viva da API, gerada a partir do contrato. Ela lista
todos os endpoints, o que cada um recebe e o que devolve, incluindo os status codes.

**Este é o seu documento mais importante depois do README.** Quando você reportar que a
API devolveu 400 onde o Swagger diz 409, você não está dando opinião — está apontando
uma quebra de contrato documentado.

Passe dez minutos só navegando por ele. Não precisa entender tudo.

---

## 3. Primeiro contato: criar seu usuário

No Swagger, procure `POST /auth/register`, clique em **Try it out** e envie:

```json
{
  "name": "Thais QA",
  "email": "qa@teste.com",
  "password": "senha12345",
  "currency": "BRL"
}
```

A resposta traz um `access_token`. Guarde: é ele que prova quem você é em toda chamada
seguinte. Sem ele, tudo devolve 401.

Agora tente `GET /accounts` **sem** o token. Deu 401? Ótimo — esse é o seu primeiro
teste executado, e ele passou.

---

## 4. Git: o mínimo, agora

Você vai versionar tudo o que produzir neste curso. O fluxo é sempre o mesmo:

```bash
git status                          # o que mudou
git add qa-course/                  # separo o que quero salvar
git commit -m "docs: casos de teste da sprint 2"   # salvo com uma descrição
git push                            # envio para o GitHub
```

E para trabalhar em cima de uma build do dev:

```bash
git switch build/sprint-2           # mudo para a branch da build
git pull                            # trago as correções mais recentes
```

> **Termo novo: branch.** Uma linha do tempo paralela do código. A `main` é a linha
> principal; `build/sprint-2` é a versão que o dev entregou para você testar. Trocar de
> branch troca os arquivos na sua pasta — por isso, **sempre confira em qual branch você
> está antes de testar**. Testar a branch errada e reportar bug que não existe é um
> clássico de QA júnior.

Configure seu nome:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

---

## 5. Sua vez

1. Suba o ambiente inteiro e chegue até o Swagger aberto no navegador.
2. Crie seu usuário via `POST /auth/register`.
3. Crie **uma conta** via `POST /accounts`, com `initial_balance: 1000`.
4. Liste as contas com `GET /accounts` e confira que o saldo está lá.
5. Anote em `qa-course/sprints/sprint-1/entregas/00-setup.md`:
   - o que deu errado no caminho e como você resolveu;
   - quanto tempo levou;
   - qualquer coisa no README ou no Swagger que você não entendeu.

O item 5 não é enfeite. Um QA que documenta a própria dor de setup é o QA que melhora o
onboarding do time inteiro — e isso é uma frase que rende em entrevista.

---

## 6. Como a IA ajuda aqui

Subir ambiente é onde a IA mais economiza tempo de um QA, porque erro de setup é sempre
específico e sempre mal documentado.

**O que funciona bem:**

> Estou rodando `npm run migration:run` num projeto Node com TypeORM e PostgreSQL em
> Docker, e recebi este erro: *(colar o erro inteiro)*. O docker-compose expõe a porta
> 5432 e meu .env aponta para localhost:5432. O que pode estar acontecendo?

Colar o **erro inteiro**, não a última linha, e dizer o que você já verificou. A IA é
ótima nisso: conhece as mensagens de erro do ecossistema e as causas comuns.

**Onde ela erra:** ela vai te sugerir com confiança um comando que não existe na versão
que você usa, ou apagar dados sem avisar. Nunca rode um comando com `drop`, `delete`,
`--force` ou `-rf` sugerido por IA sem entender o que ele faz. Se você não entende,
pergunte "o que exatamente esse comando faz e o que eu perco?" antes de rodar.

**A regra do curso:** IA pode te ajudar a *subir* o ambiente. IA não vai *testar* por
você — nos próximos módulos, quando eu pedir para você achar cenários, quero os seus.

---

## 7. Vocabulário

| Inglês | Significa |
| --- | --- |
| **environment** | ambiente — onde o software roda (local, homolog, produção) |
| **setup** | preparação do ambiente |
| **container** | contêiner — a caixa isolada onde o Docker roda o banco |
| **migration** | script que altera a estrutura do banco |
| **log** | registro do que a aplicação fez |
| **endpoint** | um caminho da API |
| **token** | credencial que prova quem você é |
| **branch** | linha do tempo paralela do código |

---

## Pronto para o próximo?

Você concluiu quando conseguir, do zero e sem consultar este arquivo:
subir o banco, rodar as migrations, subir a API, abrir o Swagger e criar uma conta
autenticada.

Próximo: `/qa-curso modulo 1` — Fundamentos de QA.
