const { AppDataSource } = require('../config/database');
const { IsNull } = require('typeorm');

/**
 * Repositório de categorias.
 */
const CategoryRepository = AppDataSource.getRepository('Category').extend({
  /**
   * Busca categorias do usuário, opcionalmente filtrando por tipo.
   * @param {string} userId
   * @param {string} [type]
   * @returns {Promise<Category[]>}
   */
  findByUser(userId, type) {
    const where = { user_id: userId, deleted_at: IsNull() };
    if (type) where.type = type;
    return this.find({ where, order: { name: 'ASC' } });
  },

  /**
   * Busca uma categoria por ID garantindo que pertence ao usuário.
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Category|null>}
   */
  findByIdAndUser(id, userId) {
    return this.findOne({
      where: { id, user_id: userId, deleted_at: IsNull() },
    });
  },

  /**
   * Verifica se a categoria possui transações ativas vinculadas.
   * @param {string} categoryId
   * @returns {Promise<boolean>}
   */
  async hasTransactions(categoryId) {
    const count = await AppDataSource.getRepository('Transaction').count({
      where: { category_id: categoryId, deleted_at: IsNull() },
    });
    return count > 0;
  },
});

module.exports = CategoryRepository;
