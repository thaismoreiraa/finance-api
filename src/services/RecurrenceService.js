const RecurrenceRepository = require('../repositories/RecurrenceRepository');
const TransactionRepository = require('../repositories/TransactionRepository');
const AccountRepository = require('../repositories/AccountRepository');
const AppError = require('../utils/AppError');
const { calculateNextDueDate, isFutureDate } = require('../utils/dateHelper');
const { IsNull } = require('typeorm');

/**
 * Serviço de recorrências.
 */
const RecurrenceService = {
  /**
   * Lista recorrências do usuário.
   * @param {string} userId
   * @param {boolean} [isActive]
   * @returns {Promise<Recurrence[]>}
   */
  async list(userId, isActive) {
    return RecurrenceRepository.findByUser(userId, isActive);
  },

  /**
   * Cria uma recorrência e gera a primeira transação automaticamente.
   * @param {string} userId
   * @param {object} data
   * @returns {Promise<Recurrence>}
   */
  async create(userId, data) {
    const account = await AccountRepository.findByIdAndUser(data.account_id, userId);
    if (!account) throw new AppError('Conta não encontrada.', 404, 'NOT_FOUND');

    const nextDueDate = calculateNextDueDate(data.start_date, data.frequency);

    const recurrence = RecurrenceRepository.create({
      ...data,
      user_id: userId,
      next_due_date: nextDueDate,
    });
    const saved = await RecurrenceRepository.save(recurrence);

    // Gerar a primeira transação
    const status = data.auto_confirm && !isFutureDate(data.start_date) ? 'confirmed' : 'scheduled';

    const tx = TransactionRepository.create({
      user_id: userId,
      account_id: data.account_id,
      category_id: data.category_id || null,
      recurrence_id: saved.id,
      type: data.type,
      amount: data.amount,
      description: data.description || null,
      date: data.start_date,
      status,
    });
    const savedTx = await TransactionRepository.save(tx);

    // Atualizar saldo se confirmada
    if (savedTx.status === 'confirmed') {
      const delta = data.type === 'income' ? data.amount : -data.amount;
      await AccountRepository.updateBalance(data.account_id, delta);
    }

    return saved;
  },

  /**
   * Atualiza uma recorrência com base no update_scope.
   * @param {string} id
   * @param {string} userId
   * @param {object} data
   * @returns {Promise<Recurrence>}
   */
  async update(id, userId, data) {
    const recurrence = await RecurrenceRepository.findByIdAndUser(id, userId);
    if (!recurrence) throw new AppError('Recorrência não encontrada.', 404, 'NOT_FOUND');

    const { update_scope, ...updateData } = data;

    switch (update_scope) {
      case 'this_only':
        // Não altera a recorrência, apenas busca e altera a transação da próxima ocorrência
        break;

      case 'this_and_future': {
        Object.assign(recurrence, updateData);
        if (updateData.frequency || updateData.start_date) {
          recurrence.next_due_date = calculateNextDueDate(
            recurrence.next_due_date || recurrence.start_date,
            recurrence.frequency
          );
        }
        await RecurrenceRepository.save(recurrence);

        // Cancelar transações futuras pendentes
        await this._cancelFuturePendingTransactions(recurrence.id, userId);
        break;
      }

      case 'all':
      default: {
        Object.assign(recurrence, updateData);
        if (updateData.frequency || updateData.start_date) {
          recurrence.next_due_date = calculateNextDueDate(
            recurrence.start_date,
            recurrence.frequency
          );
        }
        await RecurrenceRepository.save(recurrence);

        // Cancelar todas transações futuras pendentes
        await this._cancelFuturePendingTransactions(recurrence.id, userId);
        break;
      }
    }

    return recurrence;
  },

  /**
   * Cancela (desativa) uma recorrência.
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async remove(id, userId) {
    const recurrence = await RecurrenceRepository.findByIdAndUser(id, userId);
    if (!recurrence) throw new AppError('Recorrência não encontrada.', 404, 'NOT_FOUND');

    recurrence.is_active = false;
    await RecurrenceRepository.save(recurrence);
  },

  /**
   * Cancela transações futuras pendentes vinculadas a uma recorrência.
   * @param {string} recurrenceId
   * @param {string} userId
   */
  async _cancelFuturePendingTransactions(recurrenceId, userId) {
    const today = new Date().toISOString().split('T')[0];
    await TransactionRepository.createQueryBuilder()
      .update()
      .set({ status: 'cancelled' })
      .where('recurrence_id = :recurrenceId', { recurrenceId })
      .andWhere('user_id = :userId', { userId })
      .andWhere('status IN (:...statuses)', {
        statuses: ['scheduled', 'pending'],
      })
      .andWhere('date >= :today', { today })
      .andWhere('deleted_at IS NULL')
      .execute();
  },
};

module.exports = RecurrenceService;
