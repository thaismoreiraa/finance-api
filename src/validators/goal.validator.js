const { z } = require('zod');

const createGoalSchema = z.object({
  name: z.string().min(1).max(100),
  target_amount: z.number().positive(),
  account_id: z.string().uuid().nullable().optional(),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullable()
    .optional(),
  icon: z.string().max(50).nullable().optional(),
});

const updateGoalSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  target_amount: z.number().positive().optional(),
  account_id: z.string().uuid().nullable().optional(),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullable()
    .optional(),
  icon: z.string().max(50).nullable().optional(),
});

const depositSchema = z.object({
  amount: z.number().positive(),
});

module.exports = { createGoalSchema, updateGoalSchema, depositSchema };
