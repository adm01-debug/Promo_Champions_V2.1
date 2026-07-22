// Guard de categorias/prioridades para inserts em `public.notifications`.
//
// A tabela tem `CHECK (category = ANY (ARRAY[...]))` e
// `CHECK (priority = ANY (ARRAY[...]))`. Um valor inválido faz o batch inteiro
// falhar com `notifications_category_check` / `notifications_priority_check`
// e o edge function retorna 500 opaco.
//
// Este módulo centraliza o union type + validador Zod para que:
//   1. TypeScript pegue valores inválidos em compile-time.
//   2. Runtime valide payloads dinâmicos antes do insert.
//
// Mantenha em sincronia com a migration que define a constraint.

import { z } from "npm:zod@3.23.8";

export const NOTIFICATION_CATEGORIES = [
  "general",
  "sales",
  "goals",
  "gamification",
  "security",
  "system",
  "team",
  "ai",
  "approval",
] as const;

export type NotificationCategory = typeof NOTIFICATION_CATEGORIES[number];

export const NOTIFICATION_PRIORITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export type NotificationPriority = typeof NOTIFICATION_PRIORITIES[number];

export const notificationCategorySchema = z.enum(NOTIFICATION_CATEGORIES);
export const notificationPrioritySchema = z.enum(NOTIFICATION_PRIORITIES);

export const notificationRowSchema = z.object({
  user_id: z.string().uuid(),
  type: z.string().min(1).max(64),
  category: notificationCategorySchema,
  priority: notificationPrioritySchema,
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  icon: z.string().max(64).optional(),
  action_url: z.string().max(500).optional(),
  action_label: z.string().max(100).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type NotificationRow = z.infer<typeof notificationRowSchema>;

/**
 * Valida um lote de notificações. Retorna as linhas validadas ou lança
 * `Error` com a lista completa de índices+problemas para debug rápido.
 */
export function validateNotificationBatch(
  rows: unknown[],
): NotificationRow[] {
  const validated: NotificationRow[] = [];
  const errors: string[] = [];
  for (let i = 0; i < rows.length; i++) {
    const parsed = notificationRowSchema.safeParse(rows[i]);
    if (!parsed.success) {
      errors.push(`row[${i}]: ${parsed.error.issues.map((e) => `${e.path.join(".")}=${e.message}`).join("; ")}`);
    } else {
      validated.push(parsed.data);
    }
  }
  if (errors.length > 0) {
    throw new Error(`Invalid notification rows:\n${errors.join("\n")}`);
  }
  return validated;
}
