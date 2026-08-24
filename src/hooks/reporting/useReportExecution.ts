import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ReportConfig } from "./reportBuilderHelpers";

export interface ReportExecutionResult {
  ok: boolean;
  rows: Record<string, unknown>[];
  total: number | null;
  page: number;
  page_size: number;
  duration_ms: number;
  entity: string;
  viz_type: string;
  error?: string;
}

export function useReportExecution(
  reportId: string | undefined,
  overrideConfig?: ReportConfig,
  page = 1,
  pageSize = 100,
) {
  return useQuery({
    queryKey: ["report-execution", reportId, JSON.stringify(overrideConfig ?? {}), page, pageSize],
    queryFn: async (): Promise<ReportExecutionResult> => {
      if (!reportId) throw new Error("reportId obrigatório");
      const { data, error } = await supabase.functions.invoke("report-builder-execute", {
        body: {
          report_id: reportId,
          override_config: overrideConfig,
          page,
          page_size: pageSize,
        },
      });
      if (error) throw error;
      return data as ReportExecutionResult;
    },
    enabled: !!reportId,
    staleTime: 30 * 1000,
    retry: false,
  });
}
