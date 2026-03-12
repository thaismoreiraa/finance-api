const RecurrenceService = require('../services/RecurrenceService');

/**
 * Controller de recorrências.
 */
const RecurrenceController = {
  /** GET /recurrences */
  async list(req, res) {
    const isActive = req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined;
    const recurrences = await RecurrenceService.list(req.user.id, isActive);
    res.json(recurrences);
  },

  /** POST /recurrences */
  async create(req, res) {
    const recurrence = await RecurrenceService.create(req.user.id, req.body);
    res.status(201).json(recurrence);
  },

  /** PATCH /recurrences/:id */
  async update(req, res) {
    const recurrence = await RecurrenceService.update(req.params.id, req.user.id, req.body);
    res.json(recurrence);
  },

  /** DELETE /recurrences/:id */
  async remove(req, res) {
    await RecurrenceService.remove(req.params.id, req.user.id);
    res.status(204).send();
  },
};

module.exports = RecurrenceController;
