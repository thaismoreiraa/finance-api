const AccountRepository = require("../repositories/AccountRepository");
const TransactionRepository = require("../repositories/TransactionRepository");
const AppError = require("../utils/AppError");

/**
 * Serviço de contas.
 * Contém as regras de negócio relacionadas a contas bancárias.
 */
const AccountService = {
  /**
   * Lista todas as contas do usuário com o saldo total consolidado.
   * @param {string} userId
   * @returns {Promise<{ data: Account[], total_balance: number }>}
   */
  async list(userId) {
    const accounts = await AccountRepository.findByUser(userId);
    const total_balance = accounts.reduce(
      (sum, acc) => sum + Number(acc.balance),
      0,
    );
    return { data: accounts, total_balance };
  },

  /**
   * Cria uma nova conta para o usuário.
   * @param {string} userId
   * @param {object} data
   * @returns {Promise<Account>}
   */
  async create(userId, data) {
    const account = AccountRepository.create({
      ...data,
      user_id: userId,
      balance: data.initial_balance ?? 0,
    });
    delete account.initial_balance;
    return AccountRepository.save(account);
  },

  /**
   * Busca uma conta por ID. Lança erro 404 se não encontrar.
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Account>}
   */
  async findById(id, userId) {
    const account = await AccountRepository.findByIdAndUser(id, userId);
    if (!account) throw new AppError("Conta não encontrada.", 404, "NOT_FOUND");
    return account;
  },

  /**
   * Atualiza os dados de uma conta.
   * @param {string} id
   * @param {string} userId
   * @param {object} data
   * @returns {Promise<Account>}
   */
  async update(id, userId, data) {
    const account = await this.findById(id, userId);
    Object.assign(account, data);
    return AccountRepository.save(account);
  },

  /**
   * Faz o soft delete de uma conta.
   * Lança erro 409 se houver transações vinculadas.
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async remove(id, userId) {
    const account = await this.findById(id, userId);

    const hasTransactions =
      await TransactionRepository.hasTransactionsForAccount(id);
    if (hasTransactions) {
      throw new AppError(
        "Conta possui transações vinculadas. Não é possível excluir.",
        409,
        "CONFLICT",
      );
    }

    account.deleted_at = new Date();
    account.is_active = false;
    await AccountRepository.save(account);
  },
};

module.exports = AccountService;
