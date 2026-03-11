/**
 * Cria um objeto de transação para uso nos testes.
 * @param {object} overrides - Campos para sobrescrever o padrão
 * @returns {object}
 */
function makeTransaction(overrides = {}) {
  return {
    type: "expense",
    amount: 100.0,
    description: "Transação Teste",
    date: new Date().toISOString().split("T")[0],
    ...overrides,
  };
}

module.exports = { makeTransaction };
