const { AppDataSource } = require('../config/database');

/**
 * Repositório de recorrências.
 */
const RecurrenceRepository = AppDataSource.getRepository('Recurrence').extend({
  /**
   * Busca recorrências do usuário.
   * @param {string} userId
   * @param {boolean} [isActive]
   * @returns {Promise<Recurrence[]>}
   */
  findByUser(userId, isActive) {
    const where = { user_id: userId };
    if (isActive !== undefined) where.is_active = isActive;
    return this.find({ where, order: { created_at: 'DESC' } });
  },

  /**
   * Busca uma recorrência por ID garantindo que pertence ao usuário.
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Recurrence|null>}
   */
  findByIdAndUser(id, userId) {
    return this.findOne({ where: { id, user_id: userId } });
  },
});

module.exports = RecurrenceRepository;
