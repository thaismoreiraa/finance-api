const { Router } = require('express');
const AccountController = require('../controllers/AccountController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createAccountSchema, updateAccountSchema } = require('../validators/account.validator');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.use(auth);

router.get('/', asyncHandler(AccountController.list));
router.post('/', validate(createAccountSchema), asyncHandler(AccountController.create));
router.get('/:id', asyncHandler(AccountController.findById));
router.patch('/:id', validate(updateAccountSchema), asyncHandler(AccountController.update));
router.delete('/:id', asyncHandler(AccountController.remove));

module.exports = router;
