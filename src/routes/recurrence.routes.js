const { Router } = require('express');
const RecurrenceController = require('../controllers/RecurrenceController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createRecurrenceSchema,
  updateRecurrenceSchema,
} = require('../validators/recurrence.validator');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.use(auth);

router.get('/', asyncHandler(RecurrenceController.list));
router.post('/', validate(createRecurrenceSchema), asyncHandler(RecurrenceController.create));
router.patch('/:id', validate(updateRecurrenceSchema), asyncHandler(RecurrenceController.update));
router.delete('/:id', asyncHandler(RecurrenceController.remove));

module.exports = router;
