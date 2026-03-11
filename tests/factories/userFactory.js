/**
 * Cria um objeto de usuário para uso nos testes.
 * @param {object} overrides - Campos para sobrescrever o padrão
 * @returns {object}
 */
function makeUser(overrides = {}) {
  return {
    name: "Usuário Teste",
    email: `teste${Date.now()}@email.com`,
    password: "senhaSegura123",
    currency: "BRL",
    ...overrides,
  };
}

module.exports = { makeUser };
