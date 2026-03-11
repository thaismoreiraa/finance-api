const { AppDataSource } = require("../config/database");

/**
 * Repositório de logs de auditoria.
 */
const AuditLogRepository = AppDataSource.getRepository("AuditLog").extend({
  /**
   * Cria um registro de auditoria.
   * @param {string} userId
   * @param {string} tableName
   * @param {string} recordId
   * @param {'INSERT'|'UPDATE'|'DELETE'} action
   * @param {object|null} oldData
   * @param {object|null} newData
   * @returns {Promise<AuditLog>}
   */
  async createLog(userId, tableName, recordId, action, oldData, newData) {
    const log = this.create({
      user_id: userId,
      table_name: tableName,
      record_id: recordId,
      action,
      old_data: oldData,
      new_data: newData,
    });
    return this.save(log);
  },
});

module.exports = AuditLogRepository;
