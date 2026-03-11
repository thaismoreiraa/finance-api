const { EntitySchema } = require("typeorm");

/**
 * @typedef {Object} Category
 * @property {string} id - UUID da categoria
 * @property {string} user_id - ID do usuário dono
 * @property {string} name - Nome da categoria
 * @property {'income'|'expense'} type - Tipo
 * @property {string|null} color - Cor em hex
 * @property {string|null} icon - Nome do ícone
 * @property {string|null} parent_id - ID da categoria pai (subcategoria)
 * @property {boolean} is_default - Categoria padrão?
 * @property {Date} created_at
 * @property {Date|null} deleted_at - Soft delete
 */
module.exports = new EntitySchema({
  name: "Category",
  tableName: "categories",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    user_id: { type: "uuid" },
    name: { type: "varchar", length: 100 },
    type: { type: "varchar", length: 10 },
    color: { type: "varchar", length: 7, nullable: true },
    icon: { type: "varchar", length: 50, nullable: true },
    parent_id: { type: "uuid", nullable: true },
    is_default: { type: "boolean", default: false },
    created_at: { type: "timestamp", createDate: true },
    deleted_at: { type: "timestamp", nullable: true },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "user_id" },
    },
    parent: {
      type: "many-to-one",
      target: "Category",
      joinColumn: { name: "parent_id" },
      nullable: true,
    },
    children: {
      type: "one-to-many",
      target: "Category",
      inverseSide: "parent",
    },
  },
});
