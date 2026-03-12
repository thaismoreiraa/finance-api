const { Router } = require('express');
const GoalController = require('../controllers/GoalController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createGoalSchema,
  updateGoalSchema,
  depositSchema,
} = require('../validators/goal.validator');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.use(auth);

router.get('/', asyncHandler(GoalController.list));
router.get('/:id', asyncHandler(GoalController.findById));
router.post('/', validate(createGoalSchema), asyncHandler(GoalController.create));
router.patch('/:id', validate(updateGoalSchema), asyncHandler(GoalController.update));
router.delete('/:id', asyncHandler(GoalController.remove));
router.post('/:id/deposit', validate(depositSchema), asyncHandler(GoalController.deposit));

module.exports = router;
