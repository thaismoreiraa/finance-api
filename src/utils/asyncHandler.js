/**
 * Wrapper para handlers assíncronos do Express.
 * Captura erros de promises e passa para o middleware de erro.
 *
 * @param {Function} fn - Função async (req, res, next)
 * @returns {Function}
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
