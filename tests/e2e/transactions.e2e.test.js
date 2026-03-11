const request = require("supertest");
const app = require("../../src/app");
const { AppDataSource } = require("../../src/config/database");

let token;
let accountId;
let categoryId;

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  await AppDataSource.synchronize(true);

  // Registrar e obter token
  // TODO: implemente o teste
  // token = authRes.body.access_token;

  // Criar conta
  // TODO: implemente o teste
  // accountId = accRes.body.id;

  // Criar categoria de despesa
  // TODO: implemente o teste
  // categoryId = catRes.body.id;
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe("Transactions E2E", () => {
  let transactionId;

  describe("POST /v1/transactions", () => {
    it("deve criar transação de despesa (201)", async () => {
      // TODO: implemente o teste
      // transactionId = res.body.id;
    });

    it("deve rejeitar type incompatível com categoria (422)", async () => {
      // TODO: implemente o teste
    });
  });

  describe("GET /v1/transactions", () => {
    it("deve listar transações com paginação (200)", async () => {
      // TODO: implemente o teste
    });

    it("deve filtrar por data (200)", async () => {
      // TODO: implemente o teste
    });
  });

  describe("GET /v1/transactions/:id", () => {
    it("deve retornar transação por ID (200)", async () => {
      // TODO: implemente o teste
    });
  });

  describe("PATCH /v1/transactions/:id", () => {
    it("deve atualizar transação (200)", async () => {
      // TODO: implemente o teste
    });
  });

  describe("DELETE /v1/transactions/:id", () => {
    it("deve remover transação (204)", async () => {
      // TODO: implemente o teste
    });
  });
});
