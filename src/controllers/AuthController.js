const AuthService = require("../services/AuthService");

/**
 * Controller de autenticação.
 */
const AuthController = {
  /** POST /auth/register */
  async register(req, res) {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  },

  /** POST /auth/login */
  async login(req, res) {
    const result = await AuthService.login(req.body);
    res.json(result);
  },

  /** POST /auth/refresh */
  async refresh(req, res) {
    const result = await AuthService.refresh(req.body);
    res.json(result);
  },

  /** POST /auth/logout */
  async logout(req, res) {
    res.status(204).send();
  },
};

module.exports = AuthController;
