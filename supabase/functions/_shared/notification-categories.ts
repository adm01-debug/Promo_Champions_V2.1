// Guard de categorias/prioridades para inserts em `public.notifications`.
//
// A tabela tem CHECK constraints em `category` e `priority`. Um valor inválido
// faz o batch inteiro falhar com `notifications_category_check` /
// `notifications_priority_check` e o job retorna 500 opaco.
//
// Este módulo:
//   1. Exporta o union type (compile-time safety).
//   2. `validateNotificationBatch(rows)` — throw-based (batch inteiro ou nada).
//   3. `partitionNotificationBatch(rows)` — split-based, permite degradação
//      graciosa: retorna { valid, invalid } sem lançar.
//
// Mantenha em sincronia com a CHECK da migration.

import { z } from "npm:zod@3";

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

// Schema focado nos campos com risco real de derrubar o batch:
// `user_id` (FK/NOT NULL), `type` (NOT NULL), `title` (NOT NULL) e as CHECKs.
// Demais colunas ficam livres — a tabela aplica defaults e nullability.
export const notificationRowSchema = z.object({
  user_id: z.string().uuid(),
  type: z.string().min(1).max(64),
  title: z.string().min(1).max(200),
  category: notificationCategorySchema.optional(),
  priority: notificationPrioritySchema.optional(),
  message: z.string().max(2000).nullish(),
  icon: z.string().max(64).nullish(),
  action_url: z.string().max(500).nullish(),
  action_label: z.string().max(100).nullish(),
  metadata: z.record(z.unknown()).nullish(),
  expires_at: z.string().nullish(),
}).passthrough();

export type NotificationRow = z.infer<typeof notificationRowSchema>;

function describe(idx: number, err: z.ZodError): string {
  return `row[${idx}]: ${err.issues
    .map((e) => `${e.path.join(".") || "<root>"}=${e.message}`)
    .join("; ")}`;
}

/**
 * Throw-based: aborta se qualquer linha for inválida. Use quando o job
 * inteiro deve falhar (ex.: cron-failure-alerter — nada é melhor que dado ruim).
 */
export function validateNotificationBatch(rows: unknown[]): NotificationRow[] {
  const validated: NotificationRow[] = [];
  const errors: string[] = [];
  for (let i = 0; i < rows.length; i++) {
    const parsed = notificationRowSchema.safeParse(rows[i]);
    if (!parsed.success) errors.push(describe(i, parsed.error));
    else validated.push(parsed.data);
  }
  if (errors.length > 0) {
    throw new Error(`Invalid notification rows:\n${errors.join("\n")}`);
  }
  return validated;
}

export interface PartitionResult {
  valid: NotificationRow[];
  invalid: Array<{ index: number; reason: string; row: unknown }>;
}

/**
 * Split-based: separa válidas de inválidas. Use quando o job deve continuar
 * mesmo se algumas linhas quebrarem (ex.: batch de renovações com uma conta
 * com owner órfão — inserir as demais e logar a inválida).
 */
export function partitionNotificationBatch(rows: unknown[]): PartitionResult {
  const valid: NotificationRow[] = [];
  const invalid: PartitionResult["invalid"] = [];
  for (let i = 0; i < rows.length; i++) {
    const parsed = notificationRowSchema.safeParse(rows[i]);
    if (parsed.success) valid.push(parsed.data);
    else invalid.push({ index: i, reason: describe(i, parsed.error), row: rows[i] });
  }
  return { valid, invalid };
}
