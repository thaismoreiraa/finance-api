const { Router } = require('express');
const BudgetController = require('../controllers/BudgetController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createBudgetSchema, updateBudgetSchema } = require('../validators/budget.validator');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.use(auth);

router.get('/', asyncHandler(BudgetController.list));
router.post('/', validate(createBudgetSchema), asyncHandler(BudgetController.create));
router.patch('/:id', validate(updateBudgetSchema), asyncHandler(BudgetController.update));
router.delete('/:id', asyncHandler(BudgetController.remove));

module.exports = router;
