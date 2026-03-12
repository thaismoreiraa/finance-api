const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const UserRepository = require('../repositories/UserRepository');
const AppError = require('../utils/AppError');

/**
 * Serviço de autenticação.
 */
const AuthService = {
  /**
   * Registra um novo usuário e retorna os tokens.
   * @param {{ name: string, email: string, password: string, currency?: string }} data
   * @returns {Promise<{ access_token: string, refresh_token: string, token_type: string, expires_in: number }>}
   */
  async register(data) {
    const existing = await UserRepository.findByEmail(data.email);
    if (existing) throw new AppError('E-mail já cadastrado.', 409, 'CONFLICT');

    const password_hash = await bcrypt.hash(data.password, 10);
    const user = UserRepository.create({
      name: data.name,
      email: data.email,
      password_hash,
      currency: data.currency || 'BRL',
    });
    await UserRepository.save(user);

    return this._generateTokens(user);
  },

  /**
   * Autentica um usuário e retorna os tokens.
   * @param {{ email: string, password: string }} data
   * @returns {Promise<{ access_token: string, refresh_token: string, token_type: string, expires_in: number }>}
   */
  async login(data) {
    const user = await UserRepository.findByEmail(data.email);
    if (!user) throw new AppError('Credenciais inválidas.', 401, 'UNAUTHORIZED');

    const valid = await bcrypt.compare(data.password, user.password_hash);
    if (!valid) throw new AppError('Credenciais inválidas.', 401, 'UNAUTHORIZED');

    return this._generateTokens(user);
  },

  /**
   * Renova os tokens usando o refresh_token.
   * @param {{ refresh_token: string }} data
   * @returns {Promise<{ access_token: string, refresh_token: string, token_type: string, expires_in: number }>}
   */
  async refresh(data) {
    try {
      const payload = jwt.verify(data.refresh_token, env.JWT_REFRESH_SECRET);
      const user = await UserRepository.findByIdActive(payload.sub);
      if (!user) throw new AppError('Token inválido.', 401, 'UNAUTHORIZED');
      return this._generateTokens(user);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Token inválido ou expirado.', 401, 'UNAUTHORIZED');
    }
  },

  /**
   * Gera um par de tokens JWT (access + refresh).
   * @param {object} user
   * @returns {{ access_token: string, refresh_token: string, token_type: string, expires_in: number }}
   */
  _generateTokens(user) {
    const access_token = jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
    const refresh_token = jwt.sign({ sub: user.id }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });
    return {
      access_token,
      refresh_token,
      token_type: 'Bearer',
      expires_in: 3600,
    };
  },
};

module.exports = AuthService;
