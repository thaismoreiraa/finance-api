const { AppDataSource } = require('./config/database');
const { env } = require('./config/env');
const app = require('./app');

AppDataSource.initialize()
  .then(() => {
    console.log('Database connected successfully.');
    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });
