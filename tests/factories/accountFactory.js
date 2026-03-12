/**
 * Cria um objeto de conta para uso nos testes.
 * @param {Partial<Account>} overrides - Campos para sobrescrever o padrão
 * @returns {object}
 */
function makeAccount(overrides = {}) {
  return {
    name: 'Conta Teste',
    type: 'checking',
    currency: 'BRL',
    allow_negative: false,
    ...overrides,
  };
}

module.exports = { makeAccount };
