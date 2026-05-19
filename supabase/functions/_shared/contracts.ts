import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

/**
 * Contract for the standard CRM Event webhook.
 * Used across multiple integration points (Bitrix24, HubSpot, etc.)
 */
export const CRMEventContract = z.object({
  event_id: z.string().uuid({ message: "event_id deve ser um UUID válido" }),
  timestamp: z.string().datetime({ message: "timestamp deve estar no formato ISO-8601" }),
  source: z.enum(["bitrix24", "salesforce", "hubspot", "custom"]),
  payload: z.record(z.unknown()).describe("Dados específicos do evento"),
  actor: z.object({
    id: z.string().optional(),
    email: z.string().email().optional(),
  }).optional(),
});

export type CRMEvent = z.infer<typeof CRMEventContract>;

/**
 * Contract for Lead scoring/enrichment updates.
 */
export const LeadUpdateContract = z.object({
  lead_id: z.string().min(1, "lead_id é obrigatório"),
  score: z.number().min(0).max(100).optional(),
  status: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Standard Contract for AI analysis requests.
 */
export const AIAnalysisContract = z.object({
  entity_id: z.string().min(1),
  entity_type: z.enum(["deal", "call", "lead", "salesperson"]),
  analysis_type: z.string(),
  options: z.object({
    temperature: z.number().min(0).max(1).optional(),
    model: z.string().optional(),
  }).optional(),
});
