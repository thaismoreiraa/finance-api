const { AppDataSource } = require('../config/database');

/**
 * Repositório de metas.
 */
const GoalRepository = AppDataSource.getRepository('Goal').extend({
  /**
   * Busca metas do usuário, opcionalmente filtrando por status.
   * @param {string} userId
   * @param {string} [status]
   * @returns {Promise<Goal[]>}
   */
  findByUser(userId, status) {
    const where = { user_id: userId };
    if (status) where.status = status;
    return this.find({ where, order: { created_at: 'DESC' } });
  },

  /**
   * Busca uma meta por ID garantindo que pertence ao usuário.
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Goal|null>}
   */
  findByIdAndUser(id, userId) {
    return this.findOne({ where: { id, user_id: userId } });
  },
});

module.exports = GoalRepository;
