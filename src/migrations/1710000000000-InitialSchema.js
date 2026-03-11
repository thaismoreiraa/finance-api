const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class InitialSchema1710000000000 {
  name = "InitialSchema1710000000000";

  async up(queryRunner) {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE users (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name          VARCHAR(100) NOT NULL,
        email         VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        currency      CHAR(3) DEFAULT 'BRL',
        created_at    TIMESTAMP DEFAULT NOW(),
        updated_at    TIMESTAMP,
        deleted_at    TIMESTAMP
      )
    `);

    await queryRunner.query(`
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
      )
    `);

    await queryRunner.query(`
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
      )
    `);

    await queryRunner.query(`
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
      )
    `);

    await queryRunner.query(`
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
      )
    `);

    await queryRunner.query(`
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
      )
    `);

    await queryRunner.query(`
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
      )
    `);

    await queryRunner.query(`
      CREATE TABLE audit_logs (
        id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id    UUID NOT NULL REFERENCES users(id),
        table_name VARCHAR(50) NOT NULL,
        record_id  UUID NOT NULL,
        action     VARCHAR(10) NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
        old_data   JSONB,
        new_data   JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Índices
    await queryRunner.query(
      `CREATE INDEX idx_transactions_user_date ON transactions(user_id, date)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_transactions_account   ON transactions(account_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_transactions_category  ON transactions(category_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_accounts_user          ON accounts(user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_categories_user        ON categories(user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_budgets_user_period    ON budgets(user_id, year, month)`,
    );
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_budgets_user_period`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_categories_user`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_accounts_user`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_transactions_category`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_transactions_account`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_transactions_user_date`);
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs`);
    await queryRunner.query(`DROP TABLE IF EXISTS goals`);
    await queryRunner.query(`DROP TABLE IF EXISTS budgets`);
    await queryRunner.query(`DROP TABLE IF EXISTS transactions`);
    await queryRunner.query(`DROP TABLE IF EXISTS recurrences`);
    await queryRunner.query(`DROP TABLE IF EXISTS categories`);
    await queryRunner.query(`DROP TABLE IF EXISTS accounts`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
  }
};
