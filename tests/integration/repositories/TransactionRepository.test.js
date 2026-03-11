const { AppDataSource } = require("../../../src/config/database");

let UserRepo;
let AccountRepo;
let CategoryRepo;
let TransactionRepo;
let userId;
let accountId;
let categoryId;

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  await AppDataSource.synchronize(true);

  UserRepo = AppDataSource.getRepository("User");
  AccountRepo = AppDataSource.getRepository("Account");
  CategoryRepo = AppDataSource.getRepository("Category");
  TransactionRepo = require("../../../src/repositories/TransactionRepository");

  // Create a new user, account and category for testing
  // TODO: implemente o teste

  // userId = savedUser.id;

  // accountId = savedAccount.id;

  // categoryId = savedCategory.id;
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe("TransactionRepository", () => {
  afterEach(async () => {
    await AppDataSource.query("DELETE FROM transactions");
  });

  it("deve criar transação e buscar com paginação", async () => {
    // TODO: implemente o teste
  });

  it("deve filtrar transações por período", async () => {
    // TODO: implemente o teste
  });

  it("deve calcular soma por categoria e período", async () => {
    // TODO: implemente o teste
  });
});
