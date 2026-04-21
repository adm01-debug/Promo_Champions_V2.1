import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const DEFAULT_LAYOUT = [
  "kpi",
  "next-best",
  "trend",
  "matrix",
  "cycle",
  "loss-flow",
  "cohort",
  "win-by-hour",
  "salespeople",
  "competitors",
  "script-ab",
  "scenarios",
  "icp",
  "sentiment",
  "season",
  "at-risk",
  "insights",
] as const;

export type WidgetId = (typeof DEFAULT_LAYOUT)[number];

export function useUserDashboardLayout() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["winloss-user-layout"],
    queryFn: async (): Promise<WidgetId[]> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return [...DEFAULT_LAYOUT];
      const { data } = await (supabase as unknown as {
        from: (t: string) => {
          select: (c: string) => {
            eq: (c: string, v: string) => { maybeSingle: () => Promise<{ data: { layout: WidgetId[] } | null }> };
          };
        };
      })
        .from("user_winloss_preferences")
        .select("layout")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      const stored = data?.layout;
      if (!stored || !Array.isArray(stored) || stored.length === 0) return [...DEFAULT_LAYOUT];
      // ensure new widgets get appended
      const missing = DEFAULT_LAYOUT.filter(w => !stored.includes(w));
      return [...stored, ...missing];
    },
    staleTime: 5 * 60_000,
  });

  const save = useMutation({
    mutationFn: async (layout: WidgetId[]) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Não autenticado");
      const { error } = await (supabase as unknown as {
        from: (t: string) => {
          upsert: (p: Record<string, unknown>) => Promise<{ error: Error | null }>;
        };
      })
        .from("user_winloss_preferences")
        .upsert({ user_id: auth.user.id, layout, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["winloss-user-layout"] });
      toast.success("Layout salvo");
    },
    onError: () => toast.error("Não foi possível salvar o layout"),
  });

  return { layout: query.data ?? [...DEFAULT_LAYOUT], isLoading: query.isLoading, save: save.mutate, isSaving: save.isPending };
}
