const request = require("supertest");
const app = require("../../src/app");
const { AppDataSource } = require("../../src/config/database");

let token;
let categoryId;

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  await AppDataSource.synchronize(true);

  // Registrar e obter token
  // TODO: implemente o teste

  // token = authRes.body.access_token;

  // Criar categoria de despesa
  // TODO: implemente o teste

  // categoryId = catRes.body.id;
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe("Budgets E2E", () => {
  let budgetId;

  describe("POST /v1/budgets", () => {
    it("deve criar orçamento (201)", async () => {
      // TODO: implemente o teste
      // budgetId = res.body.id;
    });

    it("deve retornar 409 para orçamento duplicado", async () => {
      // TODO: implemente o teste
    });
  });

  describe("GET /v1/budgets", () => {
    it("deve listar orçamentos com campos calculados (200)", async () => {
      // TODO: implemente o teste
    });
  });

  describe("PATCH /v1/budgets/:id", () => {
    it("deve atualizar orçamento (200)", async () => {
      // TODO: implemente o teste
    });
  });

  describe("DELETE /v1/budgets/:id", () => {
    it("deve remover orçamento (204)", async () => {
      // TODO: implemente o teste
    });
  });
});
