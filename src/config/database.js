const { DataSource } = require('typeorm');
const { env } = require('./env');
const path = require('path');

const isTest = env.NODE_ENV === 'test';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: isTest ? 5433 : env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASS,
  database: isTest ? env.DB_TEST_NAME : env.DB_NAME,
  synchronize: false,
  logging: env.NODE_ENV === 'development',
  entities: [path.join(__dirname, '..', 'entities', '*.js')],
  migrations: [path.join(__dirname, '..', 'migrations', '*.js')],
});

module.exports = { AppDataSource };
