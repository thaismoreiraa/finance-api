const { EntitySchema } = require("typeorm");

/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {string} user_id
 * @property {string} account_id
 * @property {string|null} category_id
 * @property {string|null} recurrence_id
 * @property {'income'|'expense'|'transfer'} type
 * @property {number} amount - Sempre positivo
 * @property {string|null} description
 * @property {string} date
 * @property {'scheduled'|'pending'|'confirmed'|'cancelled'} status
 * @property {string|null} transfer_pair_id - Auto-referência para transferências
 * @property {string|null} notes
 * @property {Date} created_at
 * @property {Date|null} deleted_at - Soft delete
 */
module.exports = new EntitySchema({
  name: "Transaction",
  tableName: "transactions",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    user_id: { type: "uuid" },
    account_id: { type: "uuid" },
    category_id: { type: "uuid", nullable: true },
    recurrence_id: { type: "uuid", nullable: true },
    type: { type: "varchar", length: 10 },
    amount: { type: "decimal", precision: 15, scale: 2 },
    description: { type: "varchar", length: 255, nullable: true },
    date: { type: "date" },
    status: { type: "varchar", length: 15, default: "confirmed" },
    transfer_pair_id: { type: "uuid", nullable: true },
    notes: { type: "text", nullable: true },
    created_at: { type: "timestamp", createDate: true },
    deleted_at: { type: "timestamp", nullable: true },
  },
  indices: [
    { name: "idx_transactions_user_date", columns: ["user_id", "date"] },
    { name: "idx_transactions_account", columns: ["account_id"] },
    { name: "idx_transactions_category", columns: ["category_id"] },
  ],
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
    recurrence: {
      type: "many-to-one",
      target: "Recurrence",
      joinColumn: { name: "recurrence_id" },
      nullable: true,
    },
    transfer_pair: {
      type: "many-to-one",
      target: "Transaction",
      joinColumn: { name: "transfer_pair_id" },
      nullable: true,
    },
  },
});
