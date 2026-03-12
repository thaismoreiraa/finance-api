const { EntitySchema } = require('typeorm');

/**
 * @typedef {Object} AuditLog
 * @property {string} id
 * @property {string} user_id
 * @property {string} table_name
 * @property {string} record_id
 * @property {'INSERT'|'UPDATE'|'DELETE'} action
 * @property {object|null} old_data
 * @property {object|null} new_data
 * @property {Date} created_at
 */
module.exports = new EntitySchema({
  name: 'AuditLog',
  tableName: 'audit_logs',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    user_id: { type: 'uuid' },
    table_name: { type: 'varchar', length: 50 },
    record_id: { type: 'uuid' },
    action: { type: 'varchar', length: 10 },
    old_data: { type: 'jsonb', nullable: true },
    new_data: { type: 'jsonb', nullable: true },
    created_at: { type: 'timestamp', createDate: true },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'user_id' },
    },
  },
});
