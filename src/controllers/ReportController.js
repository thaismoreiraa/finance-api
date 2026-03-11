const ReportService = require("../services/ReportService");

/**
 * Controller de relatórios.
 */
const ReportController = {
  /** GET /reports/summary */
  async summary(req, res) {
    const result = await ReportService.summary(req.user.id, req.query);
    res.json(result);
  },

  /** GET /reports/cash-flow */
  async cashFlow(req, res) {
    const { year, group_by } = req.query;
    if (!year) {
      return res
        .status(400)
        .json({
          code: "VALIDATION_ERROR",
          message: "O parâmetro year é obrigatório.",
        });
    }
    const result = await ReportService.cashFlow(
      req.user.id,
      Number(year),
      group_by,
    );
    res.json(result);
  },

  /** GET /reports/export */
  async export(req, res) {
    const { date_from, date_to, format, account_id } = req.query;
    if (!format) {
      return res
        .status(400)
        .json({
          code: "VALIDATION_ERROR",
          message: "O parâmetro format é obrigatório.",
        });
    }
    const result = await ReportService.export(req.user.id, {
      date_from,
      date_to,
      format,
      account_id,
    });
    res.setHeader("Content-Type", result.contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=transactions.${format}`,
    );
    res.send(result.data);
  },
};

module.exports = ReportController;
