jest.mock("../../../src/config/database", () => ({
  AppDataSource: {
    transaction: jest.fn((cb) => cb({ getRepository: jest.fn() })),
  },
}));
jest.mock("../../../src/repositories/TransactionRepository", () => ({
  findByUserPaginated: jest.fn(),
  findByIdAndUser: jest.fn(),
  hasTransactionsForAccount: jest.fn(),
  sumByCategoryAndPeriod: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  softRemove: jest.fn(),
}));
jest.mock("../../../src/repositories/AccountRepository", () => ({
  findByIdAndUser: jest.fn(),
  updateBalance: jest.fn(),
}));
jest.mock("../../../src/repositories/CategoryRepository", () => ({
  findByIdAndUser: jest.fn(),
}));
jest.mock("../../../src/repositories/AuditLogRepository", () => ({
  createLog: jest.fn(),
}));

const TransactionService = require("../../../src/services/TransactionService");
const TransactionRepository = require("../../../src/repositories/TransactionRepository");
const AccountRepository = require("../../../src/repositories/AccountRepository");
const CategoryRepository = require("../../../src/repositories/CategoryRepository");
const AuditLogRepository = require("../../../src/repositories/AuditLogRepository");

describe("TransactionService", () => {
  afterEach(() => jest.clearAllMocks());

  describe("create", () => {
    it("deve rejeitar expense quando saldo ficaria negativo e allow_negative = false", async () => {
      // TODO: implemente o teste
    });

    it("deve rejeitar categoria de tipo diferente da transação", async () => {
      // TODO: implemente o teste
    });

    it("deve criar transação de income e atualizar saldo", async () => {
      // TODO: implemente o teste
    });

    it("deve marcar transação como scheduled quando data é futura", async () => {
      // TODO: implemente o teste
    });
  });

  describe("remove", () => {
    it("deve reverter o saldo e fazer soft delete", async () => {
      // TODO: implemente o teste
    });
  });
});
