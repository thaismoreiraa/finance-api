const AccountService = require("../services/AccountService");

/**
 * Controller de contas.
 */
const AccountController = {
  /** GET /accounts */
  async list(req, res) {
    const result = await AccountService.list(req.user.id);
    res.json(result);
  },

  /** POST /accounts */
  async create(req, res) {
    const account = await AccountService.create(req.user.id, req.body);
    res.status(201).json(account);
  },

  /** GET /accounts/:id */
  async findById(req, res) {
    const account = await AccountService.findById(req.params.id, req.user.id);
    res.json(account);
  },

  /** PATCH /accounts/:id */
  async update(req, res) {
    const account = await AccountService.update(
      req.params.id,
      req.user.id,
      req.body,
    );
    res.json(account);
  },

  /** DELETE /accounts/:id */
  async remove(req, res) {
    await AccountService.remove(req.params.id, req.user.id);
    res.status(204).send();
  },
};

module.exports = AccountController;
