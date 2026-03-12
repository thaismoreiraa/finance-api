jest.mock('../../../src/repositories/BudgetRepository', () => ({
  findByUserAndPeriod: jest.fn(),
  findByIdAndUser: jest.fn(),
  existsByCategoryAndPeriod: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
}));
jest.mock('../../../src/repositories/TransactionRepository', () => ({
  sumByCategoryAndPeriod: jest.fn(),
}));

const BudgetService = require('../../../src/services/BudgetService');
const BudgetRepository = require('../../../src/repositories/BudgetRepository');
const TransactionRepository = require('../../../src/repositories/TransactionRepository');

describe('BudgetService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('deve lançar 409 quando orçamento já existe para a categoria no período', async () => {
      // TODO: implemente o teste
    });
  });

  describe('list', () => {
    it('deve retornar orçamentos com spent, remaining, usage_percent e alert_triggered calculados', async () => {
      // TODO: implemente o teste
    });

    it('deve retornar alert_triggered = false quando usage está abaixo do threshold', async () => {
      // TODO: implemente o teste
    });
  });
});
