const { AppDataSource } = require('../../../src/config/database');
const { IsNull } = require('typeorm');

let UserRepo;
let AccountRepo;
let userId;

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  await AppDataSource.synchronize(true);

  UserRepo = AppDataSource.getRepository('User');
  AccountRepo = require('../../../src/repositories/AccountRepository');

  // Create a new user for testing
  // TODO: implemente o teste
  // userId = saved.id;
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe('AccountRepository', () => {
  afterEach(async () => {
    await AppDataSource.query('DELETE FROM accounts WHERE user_id = $1', [userId]);
  });

  it('deve criar conta e buscar por usuário', async () => {
    // TODO: implemente o teste
  });

  it('deve atualizar saldo atomicamente via updateBalance', async () => {
    // TODO: implemente o teste
  });

  it('findByIdAndUser deve retornar null para outro usuário', async () => {
    // TODO: implemente o teste
  });
});
