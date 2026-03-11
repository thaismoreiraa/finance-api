const { z } = require("zod");

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["income", "expense"]),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullable()
    .optional(),
  icon: z.string().max(50).nullable().optional(),
  parent_id: z.string().uuid().nullable().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(["income", "expense"]).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullable()
    .optional(),
  icon: z.string().max(50).nullable().optional(),
  parent_id: z.string().uuid().nullable().optional(),
});

module.exports = { createCategorySchema, updateCategorySchema };
