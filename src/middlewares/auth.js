const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const AppError = require("../utils/AppError");

/**
 * Middleware de autenticação.
 * Valida o JWT do header Authorization e injeta req.user.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Token não fornecido.", 401, "UNAUTHORIZED");
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    throw new AppError("Token inválido ou expirado.", 401, "UNAUTHORIZED");
  }
}

module.exports = auth;
