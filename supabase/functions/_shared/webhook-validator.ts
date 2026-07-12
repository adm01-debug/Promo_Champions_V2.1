import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export interface WebhookValidationError {
  field: string;
  message: string;
}

export interface WebhookValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: WebhookValidationError[];
  statusCode: number;
  contract_version: string;
}

/**
 * Standardizes 422 Unprocessable Entity responses across the system.
 */
export function createValidationErrorResponse(
  error: string,
  details: WebhookValidationError[],
  contractVersion: string,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      error,
      code: "VALIDATION_ERROR",
      details,
      contract_version: contractVersion,
      timestamp: new Date().toISOString()
    }),
    { 
      status: 422, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

/**
 * Robust validator for incoming webhooks supporting contract versioning.
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
      const details = result.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      
      const errorMsg = details.map(d => `${d.field}: ${d.message}`).join(", ");
      console.error(`[Webhook Validation Failed][v${contractVersion}] ${errorMsg}`);
      
      return {
        success: false,
        error: `Validation failed for contract v${contractVersion}`,
        details,
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
 * Versioned Webhook Contracts (v1/v2)
 */
export const WebhookContracts = {
  v1: {
    crmEvent: z.object({
      event_id: z.string().uuid({ message: "O ID do evento deve ser um UUID válido" }),
      timestamp: z.string().datetime(),
      source: z.enum(["bitrix24", "salesforce", "hubspot", "custom"]),
      payload: z.record(z.unknown()),
    }),
    leadUpdate: z.object({
      lead_id: z.string().min(1, { message: "ID do lead é obrigatório" }),
      status: z.string().min(1, { message: "Status é obrigatório" }),
    }),
  },
  
  v2: {
    crmEvent: z.object({
      event_id: z.string().uuid({ message: "O ID do evento deve ser um UUID válido" }),
      timestamp: z.string().datetime({ message: "Timestamp deve ser ISO 8601" }),
      source: z.enum(["bitrix24", "salesforce", "hubspot", "custom"]),
      payload: z.record(z.unknown()),
      schema_version: z.literal("2.0.0").default("2.0.0"),
      metadata: z.object({
        environment: z.enum(["prod", "staging", "dev"]).optional(),
        retry_count: z.number().int().nonnegative().optional(),
      }).optional(),
    }),
    leadUpdate: z.object({
      lead_id: z.string().uuid({ message: "Na v2, lead_id deve ser um UUID válido" }),
      status: z.string().min(1, { message: "Status é obrigatório" }),
      previous_status: z.string().optional(),
      changed_at: z.string().datetime(),
    }),
  },

  // Default/Legacy Schema mappings
  crmEvent: z.object({
    event_id: z.string().uuid({ message: "O ID do evento deve ser um UUID válido" }),
    timestamp: z.string().datetime({ message: "O timestamp deve estar no formato ISO 8601" }),
    source: z.enum(["bitrix24", "salesforce", "hubspot", "custom"], {
      errorMap: () => ({ message: "Fonte do evento inválida" })
    }),
    payload: z.record(z.any()),
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
    fromEmail: z.string().email({ message: "E-mail inválido" }).nullable(),
    messageId: z.string().nullable(),
    receivedAt: z.string().datetime({ message: "Data inválida" }).optional(),
  }),

  quoteSync: z.object({
    action: z.literal("create_or_update_quote", {
      errorMap: () => ({ message: "action deve ser 'create_or_update_quote'" }),
    }),
    quote: z.object({
      id: z.string().min(1, { message: "quote.id é obrigatório" }),
      quote_number: z.string().min(1, { message: "quote.quote_number é obrigatório" }),
      status: z.string().min(1, { message: "quote.status é obrigatório" }),
      subtotal: z.number().nonnegative().optional(),
      discount_percent: z.number().min(0).max(100).optional(),
      discount_amount: z.number().nonnegative().optional(),
      total: z.number().nonnegative({ message: "quote.total não pode ser negativo" }),
      client_id: z.string().optional().nullable(),
      client_name: z.string().min(1, { message: "quote.client_name é obrigatório" }),
      client_email: z.string().email({ message: "quote.client_email inválido" }).optional().nullable(),
      client_phone: z.string().optional().nullable(),
      seller_id: z.string().optional().nullable(),
      seller_name: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
      valid_until: z.string().optional().nullable(),
      items: z.array(
        z.object({
          product_id: z.string().optional(),
          product_name: z.string().min(1, { message: "item.product_name é obrigatório" }),
          product_sku: z.string().optional(),
          quantity: z.number().positive({ message: "item.quantity deve ser > 0" }),
          unit_price: z.number().nonnegative({ message: "item.unit_price não pode ser negativo" }),
          subtotal: z.number().nonnegative().optional(),
          color_name: z.string().optional(),
          personalizations: z.array(z.record(z.unknown())).optional(),
        }).passthrough()
      ).min(1, { message: "O orçamento deve conter pelo menos um item" }),
      created_at: z.string().optional(),
    }).refine(
      (q) => (q.client_email && q.client_email.length > 0) || (q.client_phone && q.client_phone.length > 0),
      { message: "É obrigatório fornecer client_email ou client_phone" }
    ),
    pdf_base64: z.string().optional(),
    timestamp: z.string().optional(),
  }),


  workflowExecution: z.object({
    workflow_id: z.string().uuid({ message: "ID do workflow deve ser um UUID válido" }),
    trigger_payload: z.record(z.unknown()).optional().default({}),
  }),

  leadScoring: z.object({
    dealIds: z.array(z.string()).min(1, { message: "Pelo menos um ID de negócio deve ser fornecido" }).max(500),
  }),

  aiCopilot: z.object({
    context: z.object({
      page: z.string().min(1, { message: "Campo 'context.page' é obrigatório" }),
      extra: z.string().optional(),
    }),
    salespersonId: z.string().optional(),
    action: z
      .enum([
        "page_suggestion",
        "smart_tip",
        "auto_fill",
        "quick_answer",
        "forecast_narrative",
        "coaching_plan",
      ])
      .optional(),
    question: z.string().optional(),
    // Skill-specific payloads
    forecast_id: z.string().uuid().optional(),
    recording_id: z.string().uuid().optional(),
  }),
};

export const EnterpriseWebhookSchemas = WebhookContracts;