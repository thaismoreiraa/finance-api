const { Router } = require("express");
const UserController = require("../controllers/UserController");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { changePasswordSchema } = require("../validators/auth.validator");
const asyncHandler = require("../utils/asyncHandler");

const router = Router();

router.use(auth);

router.get("/me", asyncHandler(UserController.getProfile));
router.patch("/me", asyncHandler(UserController.update));
router.delete("/me", asyncHandler(UserController.remove));
router.patch(
  "/me/password",
  validate(changePasswordSchema),
  asyncHandler(UserController.changePassword),
);

module.exports = router;
