import { z } from 'zod';

// ===== Base Schemas =====

export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email('Email inválido');
export const phoneSchema = z.string().regex(/^\+?[\d\s-()]+$/, 'Telefone inválido').optional();
export const dateSchema = z.coerce.date();
export const positiveNumberSchema = z.number().positive('Valor deve ser positivo');
export const nonNegativeNumberSchema = z.number().nonnegative('Valor não pode ser negativo');
export const percentageSchema = z.number().min(0).max(100);

// ===== Client Schemas =====

export const clientSchema = z.object({
  id: uuidSchema.optional(),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: emailSchema.optional().nullable(),
  phone: phoneSchema.nullable(),
  company: z.string().max(100).optional().nullable(),
  total_value: nonNegativeNumberSchema.default(0),
  created_at: dateSchema.optional(),
  updated_at: dateSchema.optional(),
});

export const createClientSchema = clientSchema.omit({ id: true, created_at: true, updated_at: true });
export const updateClientSchema = clientSchema.partial().required({ id: true });

export type Client = z.infer<typeof clientSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;

// ===== Sale/Deal Schemas =====

export const saleStageSchema = z.enum([
  'lead',
  'qualificacao',
  'proposta',
  'negociacao',
  'fechado',
  'perdido',
]);

export const saleSchema = z.object({
  id: uuidSchema.optional(),
  client_id: uuidSchema.optional().nullable(),
  salesperson_id: uuidSchema.optional().nullable(),
  client_name: z.string().min(1, 'Nome do cliente é obrigatório'),
  value: positiveNumberSchema,
  stage: saleStageSchema.default('lead'),
  probability: percentageSchema.default(0),
  expected_close_date: dateSchema.optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  created_at: dateSchema.optional(),
  updated_at: dateSchema.optional(),
});

export const createSaleSchema = saleSchema.omit({ id: true, created_at: true, updated_at: true });
export const updateSaleSchema = saleSchema.partial().required({ id: true });

export type Sale = z.infer<typeof saleSchema>;
export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type UpdateSaleInput = z.infer<typeof updateSaleSchema>;
export type SaleStage = z.infer<typeof saleStageSchema>;

// ===== Activity Schemas =====

export const activityTypeSchema = z.enum([
  'call',
  'email',
  'meeting',
  'linkedin',
  'whatsapp',
]);

export const activityOutcomeSchema = z.enum([
  'connected',
  'scheduled',
  'qualified',
  'no_answer',
  'not_interested',
]);

export const activitySchema = z.object({
  id: uuidSchema.optional(),
  salesperson_id: uuidSchema.optional().nullable(),
  sale_id: uuidSchema.optional().nullable(),
  activity_type: activityTypeSchema,
  outcome: activityOutcomeSchema,
  contact_name: z.string().max(100).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  duration_minutes: nonNegativeNumberSchema.optional().nullable(),
  created_at: dateSchema.optional(),
});

export const createActivitySchema = activitySchema.omit({ id: true, created_at: true });

export type Activity = z.infer<typeof activitySchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type ActivityType = z.infer<typeof activityTypeSchema>;
export type ActivityOutcome = z.infer<typeof activityOutcomeSchema>;

// ===== Product Schemas =====

export const productStatusSchema = z.enum(['active', 'inactive', 'out_of_stock']);

export const productSchema = z.object({
  id: uuidSchema.optional(),
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  category: z.string().max(100).default('Geral'),
  price: nonNegativeNumberSchema,
  status: productStatusSchema.default('active'),
  rating: z.number().min(0).max(5).default(0),
  sales_count: nonNegativeNumberSchema.default(0),
  created_at: dateSchema.optional(),
  updated_at: dateSchema.optional(),
});

export const createProductSchema = productSchema.omit({ id: true, created_at: true, updated_at: true });

export type Product = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type ProductStatus = z.infer<typeof productStatusSchema>;

// ===== Salesperson Schemas =====

export const salespersonRoleSchema = z.enum(['admin', 'manager', 'sdr', 'closer', 'vendedor']);

export const salespersonSchema = z.object({
  id: uuidSchema.optional(),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: emailSchema,
  role: salespersonRoleSchema.default('vendedor'),
  team_id: uuidSchema.optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  phone: phoneSchema.nullable(),
  is_active: z.boolean().default(true),
  created_at: dateSchema.optional(),
  updated_at: dateSchema.optional(),
});

export type Salesperson = z.infer<typeof salespersonSchema>;
export type SalespersonRole = z.infer<typeof salespersonRoleSchema>;

// ===== Task Schemas =====

export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export const taskStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'cancelled']);

export const taskSchema = z.object({
  id: uuidSchema.optional(),
  title: z.string().min(1, 'Título é obrigatório').max(200),
  description: z.string().max(1000).optional().nullable(),
  priority: taskPrioritySchema.default('medium'),
  status: taskStatusSchema.default('pending'),
  due_date: dateSchema.optional().nullable(),
  salesperson_id: uuidSchema.optional().nullable(),
  sale_id: uuidSchema.optional().nullable(),
  created_at: dateSchema.optional(),
  completed_at: dateSchema.optional().nullable(),
});

export const createTaskSchema = taskSchema.omit({ id: true, created_at: true, completed_at: true });

export type Task = z.infer<typeof taskSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;

// ===== Validation Utilities =====

export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

export function validateSafe<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function getFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  return errors;
}
