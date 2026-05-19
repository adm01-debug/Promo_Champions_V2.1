import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export interface WebhookValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
  contract_version?: string;
}

/**
 * Robust validator for incoming webhooks to prevent "silent breaks"
 * and handle malformed payloads gracefully.
 */
export function validateWebhookPayload<T extends z.ZodTypeAny>(
  schema: T,
  payload: unknown,
  contractVersion = "1.0.0"
): WebhookValidationResult<z.infer<T>> {
  try {
    if (!payload || typeof payload !== "object") {
      return {
        success: false,
        error: "Invalid payload: Must be a non-null object",
        statusCode: 400,
        contract_version: contractVersion,
      };
    }

    const result = schema.safeParse(payload);

    if (!result.success) {
      const errorMsg = result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join(", ");
      
      console.error(`[Webhook Validation Failed] ${errorMsg}`);
      
      return {
        success: false,
        error: `Validation failed: ${errorMsg}`,
        statusCode: 422,
        contract_version: contractVersion,
      };
    }

    return {
      success: true,
      data: result.data,
      statusCode: 200,
      contract_version: contractVersion,
    };
  } catch (err) {
    console.error(`[Webhook Critical Error]`, err);
    return {
      success: false,
      error: "Internal validation error",
      statusCode: 500,
      contract_version: contractVersion,
    };
  }
}

/**
 * Common schemas for enterprise webhooks (Contracts)
 */
export const WebhookContracts = {
  crmEvent: z.object({
    event_id: z.string().uuid({ message: "O ID do evento deve ser um UUID válido" }),
    timestamp: z.string().datetime({ message: "O timestamp deve estar no formato ISO 8601" }),
    source: z.enum(["bitrix24", "salesforce", "hubspot", "custom"], {
      errorMap: () => ({ message: "Fonte do evento inválida" })
    }),
    payload: z.record(z.unknown(), { message: "Payload deve ser um objeto JSON" }),
    actor: z.object({
      id: z.string().optional(),
      email: z.string().email({ message: "E-mail do ator inválido" }).optional(),
    }).optional(),
  }),
  
  leadUpdate: z.object({
    lead_id: z.string().min(1, { message: "ID do lead é obrigatório" }),
    status: z.string().min(1, { message: "Status é obrigatório" }),
    metadata: z.record(z.unknown()).optional(),
  }),

  inboundEmail: z.object({
    provider: z.enum(["resend", "sendgrid", "generic"]),
    eventType: z.enum(["reply", "bounce", "complaint", "unsubscribe", "other"]),
    fromEmail: z.string().email().nullable(),
    messageId: z.string().nullable(),
    receivedAt: z.string().datetime().optional(),
  }),

  // Add more contracts here as needed
};

// Legacy alias for compatibility
export const EnterpriseWebhookSchemas = WebhookContracts;
