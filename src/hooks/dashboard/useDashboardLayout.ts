import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
  config?: Record<string, unknown>;
}

export const AVAILABLE_WIDGETS: { type: string; title: string; description: string; icon: string; defaultW: number; defaultH: number }[] = [
  { type: "revenue_kpi", title: "Receita do Mês", description: "KPI de receita atual vs meta", icon: "💰", defaultW: 1, defaultH: 1 },
  { type: "pipeline_funnel", title: "Funil de Pipeline", description: "Distribuição de deals por stage", icon: "📊", defaultW: 2, defaultH: 2 },
  { type: "activities_today", title: "Atividades Hoje", description: "Resumo de atividades do dia", icon: "📋", defaultW: 1, defaultH: 1 },
  { type: "top_deals", title: "Top Deals", description: "Maiores oportunidades ativas", icon: "⭐", defaultW: 2, defaultH: 2 },
  { type: "conversion_rate", title: "Taxa de Conversão", description: "Conversão por período", icon: "📈", defaultW: 1, defaultH: 1 },
  { type: "recent_activities", title: "Atividades Recentes", description: "Últimas atividades registradas", icon: "🕐", defaultW: 2, defaultH: 2 },
  { type: "goal_progress", title: "Progresso da Meta", description: "Barra de progresso da meta mensal", icon: "🎯", defaultW: 1, defaultH: 1 },
  { type: "team_ranking", title: "Ranking do Time", description: "Posição no ranking de vendas", icon: "🏆", defaultW: 1, defaultH: 2 },
  { type: "forecast_summary", title: "Forecast", description: "Previsão de receita ponderada", icon: "🔮", defaultW: 1, defaultH: 1 },
  { type: "calendar_preview", title: "Calendário", description: "Próximas atividades agendadas", icon: "📅", defaultW: 2, defaultH: 2 },
  { type: "custom_report", title: "Relatório Customizado", description: "Embute um relatório do Builder no dashboard", icon: "📑", defaultW: 2, defaultH: 2 },
  { type: "ai_sales_coach", title: "IA Sales Coach", description: "Insights e dicas táticas da IA em tempo real", icon: "🧠", defaultW: 2, defaultH: 1 },
];

const DEFAULT_LAYOUT: WidgetConfig[] = [
  { id: "w1", type: "revenue_kpi", title: "Receita do Mês", x: 0, y: 0, w: 1, h: 1, visible: true },
  { id: "w2", type: "activities_today", title: "Atividades Hoje", x: 1, y: 0, w: 1, h: 1, visible: true },
  { id: "w3", type: "conversion_rate", title: "Taxa de Conversão", x: 2, y: 0, w: 1, h: 1, visible: true },
  { id: "w4", type: "goal_progress", title: "Progresso da Meta", x: 3, y: 0, w: 1, h: 1, visible: true },
  { id: "w5", type: "pipeline_funnel", title: "Funil de Pipeline", x: 0, y: 1, w: 2, h: 2, visible: true },
  { id: "w6", type: "top_deals", title: "Top Deals", x: 2, y: 1, w: 2, h: 2, visible: true },
];

export function useDashboardLayout() {
  const { salesperson } = useAuth();

  return useQuery({
    queryKey: ["dashboard-layout", salesperson?.id],
    queryFn: async (): Promise<WidgetConfig[]> => {
      const { data, error } = await supabase
        .from("dashboard_layouts")
        .select("layout_config")
        .eq("salesperson_id", salesperson!.id)
        .maybeSingle();

      if (error) throw error;
      if (!data || !data.layout_config) return DEFAULT_LAYOUT;

      try {
        const config = data.layout_config as unknown;
        if (Array.isArray(config)) return config as WidgetConfig[];
        return DEFAULT_LAYOUT;
      } catch {
        return DEFAULT_LAYOUT;
      }
    },
    enabled: !!salesperson?.id,
  });
}

export function useSaveDashboardLayout() {
  const queryClient = useQueryClient();
  const { salesperson } = useAuth();

  return useMutation({
    mutationFn: async (layout: WidgetConfig[]) => {
      const { error } = await supabase
        .from("dashboard_layouts")
        .upsert({
          salesperson_id: salesperson!.id,
          layout_config: layout as unknown as Record<string, unknown>,
          updated_at: new Date().toISOString(),
        } as never, { onConflict: "salesperson_id" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-layout"] });
      toast.success("Layout salvo!");
    },
    onError: () => toast.error("Erro ao salvar layout"),
  });
}
