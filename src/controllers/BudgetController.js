const BudgetService = require('../services/BudgetService');

/**
 * Controller de orçamentos.
 */
const BudgetController = {
  /** GET /budgets */
  async list(req, res) {
    const { year, month } = req.query;
    if (!year) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'O parâmetro year é obrigatório.',
      });
    }
    const budgets = await BudgetService.list(
      req.user.id,
      Number(year),
      month ? Number(month) : undefined
    );
    res.json(budgets);
  },

  /** POST /budgets */
  async create(req, res) {
    const budget = await BudgetService.create(req.user.id, req.body);
    res.status(201).json(budget);
  },

  /** PATCH /budgets/:id */
  async update(req, res) {
    const budget = await BudgetService.update(req.params.id, req.user.id, req.body);
    res.json(budget);
  },

  /** DELETE /budgets/:id */
  async remove(req, res) {
    await BudgetService.remove(req.params.id, req.user.id);
    res.status(204).send();
  },
};

module.exports = BudgetController;
