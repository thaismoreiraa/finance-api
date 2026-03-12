const { z } = require('zod');

const createRecurrenceSchema = z.object({
  account_id: z.string().uuid(),
  category_id: z.string().uuid().nullable().optional(),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  description: z.string().max(255).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  auto_confirm: z.boolean().default(false),
});

const updateRecurrenceSchema = z.object({
  account_id: z.string().uuid().optional(),
  category_id: z.string().uuid().nullable().optional(),
  type: z.enum(['income', 'expense']).optional(),
  amount: z.number().positive().optional(),
  description: z.string().max(255).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  auto_confirm: z.boolean().optional(),
  update_scope: z.enum(['this_only', 'this_and_future', 'all']).default('this_and_future'),
});

module.exports = { createRecurrenceSchema, updateRecurrenceSchema };
