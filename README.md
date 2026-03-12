# 💰 Finance Control API

> **Este README é um prompt de construção.**
> Leia tudo antes de começar a implementar. Ele contém as regras de negócio, modelagem do banco, contrato da API (OpenAPI), stack tecnológica, estrutura de pastas, padrões de código e instruções de testes.

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Stack Tecnológica](#stack-tecnológica)
3. [Regras de Negócio](#regras-de-negócio)
4. [Modelagem do Banco de Dados](#modelagem-do-banco-de-dados)
5. [Contrato da API (OpenAPI)](#contrato-da-api-openapi)
6. [Estrutura de Pastas](#estrutura-de-pastas)
7. [Padrões de Código](#padrões-de-código)
8. [Configuração do Ambiente](#configuração-do-ambiente)
9. [Scripts Disponíveis](#scripts-disponíveis)
10. [Estrutura de Testes](#estrutura-de-testes)

---

## Visão Geral

API RESTful para um sistema de controle de finanças pessoais. Permite ao usuário gerenciar contas bancárias, transações, categorias, orçamentos, metas de economia e transações recorrentes.

**Objetivos do projeto:**

- Ser uma API funcional e bem estruturada
- Servir de base para a prática de testes (unitário, integração e e2e)
- Ter código simples o suficiente para iniciantes entenderem

---

## Stack Tecnológica

| Camada                | Tecnologia                 |
| --------------------- | -------------------------- |
| Runtime               | Node.js (JavaScript)       |
| Framework             | Express.js                 |
| ORM                   | TypeORM                    |
| Banco de dados        | PostgreSQL                 |
| Autenticação          | JWT (jsonwebtoken)         |
| Validação             | Joi ou Zod (à sua escolha) |
| Documentação inline   | JSDoc                      |
| Testes unitários      | Jest                       |
| Testes de integração  | Jest + Supertest           |
| Testes e2e            | Jest + Supertest           |
| Variáveis de ambiente | dotenv                     |
| Containerização       | Docker + Docker Compose    |

---

## Regras de Negócio

### Transações

- Toda transação deve ter: `account_id`, `type`, `amount`, `date`
- O campo `amount` deve ser **sempre positivo** — o campo `type` define se é entrada (`income`) ou saída (`expense`)
- Transações do tipo `transfer` exigem um `destination_account_id` e geram **duas** transações espelhadas: uma saída na conta de origem e uma entrada na conta de destino. As duas ficam ligadas pelo campo `transfer_pair_id`
- Transações com data futura devem ter `status = scheduled` automaticamente
- Transações confirmadas (`status = confirmed`) atualizam o `balance` da conta imediatamente
- Ao **editar** uma transação, o saldo da conta deve ser recalculado
- Ao **excluir** uma transação, o saldo da conta deve ser revertido
- A exclusão é lógica (soft delete via `deleted_at`) — nunca apague registros do banco
- Toda edição ou exclusão de transação deve gerar um registro em `audit_logs`

### Contas (Accounts)

- O saldo (`balance`) é **sempre derivado das transações** — nunca deve ser informado diretamente pelo usuário após a criação (exceto `initial_balance` no momento da criação)
- Se `allow_negative = false`, a API deve rejeitar transações do tipo `expense` que deixariam o saldo negativo
- Uma conta não pode ser excluída se tiver transações vinculadas. Retornar erro `409 Conflict`
- A exclusão é lógica (soft delete)

### Categorias

- Categorias de `income` só podem ser usadas em transações de `income`, e vice-versa para `expense`
- Uma categoria não pode ser excluída se houver transações vinculadas a ela. O usuário deve reclassificá-las antes
- Uma categoria pode ter uma `parent_id` apontando para outra categoria do mesmo tipo (subcategoria)
- A exclusão é lógica (soft delete)

### Orçamentos (Budgets)

- Só pode existir **um** orçamento por `category_id` + `year` + `month`. Retornar `409 Conflict` se já existir
- Ao consultar um orçamento, a API deve retornar os campos calculados: `spent` (total gasto no período), `remaining` (amount - spent) e `usage_percent`
- Se `usage_percent >= alert_threshold`, o campo `alert_triggered` deve retornar `true`

### Recorrências (Recurrences)

- Ao criar uma recorrência, a primeira transação deve ser criada automaticamente com base em `start_date`
- O campo `next_due_date` deve ser atualizado após cada geração de transação
- Ao editar uma recorrência, o campo `update_scope` define o impacto:
  - `this_only`: altera apenas a transação já gerada para aquela ocorrência
  - `this_and_future`: altera a recorrência e cancela transações futuras ainda não confirmadas
  - `all`: altera a recorrência e todas as transações futuras pendentes

### Metas (Goals)

- O endpoint `POST /goals/:id/deposit` adiciona um valor ao `current_amount`
- Quando `current_amount >= target_amount`, o `status` deve mudar automaticamente para `completed`

### Autenticação

- Todas as rotas (exceto `POST /auth/register` e `POST /auth/login`) exigem JWT válido no header `Authorization: Bearer <token>`
- O `access_token` expira em **1 hora**
- O `refresh_token` expira em **7 dias**
- Cada usuário só enxerga seus próprios dados — todas as queries devem filtrar por `user_id`

### Auditoria

- Toda edição e exclusão de transação deve gerar um registro na tabela `audit_logs` com `old_data` e `new_data` em JSON

---

## Modelagem do Banco de Dados

### Diagrama de Entidades

```
users
  └── accounts         (1 user → N accounts)
  └── categories       (1 user → N categories)
  └── transactions     (1 user → N transactions)
  └── recurrences      (1 user → N recurrences)
  └── budgets          (1 user → N budgets)
  └── goals            (1 user → N goals)
  └── audit_logs       (1 user → N audit_logs)

transactions
  └── account          (N transactions → 1 account)
  └── category         (N transactions → 1 category)
  └── recurrence       (N transactions → 1 recurrence, opcional)
  └── transfer_pair    (1 transaction → 1 transaction, auto-referência)

categories
  └── parent           (1 category → 1 category, auto-referência, opcional)

recurrences
  └── account          (N recurrences → 1 account)
  └── category         (N recurrences → 1 category, opcional)

budgets
  └── category         (N budgets → 1 category)

goals
  └── account          (N goals → 1 account, opcional)
```

---

### DDL — PostgreSQL

```sql
-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  currency      CHAR(3) DEFAULT 'BRL',
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP,
  deleted_at    TIMESTAMP
);

-- ACCOUNTS
CREATE TABLE accounts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id),
  name           VARCHAR(100) NOT NULL,
  type           VARCHAR(20) NOT NULL CHECK (type IN ('checking','savings','credit','investment','cash')),
  balance        DECIMAL(15,2) DEFAULT 0.00,
  currency       CHAR(3) DEFAULT 'BRL',
  color          VARCHAR(7),
  icon           VARCHAR(50),
  allow_negative BOOLEAN DEFAULT false,
  is_active      BOOLEAN DEFAULT true,
  created_at     TIMESTAMP DEFAULT NOW(),
  deleted_at     TIMESTAMP
);

-- CATEGORIES
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id),
  name       VARCHAR(100) NOT NULL,
  type       VARCHAR(10) NOT NULL CHECK (type IN ('income','expense')),
  color      VARCHAR(7),
  icon       VARCHAR(50),
  parent_id  UUID REFERENCES categories(id),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- RECURRENCES
CREATE TABLE recurrences (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id),
  account_id    UUID NOT NULL REFERENCES accounts(id),
  category_id   UUID REFERENCES categories(id),
  type          VARCHAR(10) NOT NULL CHECK (type IN ('income','expense')),
  amount        DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  description   VARCHAR(255),
  frequency     VARCHAR(10) NOT NULL CHECK (frequency IN ('daily','weekly','monthly','yearly')),
  start_date    DATE NOT NULL,
  end_date      DATE,
  auto_confirm  BOOLEAN DEFAULT false,
  next_due_date DATE,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- TRANSACTIONS
CREATE TABLE transactions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id),
  account_id       UUID NOT NULL REFERENCES accounts(id),
  category_id      UUID REFERENCES categories(id),
  recurrence_id    UUID REFERENCES recurrences(id),
  type             VARCHAR(10) NOT NULL CHECK (type IN ('income','expense','transfer')),
  amount           DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  description      VARCHAR(255),
  date             DATE NOT NULL,
  status           VARCHAR(15) DEFAULT 'confirmed' CHECK (status IN ('scheduled','pending','confirmed','cancelled')),
  transfer_pair_id UUID REFERENCES transactions(id),
  notes            TEXT,
  created_at       TIMESTAMP DEFAULT NOW(),
  deleted_at       TIMESTAMP
);

-- BUDGETS
CREATE TABLE budgets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id),
  category_id     UUID NOT NULL REFERENCES categories(id),
  amount          DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  period          VARCHAR(10) DEFAULT 'monthly' CHECK (period IN ('monthly','yearly')),
  year            SMALLINT NOT NULL,
  month           SMALLINT CHECK (month BETWEEN 1 AND 12),
  alert_threshold SMALLINT DEFAULT 80 CHECK (alert_threshold BETWEEN 1 AND 100),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- GOALS
CREATE TABLE goals (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id),
  account_id     UUID REFERENCES accounts(id),
  name           VARCHAR(100) NOT NULL,
  target_amount  DECIMAL(15,2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(15,2) DEFAULT 0.00,
  deadline       DATE,
  color          VARCHAR(7),
  icon           VARCHAR(50),
  status         VARCHAR(15) DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
  created_at     TIMESTAMP DEFAULT NOW()
);

-- AUDIT LOGS
CREATE TABLE audit_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id),
  table_name VARCHAR(50) NOT NULL,
  record_id  UUID NOT NULL,
  action     VARCHAR(10) NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  old_data   JSONB,
  new_data   JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ÍNDICES
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX idx_transactions_account   ON transactions(account_id);
CREATE INDEX idx_transactions_category  ON transactions(category_id);
CREATE INDEX idx_accounts_user          ON accounts(user_id);
CREATE INDEX idx_categories_user        ON categories(user_id);
CREATE INDEX idx_budgets_user_period    ON budgets(user_id, year, month);
```

---

## Contrato da API (OpenAPI)

A especificação completa está no arquivo `finance-api.yml` (OpenAPI 3.0).
Você pode visualizá-la colando o conteúdo em [editor.swagger.io](https://editor.swagger.io).

### Resumo dos endpoints

#### Auth

| Método | Rota             | Descrição       | Auth |
| ------ | ---------------- | --------------- | ---- |
| POST   | `/auth/register` | Criar conta     | ❌   |
| POST   | `/auth/login`    | Autenticar      | ❌   |
| POST   | `/auth/refresh`  | Renovar token   | ❌   |
| POST   | `/auth/logout`   | Encerrar sessão | ✅   |

#### Users

| Método | Rota                 | Descrição                   |
| ------ | -------------------- | --------------------------- |
| GET    | `/users/me`          | Dados do usuário logado     |
| PATCH  | `/users/me`          | Atualizar nome/moeda        |
| DELETE | `/users/me`          | Excluir conta (soft delete) |
| PATCH  | `/users/me/password` | Alterar senha               |

#### Accounts

| Método | Rota            | Descrição                   |
| ------ | --------------- | --------------------------- |
| GET    | `/accounts`     | Listar contas + saldo total |
| POST   | `/accounts`     | Criar conta                 |
| GET    | `/accounts/:id` | Buscar por ID               |
| PATCH  | `/accounts/:id` | Atualizar                   |
| DELETE | `/accounts/:id` | Excluir (soft delete)       |

#### Categories

| Método | Rota              | Descrição                |
| ------ | ----------------- | ------------------------ |
| GET    | `/categories`     | Listar (filtro por type) |
| POST   | `/categories`     | Criar                    |
| GET    | `/categories/:id` | Buscar por ID            |
| PATCH  | `/categories/:id` | Atualizar                |
| DELETE | `/categories/:id` | Excluir                  |

#### Transactions

| Método | Rota                           | Descrição                        |
| ------ | ------------------------------ | -------------------------------- |
| GET    | `/transactions`                | Listar com filtros e paginação   |
| POST   | `/transactions`                | Criar                            |
| GET    | `/transactions/:id`            | Buscar por ID                    |
| PATCH  | `/transactions/:id`            | Atualizar                        |
| DELETE | `/transactions/:id`            | Excluir (soft delete)            |
| POST   | `/transactions/import`         | Upload CSV/OFX (retorna preview) |
| POST   | `/transactions/import/confirm` | Confirmar importação             |

#### Recurrences

| Método | Rota               | Descrição                    |
| ------ | ------------------ | ---------------------------- |
| GET    | `/recurrences`     | Listar                       |
| POST   | `/recurrences`     | Criar                        |
| PATCH  | `/recurrences/:id` | Atualizar (com update_scope) |
| DELETE | `/recurrences/:id` | Cancelar                     |

#### Budgets

| Método | Rota           | Descrição                      |
| ------ | -------------- | ------------------------------ |
| GET    | `/budgets`     | Listar com progresso calculado |
| POST   | `/budgets`     | Criar                          |
| PATCH  | `/budgets/:id` | Atualizar                      |
| DELETE | `/budgets/:id` | Excluir                        |

#### Goals

| Método | Rota                 | Descrição              |
| ------ | -------------------- | ---------------------- |
| GET    | `/goals`             | Listar                 |
| POST   | `/goals`             | Criar                  |
| PATCH  | `/goals/:id`         | Atualizar              |
| DELETE | `/goals/:id`         | Excluir                |
| POST   | `/goals/:id/deposit` | Adicionar valor à meta |

#### Reports

| Método | Rota                 | Descrição                                   |
| ------ | -------------------- | ------------------------------------------- |
| GET    | `/reports/summary`   | Resumo do período (entradas, saídas, saldo) |
| GET    | `/reports/cash-flow` | Fluxo de caixa agrupado por dia/semana/mês  |
| GET    | `/reports/export`    | Exportar CSV ou PDF                         |

---

## Estrutura de Pastas

```
finance-api/
├── src/
│   ├── config/
│   │   ├── database.js          # Configuração do TypeORM (DataSource)
│   │   └── env.js               # Carrega e valida variáveis de ambiente
│   │
│   ├── entities/                # Entidades do TypeORM (mapeamento das tabelas)
│   │   ├── User.js
│   │   ├── Account.js
│   │   ├── Category.js
│   │   ├── Transaction.js
│   │   ├── Recurrence.js
│   │   ├── Budget.js
│   │   ├── Goal.js
│   │   └── AuditLog.js
│   │
│   ├── repositories/            # Camada de acesso ao banco (Pattern Repository)
│   │   ├── UserRepository.js
│   │   ├── AccountRepository.js
│   │   ├── CategoryRepository.js
│   │   ├── TransactionRepository.js
│   │   ├── RecurrenceRepository.js
│   │   ├── BudgetRepository.js
│   │   ├── GoalRepository.js
│   │   └── AuditLogRepository.js
│   │
│   ├── services/                # Regras de negócio
│   │   ├── AuthService.js
│   │   ├── UserService.js
│   │   ├── AccountService.js
│   │   ├── CategoryService.js
│   │   ├── TransactionService.js
│   │   ├── RecurrenceService.js
│   │   ├── BudgetService.js
│   │   ├── GoalService.js
│   │   └── ReportService.js
│   │
│   ├── controllers/             # Recebe a requisição HTTP, chama o service, devolve a resposta
│   │   ├── AuthController.js
│   │   ├── UserController.js
│   │   ├── AccountController.js
│   │   ├── CategoryController.js
│   │   ├── TransactionController.js
│   │   ├── RecurrenceController.js
│   │   ├── BudgetController.js
│   │   ├── GoalController.js
│   │   └── ReportController.js
│   │
│   ├── middlewares/
│   │   ├── auth.js              # Valida o JWT e injeta req.user
│   │   ├── validate.js          # Valida o body da requisição com o schema Joi/Zod
│   │   └── errorHandler.js      # Trata todos os erros da aplicação de forma centralizada
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── account.routes.js
│   │   ├── category.routes.js
│   │   ├── transaction.routes.js
│   │   ├── recurrence.routes.js
│   │   ├── budget.routes.js
│   │   ├── goal.routes.js
│   │   ├── report.routes.js
│   │   └── index.js             # Agrega todas as rotas com prefixo /v1
│   │
│   ├── validators/              # Schemas de validação (Joi ou Zod) para cada recurso
│   │   ├── auth.validator.js
│   │   ├── account.validator.js
│   │   ├── category.validator.js
│   │   ├── transaction.validator.js
│   │   ├── recurrence.validator.js
│   │   ├── budget.validator.js
│   │   └── goal.validator.js
│   │
│   ├── utils/
│   │   ├── AppError.js          # Classe de erro customizado com statusCode
│   │   ├── pagination.js        # Helper para montar resposta paginada
│   │   └── dateHelper.js        # Helpers para cálculo de próxima data de recorrência
│   │
│   └── app.js                   # Configura o Express (middlewares globais, rotas, error handler)
│
├── tests/
│   ├── unit/                    # Testes unitários — testam services e utils isoladamente
│   │   ├── services/
│   │   │   ├── AuthService.test.js
│   │   │   ├── AccountService.test.js
│   │   │   ├── TransactionService.test.js
│   │   │   ├── BudgetService.test.js
│   │   │   └── GoalService.test.js
│   │   └── utils/
│   │       ├── dateHelper.test.js
│   │       └── pagination.test.js
│   │
│   ├── integration/             # Testes de integração — testam a camada de repositório com banco real
│   │   ├── repositories/
│   │   │   ├── UserRepository.test.js
│   │   │   ├── AccountRepository.test.js
│   │   │   ├── TransactionRepository.test.js
│   │   │   └── BudgetRepository.test.js
│   │   └── setup.js             # Sobe banco de teste e limpa dados entre os testes
│   │
│   ├── e2e/                     # Testes end-to-end — testam os endpoints HTTP completos
│   │   ├── auth.e2e.test.js
│   │   ├── accounts.e2e.test.js
│   │   ├── transactions.e2e.test.js
│   │   ├── budgets.e2e.test.js
│   │   └── goals.e2e.test.js
│   │
│   ├── factories/               # Funções auxiliares para criar dados de teste
│   │   ├── userFactory.js
│   │   ├── accountFactory.js
│   │   ├── categoryFactory.js
│   │   └── transactionFactory.js
│   │
│   └── setup.js                 # Configuração global do Jest (jest.config.js aponta aqui)
│
├── migrations/                  # Migrations do TypeORM
│   └── (geradas automaticamente via typeorm migration:generate)
│
├── .env.example                 # Modelo das variáveis de ambiente
├── .env                         # Variáveis locais (não subir para o git)
├── docker-compose.yml           # Sobe o PostgreSQL local e de teste
├── jest.config.js               # Configuração do Jest com os três projetos (unit, integration, e2e)
├── package.json
└── README.md
```

---

## Padrões de Código

### Fluxo de uma requisição

```
HTTP Request
    │
    ▼
Route (routes/)
    │  Define o caminho, método HTTP e middlewares
    ▼
Middleware: auth.js
    │  Verifica o JWT e popula req.user
    ▼
Middleware: validate.js
    │  Valida o body com o schema do validator
    ▼
Controller (controllers/)
    │  Extrai dados da requisição (params, body, query)
    │  Chama o service
    │  Devolve a resposta HTTP
    ▼
Service (services/)
    │  Contém as regras de negócio
    │  Chama os repositories necessários
    │  Lança AppError para erros esperados
    ▼
Repository (repositories/)
    │  Faz as queries no banco usando TypeORM
    │  Não contém regra de negócio
    ▼
Entity (entities/)
    │  Mapeamento da tabela no banco
    ▼
PostgreSQL
```

---

### Exemplo de implementação: Account

**`src/entities/Account.js`**

```js
const { EntitySchema } = require('typeorm');

/**
 * @typedef {Object} Account
 * @property {string} id - UUID da conta
 * @property {string} user_id - ID do usuário dono
 * @property {string} name - Nome da conta (ex: "Nubank")
 * @property {'checking'|'savings'|'credit'|'investment'|'cash'} type - Tipo da conta
 * @property {number} balance - Saldo atual (calculado)
 * @property {string} currency - Moeda (ex: "BRL")
 * @property {string|null} color - Cor em hex (ex: "#8A05BE")
 * @property {string|null} icon - Nome do ícone
 * @property {boolean} allow_negative - Permite saldo negativo?
 * @property {boolean} is_active - Conta ativa?
 * @property {Date} created_at
 * @property {Date|null} deleted_at - Soft delete
 */
module.exports = new EntitySchema({
  name: 'Account',
  tableName: 'accounts',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    user_id: { type: 'uuid' },
    name: { type: 'varchar', length: 100 },
    type: { type: 'varchar', length: 20 },
    balance: { type: 'decimal', precision: 15, scale: 2, default: 0 },
    currency: { type: 'char', length: 3, default: 'BRL' },
    color: { type: 'varchar', length: 7, nullable: true },
    icon: { type: 'varchar', length: 50, nullable: true },
    allow_negative: { type: 'boolean', default: false },
    is_active: { type: 'boolean', default: true },
    created_at: { type: 'timestamp', createDate: true },
    deleted_at: { type: 'timestamp', nullable: true },
  },
  relations: {
    user: { type: 'many-to-one', target: 'User', joinColumn: { name: 'user_id' } },
  },
});
```

---

**`src/repositories/AccountRepository.js`**

```js
const { AppDataSource } = require('../config/database');

/**
 * Repositório de contas.
 * Responsável por todas as queries na tabela `accounts`.
 * Não contém regras de negócio.
 */
const AccountRepository = AppDataSource.getRepository('Account').extend({
  /**
   * Busca todas as contas ativas de um usuário.
   * @param {string} userId
   * @returns {Promise<Account[]>}
   */
  findByUser(userId) {
    return this.find({
      where: { user_id: userId, is_active: true, deleted_at: null },
      order: { created_at: 'ASC' },
    });
  },

  /**
   * Busca uma conta por ID garantindo que pertence ao usuário.
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Account|null>}
   */
  findByIdAndUser(id, userId) {
    return this.findOne({ where: { id, user_id: userId, deleted_at: null } });
  },

  /**
   * Atualiza o saldo de uma conta somando (ou subtraindo) um valor.
   * @param {string} accountId
   * @param {number} delta - Valor positivo para crédito, negativo para débito
   * @returns {Promise<void>}
   */
  async updateBalance(accountId, delta) {
    await this.increment({ id: accountId }, 'balance', delta);
  },
});

module.exports = AccountRepository;
```

---

**`src/services/AccountService.js`**

```js
const AccountRepository = require('../repositories/AccountRepository');
const AppError = require('../utils/AppError');

/**
 * Serviço de contas.
 * Contém as regras de negócio relacionadas a contas bancárias.
 */
const AccountService = {
  /**
   * Lista todas as contas do usuário com o saldo total consolidado.
   * @param {string} userId
   * @returns {Promise<{ data: Account[], total_balance: number }>}
   */
  async list(userId) {
    const accounts = await AccountRepository.findByUser(userId);
    const total_balance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
    return { data: accounts, total_balance };
  },

  /**
   * Cria uma nova conta para o usuário.
   * @param {string} userId
   * @param {object} data - Dados da conta (name, type, initial_balance, ...)
   * @returns {Promise<Account>}
   */
  async create(userId, data) {
    const account = AccountRepository.create({
      ...data,
      user_id: userId,
      balance: data.initial_balance ?? 0,
    });
    return AccountRepository.save(account);
  },

  /**
   * Busca uma conta por ID. Lança erro 404 se não encontrar.
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Account>}
   */
  async findById(id, userId) {
    const account = await AccountRepository.findByIdAndUser(id, userId);
    if (!account) throw new AppError('Conta não encontrada.', 404);
    return account;
  },

  /**
   * Atualiza os dados de uma conta.
   * @param {string} id
   * @param {string} userId
   * @param {object} data
   * @returns {Promise<Account>}
   */
  async update(id, userId, data) {
    const account = await this.findById(id, userId);
    Object.assign(account, data);
    return AccountRepository.save(account);
  },

  /**
   * Faz o soft delete de uma conta.
   * Lança erro 409 se houver transações vinculadas.
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async remove(id, userId) {
    const account = await this.findById(id, userId);
    // TODO: verificar transações vinculadas antes de excluir
    account.deleted_at = new Date();
    await AccountRepository.save(account);
  },
};

module.exports = AccountService;
```

---

**`src/controllers/AccountController.js`**

```js
const AccountService = require('../services/AccountService');

/**
 * Controller de contas.
 * Responsável por extrair dados da requisição e formatar a resposta HTTP.
 */
const AccountController = {
  /** @param {import('express').Request} req @param {import('express').Response} res */
  async list(req, res) {
    const result = await AccountService.list(req.user.id);
    res.json(result);
  },

  /** @param {import('express').Request} req @param {import('express').Response} res */
  async create(req, res) {
    const account = await AccountService.create(req.user.id, req.body);
    res.status(201).json(account);
  },

  /** @param {import('express').Request} req @param {import('express').Response} res */
  async findById(req, res) {
    const account = await AccountService.findById(req.params.id, req.user.id);
    res.json(account);
  },

  /** @param {import('express').Request} req @param {import('express').Response} res */
  async update(req, res) {
    const account = await AccountService.update(req.params.id, req.user.id, req.body);
    res.json(account);
  },

  /** @param {import('express').Request} req @param {import('express').Response} res */
  async remove(req, res) {
    await AccountService.remove(req.params.id, req.user.id);
    res.status(204).send();
  },
};

module.exports = AccountController;
```

---

**`src/utils/AppError.js`**

```js
/**
 * Erro customizado da aplicação.
 * Use sempre que quiser retornar um erro HTTP esperado (ex: 404, 409, 422).
 *
 * @example
 * throw new AppError('Conta não encontrada.', 404);
 */
class AppError extends Error {
  /**
   * @param {string} message - Mensagem de erro
   * @param {number} [statusCode=400] - Código HTTP
   * @param {string} [code='ERROR'] - Código interno (ex: 'NOT_FOUND')
   */
  constructor(message, statusCode = 400, code = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

module.exports = AppError;
```

---

**`src/middlewares/errorHandler.js`**

```js
const AppError = require('../utils/AppError');

/**
 * Middleware de tratamento de erros centralizado.
 * Deve ser registrado por último no app.js.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ code: err.code, message: err.message });
  }
  console.error(err);
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Erro interno do servidor.' });
}

module.exports = errorHandler;
```

---

## Configuração do Ambiente

### `.env.example`

```env
# Servidor
PORT=3000
NODE_ENV=development

# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance_db
DB_USER=postgres
DB_PASS=postgres

# Banco de dados de teste (usado nos testes de integração e e2e)
DB_TEST_NAME=finance_test_db

# JWT
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=sua_chave_refresh_aqui
JWT_REFRESH_EXPIRES_IN=7d
```

---

### `docker-compose.yml`

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: finance_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

  postgres_test:
    image: postgres:15
    environment:
      POSTGRES_DB: finance_test_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - '5433:5432'

volumes:
  pgdata:
```

---

## Scripts Disponíveis

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "migration:run": "typeorm-ts-node-commonjs migration:run -d src/config/database.js",
    "migration:revert": "typeorm-ts-node-commonjs migration:revert -d src/config/database.js",
    "test": "jest",
    "test:unit": "jest --selectProjects unit",
    "test:integration": "jest --selectProjects integration",
    "test:e2e": "jest --selectProjects e2e",
    "test:coverage": "jest --coverage"
  }
}
```

---

## Estrutura de Testes

> **Os testes não estão implementados.** A estrutura está criada para que você os escreva como prática.

### Filosofia

| Tipo           | O que testar                                           | Usa banco? | Usa HTTP? |
| -------------- | ------------------------------------------------------ | ---------- | --------- |
| **Unitário**   | Services e utils isoladamente (mockar os repositories) | ❌         | ❌        |
| **Integração** | Repositories com banco real de teste                   | ✅         | ❌        |
| **E2E**        | Endpoints HTTP completos com banco de teste            | ✅         | ✅        |

---

### `jest.config.js`

```js
/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
      testEnvironment: 'node',
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
      testEnvironment: 'node',
      globalSetup: '<rootDir>/tests/integration/setup.js',
    },
    {
      displayName: 'e2e',
      testMatch: ['<rootDir>/tests/e2e/**/*.test.js'],
      testEnvironment: 'node',
      globalSetup: '<rootDir>/tests/setup.js',
    },
  ],
  collectCoverageFrom: ['src/**/*.js'],
};
```

---

### Exemplos de esqueleto de teste (para você preencher)

**`tests/unit/services/AccountService.test.js`**

```js
const AccountService = require('../../../src/services/AccountService');
const AccountRepository = require('../../../src/repositories/AccountRepository');

// Mock do repositório — testes unitários não tocam o banco
jest.mock('../../../src/repositories/AccountRepository');

describe('AccountService', () => {
  describe('list', () => {
    it('deve retornar as contas do usuário com o saldo total', async () => {
      // TODO: implemente o teste
    });

    it('deve retornar total_balance = 0 quando não há contas', async () => {
      // TODO: implemente o teste
    });
  });

  describe('create', () => {
    it('deve criar uma conta com o saldo inicial informado', async () => {
      // TODO: implemente o teste
    });

    it('deve criar uma conta com saldo 0 quando initial_balance não for informado', async () => {
      // TODO: implemente o teste
    });
  });

  describe('remove', () => {
    it('deve lançar AppError 404 quando a conta não existir', async () => {
      // TODO: implemente o teste
    });

    it('deve lançar AppError 409 quando a conta tiver transações vinculadas', async () => {
      // TODO: implemente o teste
    });
  });
});
```

---

**`tests/integration/repositories/AccountRepository.test.js`**

```js
const { AppDataSource } = require('../../../src/config/database');
const AccountRepository = require('../../../src/repositories/AccountRepository');

beforeAll(async () => {
  await AppDataSource.initialize();
});

afterAll(async () => {
  await AppDataSource.destroy();
});

beforeEach(async () => {
  // TODO: limpar a tabela antes de cada teste
});

describe('AccountRepository', () => {
  describe('findByUser', () => {
    it('deve retornar apenas as contas do usuário informado', async () => {
      // TODO: implemente o teste
    });

    it('não deve retornar contas com deleted_at preenchido', async () => {
      // TODO: implemente o teste
    });
  });

  describe('updateBalance', () => {
    it('deve incrementar o saldo corretamente', async () => {
      // TODO: implemente o teste
    });

    it('deve decrementar o saldo corretamente com delta negativo', async () => {
      // TODO: implemente o teste
    });
  });
});
```

---

**`tests/e2e/accounts.e2e.test.js`**

```js
const request = require('supertest');
const app = require('../../src/app');

let authToken;

beforeAll(async () => {
  // TODO: criar usuário de teste e fazer login para obter o token
});

describe('GET /v1/accounts', () => {
  it('deve retornar 401 sem token', async () => {
    // TODO: implemente o teste
  });

  it('deve retornar a lista de contas do usuário autenticado', async () => {
    // TODO: implemente o teste
  });
});

describe('POST /v1/accounts', () => {
  it('deve criar uma nova conta e retornar 201', async () => {
    // TODO: implemente o teste
  });

  it('deve retornar 400 quando o campo name não for informado', async () => {
    // TODO: implemente o teste
  });
});

describe('DELETE /v1/accounts/:id', () => {
  it('deve retornar 409 ao tentar excluir conta com transações', async () => {
    // TODO: implemente o teste
  });
});
```

---

**`tests/factories/accountFactory.js`**

```js
/**
 * Cria um objeto de conta para uso nos testes.
 * @param {Partial<Account>} overrides - Campos para sobrescrever o padrão
 * @returns {object}
 */
function makeAccount(overrides = {}) {
  return {
    name: 'Conta Teste',
    type: 'checking',
    currency: 'BRL',
    allow_negative: false,
    ...overrides,
  };
}

module.exports = { makeAccount };
```

---

### Guia de o que testar (por onde começar)

**Testes unitários — comece por aqui:**

- `TransactionService`: regra de saldo negativo, criação de transferência em par, cálculo de status por data
- `BudgetService`: cálculo de `spent`, `remaining`, `usage_percent` e `alert_triggered`
- `GoalService`: mudança automática de status para `completed`
- `dateHelper`: cálculo de `next_due_date` para cada frequência (daily, weekly, monthly, yearly)

**Testes de integração:**

- `TransactionRepository`: filtros por data, conta, categoria e paginação
- `AccountRepository`: `updateBalance` com valores positivos e negativos

**Testes e2e — os mais completos:**

- Fluxo de autenticação: register → login → acessar rota protegida → refresh token
- Fluxo de transferência: criar transferência e verificar que dois registros foram criados com `transfer_pair_id`
- Fluxo de orçamento: criar transações e verificar que `usage_percent` e `alert_triggered` retornam corretos
