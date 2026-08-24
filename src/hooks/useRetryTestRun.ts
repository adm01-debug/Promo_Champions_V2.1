import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RetryTestResult {
  name: string;
  status: "passed" | "failed" | "ignored";
  duration_ms: number;
  error?: string;
}

export interface RetryTestRunReport {
  file: string;
  ran_at: string;
  total_duration_ms: number;
  total: number;
  passed: number;
  failed: number;
  ignored: number;
  tests: RetryTestResult[];
}

export function useRetryTestRun() {
  return useMutation<RetryTestRunReport, Error, void>({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke<RetryTestRunReport>(
        "run-retry-tests",
        { body: {} },
      );
      if (error) throw new Error(error.message);
      if (!data) throw new Error("Resposta vazia da função run-retry-tests");
      return data;
    },
  });
}
