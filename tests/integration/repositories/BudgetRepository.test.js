const { AppDataSource } = require("../../../src/config/database");

let UserRepo;
let CategoryRepo;
let BudgetRepo;
let userId;
let categoryId;

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  await AppDataSource.synchronize(true);

  UserRepo = AppDataSource.getRepository("User");
  CategoryRepo = AppDataSource.getRepository("Category");
  BudgetRepo = require("../../../src/repositories/BudgetRepository");

  // Create a new user and category for testing
  // TODO: implemente o teste

  // userId = savedUser.id;

  // categoryId = savedCategory.id;
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe("BudgetRepository", () => {
  afterEach(async () => {
    await AppDataSource.query("DELETE FROM budgets");
  });

  it("deve criar orçamento e buscar por período", async () => {
    // TODO: implemente o teste
  });

  it("deve detectar orçamento duplicado com existsByCategoryAndPeriod", async () => {
    // TODO: implemente o teste
  });

  it("existsByCategoryAndPeriod deve excluir ID especificado", async () => {
    // TODO: implemente o teste
  });
});
