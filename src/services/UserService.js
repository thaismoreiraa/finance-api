const bcrypt = require("bcryptjs");
const UserRepository = require("../repositories/UserRepository");
const AppError = require("../utils/AppError");

/**
 * Serviço de usuários.
 */
const UserService = {
  /**
   * Retorna os dados do usuário logado.
   * @param {string} userId
   * @returns {Promise<object>}
   */
  async getProfile(userId) {
    const user = await UserRepository.findByIdActive(userId);
    if (!user) throw new AppError("Usuário não encontrado.", 404, "NOT_FOUND");
    const { password_hash, deleted_at, ...profile } = user;
    return profile;
  },

  /**
   * Atualiza dados do usuário (name, currency).
   * @param {string} userId
   * @param {object} data
   * @returns {Promise<object>}
   */
  async update(userId, data) {
    const user = await UserRepository.findByIdActive(userId);
    if (!user) throw new AppError("Usuário não encontrado.", 404, "NOT_FOUND");
    Object.assign(user, data);
    await UserRepository.save(user);
    const { password_hash, deleted_at, ...profile } = user;
    return profile;
  },

  /**
   * Soft delete do usuário.
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async softDelete(userId) {
    const user = await UserRepository.findByIdActive(userId);
    if (!user) throw new AppError("Usuário não encontrado.", 404, "NOT_FOUND");
    user.deleted_at = new Date();
    await UserRepository.save(user);
  },

  /**
   * Altera a senha do usuário.
   * @param {string} userId
   * @param {{ current_password: string, new_password: string }} data
   * @returns {Promise<void>}
   */
  async changePassword(userId, data) {
    const user = await UserRepository.findByIdActive(userId);
    if (!user) throw new AppError("Usuário não encontrado.", 404, "NOT_FOUND");

    const valid = await bcrypt.compare(
      data.current_password,
      user.password_hash,
    );
    if (!valid)
      throw new AppError("Senha atual incorreta.", 401, "UNAUTHORIZED");

    user.password_hash = await bcrypt.hash(data.new_password, 10);
    await UserRepository.save(user);
  },
};

module.exports = UserService;
