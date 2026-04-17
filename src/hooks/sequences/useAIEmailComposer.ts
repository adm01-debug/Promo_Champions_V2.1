import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type {
  EmailGoal,
  EmailLanguage,
  EmailLength,
  EmailTone,
} from "@/components/sequences/emailComposerHelpers";

export interface ComposeEmailInput {
  contact_context?: {
    name?: string;
    company?: string;
    role?: string;
    industry?: string;
    last_interaction?: string;
  };
  goal: EmailGoal;
  tone: EmailTone;
  language: EmailLanguage;
  length: EmailLength;
  custom_instructions?: string;
}

export interface ComposeEmailResult {
  subject: string;
  body: string;
  variables_used: string[];
}

export function useGenerateEmail() {
  return useMutation({
    mutationFn: async (input: ComposeEmailInput): Promise<ComposeEmailResult> => {
      const { data, error } = await supabase.functions.invoke("ai-email-composer", {
        body: input,
      });
      if (error) {
        throw new Error(error.message ?? "Falha ao gerar e-mail.");
      }
      if (!data || data.error) {
        throw new Error(data?.error ?? "Resposta inválida da IA.");
      }
      return data as ComposeEmailResult;
    },
    onError: (err: Error) => {
      toast({
        title: "Erro ao gerar e-mail",
        description: err.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({ title: "E-mail gerado", description: "Conteúdo pronto para revisar." });
    },
  });
}
