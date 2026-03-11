const { Router } = require("express");
const CategoryController = require("../controllers/CategoryController");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  createCategorySchema,
  updateCategorySchema,
} = require("../validators/category.validator");
const asyncHandler = require("../utils/asyncHandler");

const router = Router();

router.use(auth);

router.get("/", asyncHandler(CategoryController.list));
router.post(
  "/",
  validate(createCategorySchema),
  asyncHandler(CategoryController.create),
);
router.get("/:id", asyncHandler(CategoryController.findById));
router.patch(
  "/:id",
  validate(updateCategorySchema),
  asyncHandler(CategoryController.update),
);
router.delete("/:id", asyncHandler(CategoryController.remove));

module.exports = router;
