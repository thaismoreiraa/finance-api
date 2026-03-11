const { AppDataSource } = require("../config/database");
const {
  IsNull,
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  Like,
  ILike,
} = require("typeorm");

/**
 * Repositório de transações.
 */
const TransactionRepository = AppDataSource.getRepository("Transaction").extend(
  {
    /**
     * Busca transações do usuário com filtros e paginação.
     * @param {string} userId
     * @param {object} filters
     * @param {number} skip
     * @param {number} take
     * @returns {Promise<[Transaction[], number]>}
     */
    findByUserPaginated(userId, filters, skip, take) {
      const where = { user_id: userId, deleted_at: IsNull() };

      if (filters.account_id) where.account_id = filters.account_id;
      if (filters.category_id) where.category_id = filters.category_id;
      if (filters.type) where.type = filters.type;
      if (filters.status) where.status = filters.status;
      if (filters.search) where.description = ILike(`%${filters.search}%`);

      if (filters.date_from && filters.date_to) {
        where.date = Between(filters.date_from, filters.date_to);
      } else if (filters.date_from) {
        where.date = MoreThanOrEqual(filters.date_from);
      } else if (filters.date_to) {
        where.date = LessThanOrEqual(filters.date_to);
      }

      const qb = this.createQueryBuilder("t")
        .leftJoinAndSelect("t.account", "account")
        .leftJoinAndSelect("t.category", "category")
        .where("t.user_id = :userId", { userId })
        .andWhere("t.deleted_at IS NULL");

      if (filters.account_id)
        qb.andWhere("t.account_id = :accountId", {
          accountId: filters.account_id,
        });
      if (filters.category_id)
        qb.andWhere("t.category_id = :categoryId", {
          categoryId: filters.category_id,
        });
      if (filters.type) qb.andWhere("t.type = :type", { type: filters.type });
      if (filters.status)
        qb.andWhere("t.status = :status", { status: filters.status });
      if (filters.search)
        qb.andWhere("t.description ILIKE :search", {
          search: `%${filters.search}%`,
        });
      if (filters.date_from)
        qb.andWhere("t.date >= :dateFrom", { dateFrom: filters.date_from });
      if (filters.date_to)
        qb.andWhere("t.date <= :dateTo", { dateTo: filters.date_to });
      if (filters.min_amount)
        qb.andWhere("t.amount >= :minAmount", {
          minAmount: filters.min_amount,
        });
      if (filters.max_amount)
        qb.andWhere("t.amount <= :maxAmount", {
          maxAmount: filters.max_amount,
        });

      return qb
        .orderBy("t.date", "DESC")
        .addOrderBy("t.created_at", "DESC")
        .skip(skip)
        .take(take)
        .getManyAndCount();
    },

    /**
     * Busca uma transação por ID garantindo que pertence ao usuário.
     * @param {string} id
     * @param {string} userId
     * @returns {Promise<Transaction|null>}
     */
    findByIdAndUser(id, userId) {
      return this.findOne({
        where: { id, user_id: userId, deleted_at: IsNull() },
        relations: ["account", "category"],
      });
    },

    /**
     * Verifica se existem transações ativas vinculadas a uma conta.
     * @param {string} accountId
     * @returns {Promise<boolean>}
     */
    async hasTransactionsForAccount(accountId) {
      const count = await this.count({
        where: { account_id: accountId, deleted_at: IsNull() },
      });
      return count > 0;
    },

    /**
     * Soma as transações confirmadas de uma categoria em um período.
     * @param {string} userId
     * @param {string} categoryId
     * @param {string} dateFrom
     * @param {string} dateTo
     * @returns {Promise<number>}
     */
    async sumByCategoryAndPeriod(userId, categoryId, dateFrom, dateTo) {
      const result = await this.createQueryBuilder("t")
        .select("COALESCE(SUM(t.amount), 0)", "total")
        .where("t.user_id = :userId", { userId })
        .andWhere("t.category_id = :categoryId", { categoryId })
        .andWhere("t.status = :status", { status: "confirmed" })
        .andWhere("t.deleted_at IS NULL")
        .andWhere("t.date >= :dateFrom", { dateFrom })
        .andWhere("t.date <= :dateTo", { dateTo })
        .getRawOne();
      return Number(result.total);
    },
  },
);

module.exports = TransactionRepository;
