import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Registro da lista de supressão (descadastro) de e-mails. */
export interface EmailOptOut {
  id: string;
  email: string;
  reason: string | null;
  source: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface EmailOptOutFilters {
  /** Busca parcial por endereço (case-insensitive). */
  search: string;
  /** Origem do descadastro ou "all". */
  source: string;
  /** Página 0-based. */
  page: number;
  pageSize: number;
}

export interface EmailOptOutsResult {
  rows: EmailOptOut[];
  total: number;
}

/** Escapa caracteres especiais do PostgREST `ilike` para evitar wildcards indesejados. */
function sanitizeSearch(term: string): string {
  return term.trim().replace(/[%,_]/g, (m) => `\\${m}`);
}

export function useEmailOptOuts(filters: EmailOptOutFilters) {
  const { search, source, page, pageSize } = filters;

  return useQuery<EmailOptOutsResult>({
    queryKey: ["email-opt-outs", search, source, page, pageSize],
    staleTime: 30_000,
    queryFn: async () => {
      let query = supabase
        .from("email_opt_outs")
        .select("id, email, reason, source, created_at, metadata", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * pageSize, page * pageSize + pageSize - 1);

      const term = sanitizeSearch(search);
      if (term) query = query.ilike("email", `%${term}%`);
      if (source !== "all") query = query.eq("source", source);

      const { data, error, count } = await query;
      if (error) throw new Error(error.message);

      return {
        rows: (data ?? []) as EmailOptOut[],
        total: count ?? 0,
      };
    },
  });
}

/** Adiciona (admin) um endereço à lista de supressão. */
export function useAddEmailOptOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { email: string; reason?: string }) => {
      const email = input.email.trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("E-mail inválido");
      }
      const { error } = await supabase.from("email_opt_outs").insert({
        email,
        reason: input.reason?.trim() || null,
        source: "manual_admin",
      });
      if (error) {
        throw new Error(
          /duplicate key/i.test(error.message)
            ? "Este e-mail já está na lista de supressão."
            : error.message,
        );
      }
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["email-opt-outs"] }),
  });
}

/** Remove um endereço da lista (reativa o envio). */
export function useRemoveEmailOptOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("email_opt_outs").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["email-opt-outs"] }),
  });
}
