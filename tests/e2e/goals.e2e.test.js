const request = require("supertest");
const app = require("../../src/app");
const { AppDataSource } = require("../../src/config/database");

let token;
let accountId;

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
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe("Goals E2E", () => {
  let goalId;

  describe("POST /v1/goals", () => {
    it("deve criar meta (201)", async () => {
      // TODO: implemente o teste
      // goalId = res.body.id;
    });
  });

  describe("GET /v1/goals", () => {
    it("deve listar metas com campos calculados (200)", async () => {
      // TODO: implemente o teste
    });
  });

  describe("GET /v1/goals/:id", () => {
    it("deve retornar meta por ID (200)", async () => {
      // TODO: implemente o teste
    });
  });

  describe("POST /v1/goals/:id/deposit", () => {
    it("deve depositar na meta (200)", async () => {
      // TODO: implemente o teste
    });
  });

  describe("PATCH /v1/goals/:id", () => {
    it("deve atualizar meta (200)", async () => {
      // TODO: implemente o teste
    });
  });

  describe("DELETE /v1/goals/:id", () => {
    it("deve remover meta (204)", async () => {
      // TODO: implemente o teste
    });
  });
});
