const { z } = require('zod');

const createBudgetSchema = z
  .object({
    category_id: z.string().uuid(),
    amount: z.number().positive(),
    period: z.enum(['monthly', 'yearly']).default('monthly'),
    year: z.number().int().min(2000).max(2100),
    month: z.number().int().min(1).max(12).optional(),
    alert_threshold: z.number().int().min(1).max(100).default(80),
  })
  .refine((data) => data.period !== 'monthly' || data.month !== undefined, {
    message: 'month é obrigatório quando period = monthly.',
    path: ['month'],
  });

const updateBudgetSchema = z.object({
  category_id: z.string().uuid().optional(),
  amount: z.number().positive().optional(),
  period: z.enum(['monthly', 'yearly']).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  month: z.number().int().min(1).max(12).nullable().optional(),
  alert_threshold: z.number().int().min(1).max(100).optional(),
});

module.exports = { createBudgetSchema, updateBudgetSchema };
