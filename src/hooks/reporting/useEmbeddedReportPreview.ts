import { useQuery } from "@tanstack/react-query";
import type { EmbeddedReportPayload } from "@/components/reporting/embedHelpers";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/report-embed-public`;

export function useEmbeddedReportPreview(token: string | undefined) {
  return useQuery({
    queryKey: ["embedded-report", token],
    queryFn: async (): Promise<EmbeddedReportPayload> => {
      if (!token) throw new Error("Token ausente");
      // Token via header, não via query string — URLs vazam em access logs,
      // Referer e histórico de proxy. A function mantém ?token= por compat.
      const res = await fetch(FN_URL, { headers: { "X-Embed-Token": token } });
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
