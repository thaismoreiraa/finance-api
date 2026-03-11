jest.mock("../../../src/repositories/GoalRepository", () => ({
  findByUser: jest.fn(),
  findByIdAndUser: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
}));
jest.mock("../../../src/repositories/AccountRepository", () => ({
  findByIdAndUser: jest.fn(),
  updateBalance: jest.fn(),
}));

const GoalService = require("../../../src/services/GoalService");
const GoalRepository = require("../../../src/repositories/GoalRepository");
const AccountRepository = require("../../../src/repositories/AccountRepository");

describe("GoalService", () => {
  afterEach(() => jest.clearAllMocks());

  describe("list", () => {
    it("deve retornar metas enriquecidas com progress_percent e days_remaining", async () => {
      // TODO: implemente o teste
    });
  });

  describe("deposit", () => {
    it("deve somar valor ao current_amount e completar meta quando atingir target", async () => {
      // TODO: implemente o teste
    });

    it("deve lançar 404 quando meta não encontrada", async () => {
      // TODO: implemente o teste
    });
  });

  describe("remove", () => {
    it("deve lançar 404 quando meta não encontrada", async () => {
      // TODO: implemente o teste
    });
  });
});
