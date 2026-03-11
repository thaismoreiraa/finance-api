const { EntitySchema } = require("typeorm");

/**
 * @typedef {Object} User
 * @property {string} id - UUID do usuário
 * @property {string} name - Nome completo
 * @property {string} email - E-mail único
 * @property {string} password_hash - Senha criptografada
 * @property {string} currency - Moeda padrão (ex: "BRL")
 * @property {Date} created_at
 * @property {Date|null} updated_at
 * @property {Date|null} deleted_at - Soft delete
 */
module.exports = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    name: { type: "varchar", length: 100 },
    email: { type: "varchar", length: 150, unique: true },
    password_hash: { type: "varchar", length: 255 },
    currency: { type: "char", length: 3, default: "BRL" },
    created_at: { type: "timestamp", createDate: true },
    updated_at: { type: "timestamp", nullable: true, updateDate: true },
    deleted_at: { type: "timestamp", nullable: true, deleteDate: true },
  },
  relations: {
    accounts: { type: "one-to-many", target: "Account", inverseSide: "user" },
    categories: {
      type: "one-to-many",
      target: "Category",
      inverseSide: "user",
    },
    transactions: {
      type: "one-to-many",
      target: "Transaction",
      inverseSide: "user",
    },
    recurrences: {
      type: "one-to-many",
      target: "Recurrence",
      inverseSide: "user",
    },
    budgets: { type: "one-to-many", target: "Budget", inverseSide: "user" },
    goals: { type: "one-to-many", target: "Goal", inverseSide: "user" },
    audit_logs: {
      type: "one-to-many",
      target: "AuditLog",
      inverseSide: "user",
    },
  },
});
