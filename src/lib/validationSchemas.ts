import { z } from 'zod';

export const dealSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  opportunity: z.coerce.number().positive('Valor deve ser positivo'),
  stageId: z.string().min(1, 'Selecione uma etapa'),
  contactId: z.string().optional(),
  assignedById: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  lastName: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  companyId: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  price: z.coerce.number().positive('Preço deve ser positivo'),
  currency: z.string().default('BRL'),
  description: z.string().optional(),
});

export type DealFormData = z.infer<typeof dealSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
