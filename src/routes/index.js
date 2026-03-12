const path = require('path');
const { Router } = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const accountRoutes = require('./account.routes');
const categoryRoutes = require('./category.routes');
const transactionRoutes = require('./transaction.routes');
const recurrenceRoutes = require('./recurrence.routes');
const budgetRoutes = require('./budget.routes');
const goalRoutes = require('./goal.routes');
const reportRoutes = require('./report.routes');

const swaggerDocument = YAML.load(path.join(__dirname, '..', 'docs', 'finance-api.yml'));

const router = Router();

router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/accounts', accountRoutes);
router.use('/categories', categoryRoutes);
router.use('/transactions', transactionRoutes);
router.use('/recurrences', recurrenceRoutes);
router.use('/budgets', budgetRoutes);
router.use('/goals', goalRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
