const { z } = require("zod");

const createTransactionSchema = z
  .object({
    account_id: z.string().uuid(),
    category_id: z.string().uuid().nullable().optional(),
    type: z.enum(["income", "expense", "transfer"]),
    amount: z.number().positive(),
    description: z.string().max(255).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    status: z
      .enum(["scheduled", "pending", "confirmed", "cancelled"])
      .optional(),
    notes: z.string().optional(),
    destination_account_id: z.string().uuid().optional(),
  })
  .refine((data) => data.type !== "transfer" || data.destination_account_id, {
    message: "destination_account_id é obrigatório para transferências.",
    path: ["destination_account_id"],
  });

const updateTransactionSchema = z.object({
  account_id: z.string().uuid().optional(),
  category_id: z.string().uuid().nullable().optional(),
  type: z.enum(["income", "expense", "transfer"]).optional(),
  amount: z.number().positive().optional(),
  description: z.string().max(255).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  status: z.enum(["scheduled", "pending", "confirmed", "cancelled"]).optional(),
  notes: z.string().optional(),
});

const importConfirmSchema = z.object({
  transaction_ids: z.array(z.string().uuid()).min(1),
});

module.exports = {
  createTransactionSchema,
  updateTransactionSchema,
  importConfirmSchema,
};
