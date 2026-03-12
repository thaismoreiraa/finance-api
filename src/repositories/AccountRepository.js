const { AppDataSource } = require('../config/database');

/**
 * Repositório de contas.
 * Responsável por todas as queries na tabela `accounts`.
 * Não contém regras de negócio.
 */
const AccountRepository = AppDataSource.getRepository('Account').extend({
  /**
   * Busca todas as contas ativas de um usuário.
   * @param {string} userId
   * @returns {Promise<Account[]>}
   */
  findByUser(userId) {
    return this.find({
      where: { user_id: userId, is_active: true, deleted_at: null },
      order: { created_at: 'ASC' },
    });
  },

  /**
   * Busca uma conta por ID garantindo que pertence ao usuário.
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Account|null>}
   */
  findByIdAndUser(id, userId) {
    return this.findOne({ where: { id, user_id: userId, deleted_at: null } });
  },

  /**
   * Atualiza o saldo de uma conta somando (ou subtraindo) um valor.
   * @param {string} accountId
   * @param {number} delta - Valor positivo para crédito, negativo para débito
   * @returns {Promise<void>}
   */
  async updateBalance(accountId, delta) {
    await this.createQueryBuilder()
      .update()
      .set({ balance: () => `balance + ${Number(delta)}` })
      .where('id = :id', { id: accountId })
      .execute();
  },
});

module.exports = AccountRepository;
