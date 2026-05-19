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
    fromEmail: z.string().email({ message: "E-mail inválido" }).nullable(),
    messageId: z.string().nullable(),
    receivedAt: z.string().datetime({ message: "Data inválida" }).optional(),
  }),

  quoteSync: z.object({
    action: z.string().min(1, { message: "Ação é obrigatória" }),
    quote: z.object({
      id: z.string().min(1, { message: "ID do orçamento é obrigatório" }),
      quote_number: z.string().min(1, { message: "Número do orçamento é obrigatório" }),
      status: z.string().min(1, { message: "Status é obrigatório" }),
      total: z.number().nonnegative({ message: "O total não pode ser negativo" }),
      items: z.array(z.any()).min(1, { message: "O orçamento deve conter pelo menos um item" }),
    }),
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
    action: z.enum(["page_suggestion", "smart_tip", "auto_fill", "quick_answer"]).optional(),
    question: z.string().optional(),
  }),
};

export const EnterpriseWebhookSchemas = WebhookContracts;