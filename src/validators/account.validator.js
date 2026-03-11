const { z } = require("zod");

const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["checking", "savings", "credit", "investment", "cash"]),
  initial_balance: z.number().min(0).optional().default(0),
  currency: z.string().length(3).default("BRL"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullable()
    .optional(),
  icon: z.string().max(50).nullable().optional(),
  allow_negative: z.boolean().default(false),
});

const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z
    .enum(["checking", "savings", "credit", "investment", "cash"])
    .optional(),
  currency: z.string().length(3).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullable()
    .optional(),
  icon: z.string().max(50).nullable().optional(),
  allow_negative: z.boolean().optional(),
});

module.exports = { createAccountSchema, updateAccountSchema };
