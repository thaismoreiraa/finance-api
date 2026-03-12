/**
 * Cria um objeto de categoria para uso nos testes.
 * @param {object} overrides - Campos para sobrescrever o padrão
 * @returns {object}
 */
function makeCategory(overrides = {}) {
  return {
    name: 'Categoria Teste',
    type: 'expense',
    ...overrides,
  };
}

module.exports = { makeCategory };
