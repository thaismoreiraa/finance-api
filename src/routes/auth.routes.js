const { Router } = require('express');
const AuthController = require('../controllers/AuthController');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const { registerSchema, loginSchema, refreshSchema } = require('../validators/auth.validator');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(AuthController.register));
router.post('/login', validate(loginSchema), asyncHandler(AuthController.login));
router.post('/refresh', validate(refreshSchema), asyncHandler(AuthController.refresh));
router.post('/logout', auth, asyncHandler(AuthController.logout));

module.exports = router;
