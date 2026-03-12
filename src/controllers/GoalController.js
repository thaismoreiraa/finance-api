const GoalService = require('../services/GoalService');

/**
 * Controller de metas.
 */
const GoalController = {
  /** GET /goals */
  async list(req, res) {
    const goals = await GoalService.list(req.user.id, req.query.status);
    res.json(goals);
  },

  /** GET /goals/:id */
  async findById(req, res) {
    const goal = await GoalService.findById(req.params.id, req.user.id);
    res.json(goal);
  },

  /** POST /goals */
  async create(req, res) {
    const goal = await GoalService.create(req.user.id, req.body);
    res.status(201).json(goal);
  },

  /** PATCH /goals/:id */
  async update(req, res) {
    const goal = await GoalService.update(req.params.id, req.user.id, req.body);
    res.json(goal);
  },

  /** DELETE /goals/:id */
  async remove(req, res) {
    await GoalService.remove(req.params.id, req.user.id);
    res.status(204).send();
  },

  /** POST /goals/:id/deposit */
  async deposit(req, res) {
    const goal = await GoalService.deposit(req.params.id, req.user.id, req.body.amount);
    res.json(goal);
  },
};

module.exports = GoalController;
