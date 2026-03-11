const { AppDataSource } = require("../config/database");

/**
 * Repositório de usuários.
 */
const UserRepository = AppDataSource.getRepository("User").extend({
  /**
   * Busca um usuário pelo e-mail.
   * @param {string} email
   * @returns {Promise<User|null>}
   */
  findByEmail(email) {
    return this.findOne({ where: { email, deleted_at: null } });
  },

  /**
   * Busca um usuário ativo por ID.
   * @param {string} id
   * @returns {Promise<User|null>}
   */
  findByIdActive(id) {
    return this.findOne({ where: { id, deleted_at: null } });
  },
});

module.exports = UserRepository;
