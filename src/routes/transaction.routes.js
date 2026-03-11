const { Router } = require("express");
const multer = require("multer");
const TransactionController = require("../controllers/TransactionController");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  createTransactionSchema,
  updateTransactionSchema,
  importConfirmSchema,
} = require("../validators/transaction.validator");
const asyncHandler = require("../utils/asyncHandler");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();

router.use(auth);

router.get("/", asyncHandler(TransactionController.list));
router.post(
  "/",
  validate(createTransactionSchema),
  asyncHandler(TransactionController.create),
);
router.post(
  "/import",
  upload.single("file"),
  asyncHandler(TransactionController.import),
);
router.post(
  "/import/confirm",
  validate(importConfirmSchema),
  asyncHandler(TransactionController.importConfirm),
);
router.get("/:id", asyncHandler(TransactionController.findById));
router.patch(
  "/:id",
  validate(updateTransactionSchema),
  asyncHandler(TransactionController.update),
);
router.delete("/:id", asyncHandler(TransactionController.remove));

module.exports = router;
