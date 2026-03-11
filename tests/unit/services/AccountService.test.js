jest.mock("../../../src/repositories/AccountRepository", () => ({
  findByUser: jest.fn(),
  findByIdAndUser: jest.fn(),
  updateBalance: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  softRemove: jest.fn(),
}));
jest.mock("../../../src/repositories/TransactionRepository", () => ({
  hasTransactionsForAccount: jest.fn(),
}));

const AccountService = require("../../../src/services/AccountService");
const AccountRepository = require("../../../src/repositories/AccountRepository");
const TransactionRepository = require("../../../src/repositories/TransactionRepository");

describe("AccountService", () => {
  afterEach(() => jest.clearAllMocks());

  describe("list", () => {
    it("deve retornar as contas do usuário com o saldo total", async () => {
      // TODO: implemente o teste
    });

    it("deve retornar total_balance = 0 quando não há contas", async () => {
      // TODO: implemente o teste
    });
  });

  describe("create", () => {
    it("deve criar uma conta com o saldo inicial informado", async () => {
      // TODO: implemente o teste
    });

    it("deve criar uma conta com saldo 0 quando initial_balance não for informado", async () => {
      // TODO: implemente o teste
    });
  });

  describe("remove", () => {
    it("deve lançar AppError 404 quando a conta não existir", async () => {
      // TODO: implemente o teste
    });

    it("deve lançar AppError 409 quando a conta tiver transações vinculadas", async () => {
      // TODO: implemente o teste
    });
  });
});
