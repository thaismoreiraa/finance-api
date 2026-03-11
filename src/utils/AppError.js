/**
 * Erro customizado da aplicação.
 * Use sempre que quiser retornar um erro HTTP esperado (ex: 404, 409, 422).
 *
 * @example
 * throw new AppError('Conta não encontrada.', 404);
 */
class AppError extends Error {
  /**
   * @param {string} message - Mensagem de erro
   * @param {number} [statusCode=400] - Código HTTP
   * @param {string} [code='ERROR'] - Código interno (ex: 'NOT_FOUND')
   */
  constructor(message, statusCode = 400, code = "ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

module.exports = AppError;
