const { paginate, parsePagination } = require('../../../src/utils/pagination');

describe('pagination', () => {
  describe('parsePagination', () => {
    it('deve retornar defaults quando não há query', () => {
      // TODO: implemente o teste
    });

    it('deve parsear page e per_page da query', () => {
      // TODO: implemente o teste
    });

    it('deve limitar per_page ao máximo de 100', () => {
      // TODO: implemente o teste
    });

    it('deve garantir page mínima de 1', () => {
      // TODO: implemente o teste
    });
  });

  describe('paginate', () => {
    it('deve retornar estrutura de paginação correta', () => {
      // TODO: implemente o teste
    });

    it('deve calcular total_pages corretamente', () => {
      // TODO: implemente o teste
    });

    it('deve arredondar total_pages para cima', () => {
      // TODO: implemente o teste
    });
  });
});
