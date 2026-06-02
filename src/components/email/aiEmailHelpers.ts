import { z } from "zod";
import type { ComposeEmailInput } from "@/hooks/email/useComposeEmail";

export type ComposeGoal = "intro" | "follow_up" | "meeting" | "reactivation" | "breakup" | "proposal" | "thanks";
export type ComposeTone = "formal" | "casual" | "consultivo" | "direto";
export type ComposeLanguage = "pt-BR" | "en";
export type ComposeLength = "short" | "medium" | "long";
export type RecipientType = "client" | "contact" | "manual";

export const GOAL_OPTIONS: { value: ComposeGoal; label: string }[] = [
  { value: "intro", label: "Apresentação (cold)" },
  { value: "follow_up", label: "Follow-up" },
  { value: "meeting", label: "Solicitar reunião" },
  { value: "proposal", label: "Envio de proposta" },
  { value: "reactivation", label: "Reativar lead frio" },
  { value: "thanks", label: "Agradecimento" },
  { value: "breakup", label: "Break-up (última tentativa)" },
];

export const TONE_OPTIONS: { value: ComposeTone; label: string }[] = [
  { value: "consultivo", label: "Consultivo" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "direto", label: "Direto" },
];

export const LANGUAGE_OPTIONS: { value: ComposeLanguage; label: string }[] = [
  { value: "pt-BR", label: "Português (BR)" },
  { value: "en", label: "English" },
];

export const LENGTH_OPTIONS: { value: ComposeLength; label: string }[] = [
  { value: "short", label: "Curto" },
  { value: "medium", label: "Médio" },
  { value: "long", label: "Longo" },
];

export const composeFormSchema = z.object({
  goal: z.enum(["intro", "follow_up", "meeting", "reactivation", "breakup", "proposal", "thanks"]),
  tone: z.enum(["formal", "casual", "consultivo", "direto"]),
  language: z.enum(["pt-BR", "en"]),
  length: z.enum(["short", "medium", "long"]),
  custom_instructions: z.string().max(500).optional(),
});

export type ComposeFormValues = z.infer<typeof composeFormSchema>;

export const DEFAULT_COMPOSE_VALUES: ComposeFormValues = {
  goal: "follow_up",
  tone: "consultivo",
  language: "pt-BR",
  length: "medium",
  custom_instructions: "",
};

/**
 * Validates and transforms form state into a complete ComposeEmailInput.
 * This ensures the object sent to the API matches exactly what is expected.
 */
export function mapFormToComposeInput(
  values: ComposeFormValues,
  context: {
    recipientId?: string;
    recipientType?: RecipientType;
    recipientName?: string;
    recipientCompany?: string;
  }
): ComposeEmailInput {
  // Defensive merge with defaults to ensure runtime safety even if schema is bypassed
  const merged = { ...DEFAULT_COMPOSE_VALUES, ...values };

  return {
    goal: merged.goal,
    tone: merged.tone,
    language: merged.language,
    length: merged.length,
    custom_instructions: merged.custom_instructions || undefined,
    recipient_id: context.recipientId,
    recipient_type: context.recipientType || "manual",
    contact_context:
      context.recipientType === "manual" && context.recipientName
        ? { name: context.recipientName, company: context.recipientCompany }
        : undefined,
  };
}
