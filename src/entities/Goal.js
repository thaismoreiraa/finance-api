const { EntitySchema } = require("typeorm");

/**
 * @typedef {Object} Goal
 * @property {string} id
 * @property {string} user_id
 * @property {string|null} account_id
 * @property {string} name
 * @property {number} target_amount
 * @property {number} current_amount
 * @property {string|null} deadline
 * @property {string|null} color
 * @property {string|null} icon
 * @property {'active'|'completed'|'cancelled'} status
 * @property {Date} created_at
 */
module.exports = new EntitySchema({
  name: "Goal",
  tableName: "goals",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    user_id: { type: "uuid" },
    account_id: { type: "uuid", nullable: true },
    name: { type: "varchar", length: 100 },
    target_amount: { type: "decimal", precision: 15, scale: 2 },
    current_amount: { type: "decimal", precision: 15, scale: 2, default: 0 },
    deadline: { type: "date", nullable: true },
    color: { type: "varchar", length: 7, nullable: true },
    icon: { type: "varchar", length: 50, nullable: true },
    status: { type: "varchar", length: 15, default: "active" },
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
      nullable: true,
    },
  },
});
