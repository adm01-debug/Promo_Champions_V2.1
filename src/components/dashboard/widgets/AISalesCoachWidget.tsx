import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Lightbulb, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function AISalesCoachWidget() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["ai-tactical-insights"],
    queryFn: async () => {
      // Simulation of AI insights while edge function triggers aren't fully live for this specific UI
      return [
        { 
          type: "tip", 
          title: "Lead Estagnado", 
          text: "O cliente 'Alpha Corp' não interage há 5 dias. Sugestão: Enviar follow-up tático via WhatsApp.",
          icon: <Lightbulb className="h-4 w-4 text-amber-500" />
        },
        { 
          type: "opportunity", 
          title: "Alta Probabilidade", 
          text: "O deal 'Beta Project' atingiu 85% de score após a última call. Priorize o fechamento hoje.",
          icon: <TrendingUp className="h-4 w-4 text-emerald-500" />
        }
      ];
    }
  });

  return (
    <Card className="h-full border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm">
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-black uppercase tracking-tighter italic flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-primary" />
          AI Sales Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-3">
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-10 bg-muted/50 rounded-lg" />
              <div className="h-10 bg-muted/50 rounded-lg" />
            </div>
          ) : (
            insights?.map((insight, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-background/50 border border-border/10 hover:border-primary/20 transition-all group">
                <div className="mt-0.5">{insight.icon}</div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-primary/80 mb-0.5">{insight.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{insight.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
