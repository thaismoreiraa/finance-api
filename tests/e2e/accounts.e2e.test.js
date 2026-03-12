const request = require('supertest');
const app = require('../../src/app');
const { AppDataSource } = require('../../src/config/database');

let token;

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  await AppDataSource.synchronize(true);

  // Registrar e obter token
  // TODO: implemente o teste

  // token = res.body.access_token;
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe('Accounts E2E', () => {
  let accountId;

  describe('POST /v1/accounts', () => {
    it('deve criar conta (201)', async () => {
      // TODO: implemente o teste
      // accountId = res.body.id;
    });

    it('deve retornar 401 sem token', async () => {
      // TODO: implemente o teste
    });
  });

  describe('GET /v1/accounts', () => {
    it('deve listar contas do usuário (200)', async () => {
      // TODO: implemente o teste
    });
  });

  describe('GET /v1/accounts/:id', () => {
    it('deve retornar conta por ID (200)', async () => {
      // TODO: implemente o teste
    });

    it('deve retornar 404 para ID inexistente', async () => {
      // TODO: implemente o teste
    });
  });

  describe('PATCH /v1/accounts/:id', () => {
    it('deve atualizar conta (200)', async () => {
      // TODO: implemente o teste
    });
  });

  describe('DELETE /v1/accounts/:id', () => {
    it('deve remover conta sem transações (204)', async () => {
      // TODO: implemente o teste
    });
  });
});
