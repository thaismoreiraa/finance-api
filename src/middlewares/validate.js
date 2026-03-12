const AppError = require('../utils/AppError');

/**
 * Factory de middleware de validação.
 * Recebe um schema Zod e retorna um middleware que valida req.body.
 *
 * @param {import('zod').ZodSchema} schema
 * @returns {import('express').RequestHandler}
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      const error = new AppError('Dados inválidos.', 400, 'VALIDATION_ERROR');
      error.details = details;
      throw error;
    }
    req.body = result.data;
    next();
  };
}

module.exports = validate;
