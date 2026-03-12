const TransactionService = require('../services/TransactionService');

/**
 * Controller de transações.
 */
const TransactionController = {
  /** GET /transactions */
  async list(req, res) {
    const result = await TransactionService.list(req.user.id, req.query);
    res.json(result);
  },

  /** POST /transactions */
  async create(req, res) {
    const transaction = await TransactionService.create(req.user.id, req.body);
    res.status(201).json(transaction);
  },

  /** GET /transactions/:id */
  async findById(req, res) {
    const transaction = await TransactionService.findById(req.params.id, req.user.id);
    res.json(transaction);
  },

  /** PATCH /transactions/:id */
  async update(req, res) {
    const transaction = await TransactionService.update(req.params.id, req.user.id, req.body);
    res.json(transaction);
  },

  /** DELETE /transactions/:id */
  async remove(req, res) {
    await TransactionService.remove(req.params.id, req.user.id);
    res.status(204).send();
  },

  /** POST /transactions/import */
  async import(req, res) {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Arquivo é obrigatório.' });
    }

    // Parse CSV básico
    const content = file.buffer.toString('utf-8');
    const lines = content.split('\n').filter((l) => l.trim());
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const parsedRows = lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      const row = {};
      headers.forEach((h, i) => {
        row[h] = values[i];
      });
      return {
        type: row.type || 'expense',
        amount: Number(row.amount),
        description: row.description || null,
        date: row.date,
      };
    });

    const result = await TransactionService.importPreview(
      req.user.id,
      req.body.account_id,
      parsedRows
    );
    res.json(result);
  },

  /** POST /transactions/import/confirm */
  async importConfirm(req, res) {
    const result = await TransactionService.importConfirm(req.user.id, req.body.transaction_ids);
    res.json(result);
  },
};

module.exports = TransactionController;
