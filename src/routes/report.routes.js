const { Router } = require("express");
const ReportController = require("../controllers/ReportController");
const auth = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = Router();

router.use(auth);

router.get("/summary", asyncHandler(ReportController.summary));
router.get("/cash-flow", asyncHandler(ReportController.cashFlow));
router.get("/export", asyncHandler(ReportController.export));

module.exports = router;
