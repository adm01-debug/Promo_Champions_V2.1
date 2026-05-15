import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export interface WebhookValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

/**
 * Robust validator for incoming webhooks to prevent "silent breaks"
 * and handle malformed payloads gracefully.
 */
export function validateWebhookPayload<T extends z.ZodTypeAny>(
  schema: T,
  payload: unknown
): WebhookValidationResult<z.infer<T>> {
  try {
    if (!payload || typeof payload !== "object") {
      return {
        success: false,
        error: "Invalid payload: Must be a non-null object",
        statusCode: 400,
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
      };
    }

    return {
      success: true,
      data: result.data,
      statusCode: 200,
    };
  } catch (err) {
    console.error(`[Webhook Critical Error]`, err);
    return {
      success: false,
      error: "Internal validation error",
      statusCode: 500,
    };
  }
}

/**
 * Common schemas for enterprise webhooks
 */
export const EnterpriseWebhookSchemas = {
  crmEvent: z.object({
    event_id: z.string().uuid(),
    timestamp: z.string().datetime(),
    source: z.enum(["bitrix24", "salesforce", "hubspot", "custom"]),
    payload: z.record(z.unknown()),
    actor: z.object({
      id: z.string().optional(),
      email: z.string().email().optional(),
    }).optional(),
  }),
  
  leadUpdate: z.object({
    lead_id: z.string(),
    status: z.string(),
    metadata: z.record(z.unknown()).optional(),
  }),
};
