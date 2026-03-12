/**
 * Monta a resposta paginada padrão da API.
 *
 * @param {Array} data - Registros da página atual
 * @param {number} total - Total de registros sem paginação
 * @param {number} page - Página atual (1-based)
 * @param {number} perPage - Itens por página
 * @returns {{ data: Array, pagination: { page: number, per_page: number, total: number, total_pages: number } }}
 */
function paginate(data, total, page, perPage) {
  return {
    data,
    pagination: {
      page,
      per_page: perPage,
      total,
      total_pages: Math.ceil(total / perPage),
    },
  };
}

/**
 * Extrai e normaliza os parâmetros de paginação da query string.
 *
 * @param {object} query - req.query
 * @returns {{ page: number, perPage: number, skip: number }}
 */
function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(query.per_page, 10) || 20));
  const skip = (page - 1) * perPage;
  return { page, perPage, skip };
}

module.exports = { paginate, parsePagination };
