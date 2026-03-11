const { EntitySchema } = require("typeorm");

/**
 * @typedef {Object} Recurrence
 * @property {string} id
 * @property {string} user_id
 * @property {string} account_id
 * @property {string|null} category_id
 * @property {'income'|'expense'} type
 * @property {number} amount
 * @property {string|null} description
 * @property {'daily'|'weekly'|'monthly'|'yearly'} frequency
 * @property {string} start_date
 * @property {string|null} end_date
 * @property {boolean} auto_confirm
 * @property {string|null} next_due_date
 * @property {boolean} is_active
 * @property {Date} created_at
 */
module.exports = new EntitySchema({
  name: "Recurrence",
  tableName: "recurrences",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    user_id: { type: "uuid" },
    account_id: { type: "uuid" },
    category_id: { type: "uuid", nullable: true },
    type: { type: "varchar", length: 10 },
    amount: { type: "decimal", precision: 15, scale: 2 },
    description: { type: "varchar", length: 255, nullable: true },
    frequency: { type: "varchar", length: 10 },
    start_date: { type: "date" },
    end_date: { type: "date", nullable: true },
    auto_confirm: { type: "boolean", default: false },
    next_due_date: { type: "date", nullable: true },
    is_active: { type: "boolean", default: true },
    created_at: { type: "timestamp", createDate: true },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "user_id" },
    },
    account: {
      type: "many-to-one",
      target: "Account",
      joinColumn: { name: "account_id" },
    },
    category: {
      type: "many-to-one",
      target: "Category",
      joinColumn: { name: "category_id" },
      nullable: true,
    },
  },
});
