const { AppDataSource } = require('../../../src/config/database');

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

describe('UserRepository', () => {
  const UserRepository = AppDataSource.getRepository('User');

  afterEach(async () => {
    await AppDataSource.query('TRUNCATE TABLE users CASCADE');
  });

  it('deve criar e buscar usuário por email', async () => {
    // TODO: implemente o teste
  });

  it('deve rejeitar email duplicado', async () => {
    // TODO: implemente o teste
  });

  it('deve aplicar soft delete', async () => {
    // TODO: implemente o teste
  });
});
