import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type {
  ComposeGoal,
  ComposeTone,
  ComposeLanguage,
  ComposeLength,
  RecipientType,
} from "@/components/email/aiEmailHelpers";

export interface ComposeEmailInput {
  mode?: "single" | "sequence";
  recipient_id?: string;
  recipient_type?: RecipientType;
  contact_context?: {
    name?: string;
    company?: string;
    role?: string;
    industry?: string;
    last_interaction?: string;
  };
  goal: ComposeGoal;
  tone: ComposeTone;
  language: ComposeLanguage;
  length: ComposeLength;
  custom_instructions?: string;
}

export interface ComposeEmailResult {
  subject: string;
  body_text: string;
  body_html: string;
  suggested_send_time: string;
  follow_up_hint: string;
  variables_used: string[];
}

export function useComposeEmail() {
  return useMutation({
    mutationFn: async (input: ComposeEmailInput): Promise<ComposeEmailResult> => {
      const { data, error } = await supabase.functions.invoke("ai-email-composer", {
        body: { mode: "single", ...input },
      });
      if (error) throw new Error(error.message ?? "Falha ao gerar e-mail.");
      if (!data || data.error) throw new Error(data?.error ?? "Resposta inválida da IA.");
      return data as ComposeEmailResult;
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao gerar e-mail", description: err.message, variant: "destructive" });
    },
  });
}

export interface SendEmailInput {
  to: string;
  subject: string;
  body_html: string;
  body_text: string;
  recipient_name?: string;
  client_id?: string;
}

export function useSendComposedEmail() {
  return useMutation({
    mutationFn: async (input: SendEmailInput) => {
      const { data, error } = await supabase.functions.invoke("send-multichannel-message", {
        body: {
          channel: "email",
          to: input.to,
          recipient_name: input.recipient_name ?? input.to,
          subject: input.subject,
          message: input.body_text,
          html: input.body_html,
          metadata: { source: "ai-composer", client_id: input.client_id },
        },
      });
      if (error) throw new Error(error.message ?? "Falha ao enviar e-mail.");
      if (!data || data.error) throw new Error(data?.error ?? "Falha ao enviar.");
      return data;
    },
    onSuccess: () => {
      toast({ title: "E-mail enviado", description: "Mensagem disparada via canal email." });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao enviar", description: err.message, variant: "destructive" });
    },
  });
}
