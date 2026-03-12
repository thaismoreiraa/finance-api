const request = require('supertest');
const app = require('../../src/app');
const { AppDataSource } = require('../../src/config/database');

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  await AppDataSource.synchronize(true);
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe('Auth E2E', () => {
  describe('POST /v1/auth/register', () => {
    it('deve registrar um novo usuário (201)', async () => {
      // TODO: implemente o teste
    });

    it('deve retornar 409 para email duplicado', async () => {
      // TODO: implemente o teste
    });

    it('deve retornar 422 para dados inválidos', async () => {
      // TODO: implemente o teste
    });
  });

  describe('POST /v1/auth/login', () => {
    it('deve autenticar com sucesso (200)', async () => {
      // TODO: implemente o teste
    });

    it('deve retornar 401 para senha incorreta', async () => {
      // TODO: implemente o teste
    });

    it('deve retornar 401 para email inexistente', async () => {
      // TODO: implemente o teste
    });
  });

  describe('POST /v1/auth/refresh', () => {
    it('deve renovar tokens com refresh_token válido (200)', async () => {
      // TODO: implemente o teste
    });

    it('deve retornar 401 para refresh_token inválido', async () => {
      // TODO: implemente o teste
    });
  });
});
