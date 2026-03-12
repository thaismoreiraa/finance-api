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
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'user_id' },
    },
  },
});
