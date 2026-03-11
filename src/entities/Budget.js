const { EntitySchema } = require("typeorm");

/**
 * @typedef {Object} Budget
 * @property {string} id
 * @property {string} user_id
 * @property {string} category_id
 * @property {number} amount
 * @property {'monthly'|'yearly'} period
 * @property {number} year
 * @property {number|null} month
 * @property {number} alert_threshold
 * @property {Date} created_at
 */
module.exports = new EntitySchema({
  name: "Budget",
  tableName: "budgets",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    user_id: { type: "uuid" },
    category_id: { type: "uuid" },
    amount: { type: "decimal", precision: 15, scale: 2 },
    period: { type: "varchar", length: 10, default: "monthly" },
    year: { type: "smallint" },
    month: { type: "smallint", nullable: true },
    alert_threshold: { type: "smallint", default: 80 },
    created_at: { type: "timestamp", createDate: true },
  },
  indices: [
    { name: "idx_budgets_user_period", columns: ["user_id", "year", "month"] },
  ],
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "user_id" },
    },
    category: {
      type: "many-to-one",
      target: "Category",
      joinColumn: { name: "category_id" },
    },
  },
});
