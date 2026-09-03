import { useQuery } from "@tanstack/react-query";
import type { EmbeddedReportPayload } from "@/components/reporting/embedHelpers";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/report-embed-public`;

export function useEmbeddedReportPreview(token: string | undefined) {
  return useQuery({
    queryKey: ["embedded-report", token],
    queryFn: async (): Promise<EmbeddedReportPayload> => {
      if (!token) throw new Error("Token ausente");
      // Transição: header (preferido — URLs vazam em logs/Referer) E query
      // (compat com a function ainda não redeployada; sem a query, a function
      // antiga rejeitaria o preflight do header novo e derrubaria todos os
      // embeds na janela front-antes-da-function). Remover a query quando o
      // deploy das functions estiver confirmado.
      const res = await fetch(`${FN_URL}?token=${encodeURIComponent(token)}`, {
        headers: { "X-Embed-Token": token },
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error ?? "Falha ao carregar relatório");
      }
      return json as EmbeddedReportPayload;
    },
    enabled: !!token,
    retry: 1,
    staleTime: 60_000,
  });
}
