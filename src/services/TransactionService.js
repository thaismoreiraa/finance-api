const { AppDataSource } = require('../config/database');
const TransactionRepository = require('../repositories/TransactionRepository');
const AccountRepository = require('../repositories/AccountRepository');
const CategoryRepository = require('../repositories/CategoryRepository');
const AuditLogRepository = require('../repositories/AuditLogRepository');
const AppError = require('../utils/AppError');
const { isFutureDate } = require('../utils/dateHelper');
const { paginate, parsePagination } = require('../utils/pagination');

/**
 * Serviço de transações.
 * Contém as regras de negócio mais complexas da aplicação.
 */
const TransactionService = {
  /**
   * Lista transações com filtros e paginação.
   * @param {string} userId
   * @param {object} query - Parâmetros de filtro e paginação
   * @returns {Promise<object>}
   */
  async list(userId, query) {
    const { page, perPage, skip } = parsePagination(query);
    const filters = {
      account_id: query.account_id,
      category_id: query.category_id,
      type: query.type,
      status: query.status,
      search: query.search,
      date_from: query.date_from,
      date_to: query.date_to,
      min_amount: query.min_amount ? Number(query.min_amount) : undefined,
      max_amount: query.max_amount ? Number(query.max_amount) : undefined,
    };
    const [data, total] = await TransactionRepository.findByUserPaginated(
      userId,
      filters,
      skip,
      perPage
    );
    return paginate(data, total, page, perPage);
  },

  /**
   * Cria uma nova transação.
   * - Valida tipo da categoria vs tipo da transação
   * - Transferências criam dois registros espelhados
   * - Data futura → status = scheduled
   * - Confirmed → atualiza saldo da conta
   * - Verifica allow_negative para expenses
   * @param {string} userId
   * @param {object} data
   * @returns {Promise<Transaction>}
   */
  async create(userId, data) {
    // Validar categoria vs tipo da transação
    if (data.category_id && data.type !== 'transfer') {
      const category = await CategoryRepository.findByIdAndUser(data.category_id, userId);
      if (!category) throw new AppError('Categoria não encontrada.', 404, 'NOT_FOUND');
      if (category.type !== data.type) {
        throw new AppError(
          `Categoria do tipo "${category.type}" não pode ser usada em transação do tipo "${data.type}".`,
          400,
          'VALIDATION_ERROR'
        );
      }
    }

    // Validar conta de origem
    const account = await AccountRepository.findByIdAndUser(data.account_id, userId);
    if (!account) throw new AppError('Conta não encontrada.', 404, 'NOT_FOUND');

    // Determinar status automático
    let status = data.status || 'confirmed';
    if (isFutureDate(data.date)) {
      status = 'scheduled';
    }

    // Transferências
    if (data.type === 'transfer') {
      return this._createTransfer(userId, data, account, status);
    }

    // Verificar saldo negativo para expense
    if (data.type === 'expense' && status === 'confirmed' && !account.allow_negative) {
      const newBalance = Number(account.balance) - data.amount;
      if (newBalance < 0) {
        throw new AppError(
          'Saldo insuficiente. Conta não permite saldo negativo.',
          422,
          'INSUFFICIENT_BALANCE'
        );
      }
    }

    // Criar transação simples
    const transaction = TransactionRepository.create({
      user_id: userId,
      account_id: data.account_id,
      category_id: data.category_id || null,
      recurrence_id: data.recurrence_id || null,
      type: data.type,
      amount: data.amount,
      description: data.description || null,
      date: data.date,
      status,
      notes: data.notes || null,
    });

    const saved = await TransactionRepository.save(transaction);

    // Atualizar saldo se confirmada
    if (status === 'confirmed') {
      const delta = data.type === 'income' ? data.amount : -data.amount;
      await AccountRepository.updateBalance(data.account_id, delta);
    }

    return saved;
  },

  /**
   * Cria uma transferência entre contas (duas transações espelhadas).
   * @param {string} userId
   * @param {object} data
   * @param {object} sourceAccount
   * @param {string} status
   * @returns {Promise<Transaction>}
   */
  async _createTransfer(userId, data, sourceAccount, status) {
    const destAccount = await AccountRepository.findByIdAndUser(
      data.destination_account_id,
      userId
    );
    if (!destAccount) throw new AppError('Conta de destino não encontrada.', 404, 'NOT_FOUND');

    // Verificar saldo negativo na conta de origem
    if (status === 'confirmed' && !sourceAccount.allow_negative) {
      const newBalance = Number(sourceAccount.balance) - data.amount;
      if (newBalance < 0) {
        throw new AppError('Saldo insuficiente na conta de origem.', 422, 'INSUFFICIENT_BALANCE');
      }
    }

    return AppDataSource.transaction(async (manager) => {
      const txRepo = manager.getRepository('Transaction');

      // Transação de saída (conta de origem)
      const outgoing = txRepo.create({
        user_id: userId,
        account_id: data.account_id,
        category_id: data.category_id || null,
        type: 'transfer',
        amount: data.amount,
        description: data.description || null,
        date: data.date,
        status,
        notes: data.notes || null,
      });
      const savedOutgoing = await txRepo.save(outgoing);

      // Transação de entrada (conta de destino)
      const incoming = txRepo.create({
        user_id: userId,
        account_id: data.destination_account_id,
        category_id: data.category_id || null,
        type: 'transfer',
        amount: data.amount,
        description: data.description || null,
        date: data.date,
        status,
        notes: data.notes || null,
        transfer_pair_id: savedOutgoing.id,
      });
      const savedIncoming = await txRepo.save(incoming);

      // Ligar o par na transação de saída
      savedOutgoing.transfer_pair_id = savedIncoming.id;
      await txRepo.save(savedOutgoing);

      // Atualizar saldos se confirmada
      if (status === 'confirmed') {
        await AccountRepository.updateBalance(data.account_id, -data.amount);
        await AccountRepository.updateBalance(data.destination_account_id, data.amount);
      }

      return savedOutgoing;
    });
  },

  /**
   * Busca uma transação por ID.
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Transaction>}
   */
  async findById(id, userId) {
    const transaction = await TransactionRepository.findByIdAndUser(id, userId);
    if (!transaction) throw new AppError('Transação não encontrada.', 404, 'NOT_FOUND');
    return transaction;
  },

  /**
   * Atualiza uma transação.
   * - Reverte o efeito antigo no saldo
   * - Aplica o novo efeito no saldo
   * - Cria registro de auditoria
   * @param {string} id
   * @param {string} userId
   * @param {object} data
   * @returns {Promise<Transaction>}
   */
  async update(id, userId, data) {
    const transaction = await this.findById(id, userId);
    const oldData = { ...transaction };

    // Reverter saldo antigo se estava confirmada
    if (transaction.status === 'confirmed') {
      const oldDelta =
        transaction.type === 'income' ? -Number(transaction.amount) : Number(transaction.amount);
      await AccountRepository.updateBalance(transaction.account_id, oldDelta);
    }

    // Aplicar alterações
    Object.assign(transaction, data);

    // Recalcular status se data mudou
    if (data.date && isFutureDate(data.date)) {
      transaction.status = 'scheduled';
    }

    const saved = await TransactionRepository.save(transaction);

    // Aplicar novo saldo se confirmada
    if (saved.status === 'confirmed') {
      const accountId = saved.account_id;
      const account = await AccountRepository.findByIdAndUser(accountId, userId);

      if (saved.type === 'expense' && account && !account.allow_negative) {
        const projected = Number(account.balance) - Number(saved.amount);
        if (projected < 0) {
          // Reverter a operação de saldo anterior e restaurar
          if (oldData.status === 'confirmed') {
            const revertDelta =
              oldData.type === 'income' ? Number(oldData.amount) : -Number(oldData.amount);
            await AccountRepository.updateBalance(oldData.account_id, revertDelta);
          }
          Object.assign(transaction, oldData);
          await TransactionRepository.save(transaction);
          throw new AppError(
            'Saldo insuficiente. Conta não permite saldo negativo.',
            422,
            'INSUFFICIENT_BALANCE'
          );
        }
      }

      const newDelta = saved.type === 'income' ? Number(saved.amount) : -Number(saved.amount);
      await AccountRepository.updateBalance(saved.account_id, newDelta);
    }

    // Auditoria
    await AuditLogRepository.createLog(userId, 'transactions', id, 'UPDATE', oldData, saved);

    return saved;
  },

  /**
   * Soft delete de uma transação.
   * Reverte o saldo e gera auditoria.
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async remove(id, userId) {
    const transaction = await this.findById(id, userId);
    const oldData = { ...transaction };

    // Reverter saldo se estava confirmada
    if (transaction.status === 'confirmed') {
      const delta =
        transaction.type === 'income' ? -Number(transaction.amount) : Number(transaction.amount);
      await AccountRepository.updateBalance(transaction.account_id, delta);
    }

    transaction.deleted_at = new Date();
    await TransactionRepository.save(transaction);

    // Auditoria
    await AuditLogRepository.createLog(userId, 'transactions', id, 'DELETE', oldData, null);
  },

  /**
   * Importa transações de CSV — retorna preview com detecção de duplicatas.
   * @param {string} userId
   * @param {string} accountId
   * @param {Array<object>} parsedRows - Linhas parseadas do CSV
   * @returns {Promise<object>}
   */
  async importPreview(userId, accountId, parsedRows) {
    const account = await AccountRepository.findByIdAndUser(accountId, userId);
    if (!account) throw new AppError('Conta não encontrada.', 404, 'NOT_FOUND');

    const transactions = [];
    let duplicates = 0;

    for (const row of parsedRows) {
      // Verificar duplicata por amount + date + description
      const existing = await TransactionRepository.findOne({
        where: {
          user_id: userId,
          account_id: accountId,
          amount: row.amount,
          date: row.date,
          description: row.description || null,
          deleted_at: null,
        },
      });

      const is_duplicate = !!existing;
      if (is_duplicate) duplicates++;

      transactions.push({
        ...row,
        account_id: accountId,
        user_id: userId,
        status: 'pending',
        is_duplicate,
      });
    }

    return {
      total: parsedRows.length,
      new: parsedRows.length - duplicates,
      duplicates,
      transactions,
    };
  },

  /**
   * Confirma a importação de transações selecionadas.
   * @param {string} userId
   * @param {string[]} transactionIds
   * @returns {Promise<{ imported: number }>}
   */
  async importConfirm(userId, transactionIds) {
    let imported = 0;
    for (const id of transactionIds) {
      const tx = await TransactionRepository.findByIdAndUser(id, userId);
      if (tx && tx.status === 'pending') {
        tx.status = 'confirmed';
        await TransactionRepository.save(tx);

        const delta = tx.type === 'income' ? Number(tx.amount) : -Number(tx.amount);
        await AccountRepository.updateBalance(tx.account_id, delta);
        imported++;
      }
    }
    return { imported };
  },
};

module.exports = TransactionService;
