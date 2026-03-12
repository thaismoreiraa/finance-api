const UserService = require('../services/UserService');

/**
 * Controller de usuários.
 */
const UserController = {
  /** GET /users/me */
  async getProfile(req, res) {
    const user = await UserService.getProfile(req.user.id);
    res.json(user);
  },

  /** PATCH /users/me */
  async update(req, res) {
    const user = await UserService.update(req.user.id, req.body);
    res.json(user);
  },

  /** DELETE /users/me */
  async remove(req, res) {
    await UserService.softDelete(req.user.id);
    res.status(204).send();
  },

  /** PATCH /users/me/password */
  async changePassword(req, res) {
    await UserService.changePassword(req.user.id, req.body);
    res.status(204).send();
  },
};

module.exports = UserController;
