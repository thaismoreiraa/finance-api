const { AppDataSource } = require("../config/database");

/**
 * Repositório de orçamentos.
 */
const BudgetRepository = AppDataSource.getRepository("Budget").extend({
  /**
   * Busca orçamentos do usuário por ano e mês.
   * @param {string} userId
   * @param {number} year
   * @param {number} [month]
   * @returns {Promise<Budget[]>}
   */
  findByUserAndPeriod(userId, year, month) {
    const where = { user_id: userId, year };
    if (month) where.month = month;
    return this.find({
      where,
      relations: ["category"],
      order: { created_at: "ASC" },
    });
  },

  /**
   * Busca orçamento por ID garantindo que pertence ao usuário.
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Budget|null>}
   */
  findByIdAndUser(id, userId) {
    return this.findOne({
      where: { id, user_id: userId },
      relations: ["category"],
    });
  },

  /**
   * Verifica se já existe orçamento para a mesma categoria no período.
   * @param {string} userId
   * @param {string} categoryId
   * @param {number} year
   * @param {number|null} month
   * @param {string} [excludeId] - ID a excluir da verificação (para update)
   * @returns {Promise<boolean>}
   */
  async existsByCategoryAndPeriod(userId, categoryId, year, month, excludeId) {
    const qb = this.createQueryBuilder("b")
      .where("b.user_id = :userId", { userId })
      .andWhere("b.category_id = :categoryId", { categoryId })
      .andWhere("b.year = :year", { year });

    if (month) {
      qb.andWhere("b.month = :month", { month });
    } else {
      qb.andWhere("b.month IS NULL");
    }

    if (excludeId) {
      qb.andWhere("b.id != :excludeId", { excludeId });
    }

    const count = await qb.getCount();
    return count > 0;
  },
});

module.exports = BudgetRepository;
