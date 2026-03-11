const BudgetRepository = require("../repositories/BudgetRepository");
const TransactionRepository = require("../repositories/TransactionRepository");
const AppError = require("../utils/AppError");

/**
 * Serviço de orçamentos.
 */
const BudgetService = {
  /**
   * Lista orçamentos do usuário com campos calculados (spent, remaining, usage_percent, alert_triggered).
   * @param {string} userId
   * @param {number} year
   * @param {number} [month]
   * @returns {Promise<object[]>}
   */
  async list(userId, year, month) {
    const budgets = await BudgetRepository.findByUserAndPeriod(
      userId,
      year,
      month,
    );

    const result = [];
    for (const budget of budgets) {
      const enriched = await this._enrichBudget(budget, userId);
      result.push(enriched);
    }

    return result;
  },

  /**
   * Cria um novo orçamento.
   * Lança 409 se já existir para a mesma categoria + período.
   * @param {string} userId
   * @param {object} data
   * @returns {Promise<object>}
   */
  async create(userId, data) {
    const exists = await BudgetRepository.existsByCategoryAndPeriod(
      userId,
      data.category_id,
      data.year,
      data.month || null,
    );
    if (exists) {
      throw new AppError(
        "Já existe um orçamento para esta categoria neste período.",
        409,
        "CONFLICT",
      );
    }

    const budget = BudgetRepository.create({ ...data, user_id: userId });
    const saved = await BudgetRepository.save(budget);

    return this._enrichBudget(saved, userId);
  },

  /**
   * Atualiza um orçamento.
   * @param {string} id
   * @param {string} userId
   * @param {object} data
   * @returns {Promise<object>}
   */
  async update(id, userId, data) {
    const budget = await BudgetRepository.findByIdAndUser(id, userId);
    if (!budget)
      throw new AppError("Orçamento não encontrado.", 404, "NOT_FOUND");

    // Verificar unicidade se category_id ou período mudou
    if (data.category_id || data.year || data.month !== undefined) {
      const catId = data.category_id || budget.category_id;
      const yr = data.year || budget.year;
      const mo = data.month !== undefined ? data.month : budget.month;

      const exists = await BudgetRepository.existsByCategoryAndPeriod(
        userId,
        catId,
        yr,
        mo,
        id,
      );
      if (exists) {
        throw new AppError(
          "Já existe um orçamento para esta categoria neste período.",
          409,
          "CONFLICT",
        );
      }
    }

    Object.assign(budget, data);
    const saved = await BudgetRepository.save(budget);

    return this._enrichBudget(saved, userId);
  },

  /**
   * Exclui um orçamento.
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async remove(id, userId) {
    const budget = await BudgetRepository.findByIdAndUser(id, userId);
    if (!budget)
      throw new AppError("Orçamento não encontrado.", 404, "NOT_FOUND");
    await BudgetRepository.remove(budget);
  },

  /**
   * Enriquece um orçamento com campos calculados.
   * @param {object} budget
   * @param {string} userId
   * @returns {Promise<object>}
   */
  async _enrichBudget(budget, userId) {
    let dateFrom, dateTo;

    if (budget.period === "monthly" && budget.month) {
      const y = budget.year;
      const m = String(budget.month).padStart(2, "0");
      dateFrom = `${y}-${m}-01`;
      // Último dia do mês
      const lastDay = new Date(y, budget.month, 0).getDate();
      dateTo = `${y}-${m}-${String(lastDay).padStart(2, "0")}`;
    } else {
      dateFrom = `${budget.year}-01-01`;
      dateTo = `${budget.year}-12-31`;
    }

    const spent = await TransactionRepository.sumByCategoryAndPeriod(
      userId,
      budget.category_id,
      dateFrom,
      dateTo,
    );
    const amount = Number(budget.amount);
    const remaining = Math.max(0, amount - spent);
    const usage_percent =
      amount > 0 ? Math.round((spent / amount) * 10000) / 100 : 0;
    const alert_triggered = usage_percent >= (budget.alert_threshold || 80);

    return {
      ...budget,
      spent,
      remaining,
      usage_percent,
      alert_triggered,
    };
  },
};

module.exports = BudgetService;
