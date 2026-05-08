import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Target, DollarSign, Sparkles } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useCoachingImpact } from "@/hooks/coaching/useCoachingImpact";
import { formatDelta, deltaToneClass, formatCurrency } from "./impactHelpers";
import { ImpactSessionCard } from "./ImpactSessionCard";
import { SkillImpactHeatmap } from "./SkillImpactHeatmap";

function KpiCard({ icon: Icon, label, value, hint, tone }: {
  icon: typeof Target; label: string; value: string; hint?: string; tone?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-2xl font-display font-bold ${tone ?? "text-foreground"}`}>{value}</p>
      {hint ? <p className="text-xs text-muted-foreground mt-1">{hint}</p> : null}
    </Card>
  );
}

export function CoachingImpactTracker() {
  const { data, isLoading } = useCoachingImpact();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!data || data.summary.total_sessions === 0) {
    return (
      <Card className="p-8 text-center">
        <Sparkles className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="font-display text-lg">Nenhuma sessão concluída ainda</p>
        <p className="text-sm text-muted-foreground mt-1">
          Conclua sessões 1:1 para começar a medir impacto antes/depois.
        </p>
      </Card>
    );
  }

  const { summary, top_sessions, skill_impact, timeline } = data;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <KpiCard icon={Target} label="Sessões medidas" value={summary.total_sessions.toString()} hint="janela 30d antes/depois" />
        <KpiCard
          icon={TrendingUp}
          label="Δ Score médio"
          value={formatDelta(summary.avg_delta_overall)}
          tone={deltaToneClass(summary.avg_delta_overall)}
        />
        <KpiCard
          icon={Target}
          label="Δ Conversão"
          value={formatDelta(summary.avg_delta_conversion)}
          tone={deltaToneClass(summary.avg_delta_conversion)}
        />
        <KpiCard
          icon={DollarSign}
          label="ROI estimado"
          value={formatCurrency(summary.roi_estimate)}
          hint="aproximação por uplift"
          tone={summary.roi_estimate > 0 ? "text-success" : undefined}
        />
      </motion.div>

      {timeline.length > 1 ? (
        <Card className="p-4">
          <h3 className="font-display text-sm font-semibold mb-3">Evolução do Δ Score por mês</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  formatter={(v: any) => [`${v.toFixed(1)}%`, "Δ Score"]}
                />
                <Line type="monotone" dataKey="avg_delta" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : null}

      <SkillImpactHeatmap data={skill_impact} />

      <div>
        <h3 className="font-display text-sm font-semibold mb-3">Sessões mais impactantes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {top_sessions.map((row, i) => (
            <ImpactSessionCard key={row.session_id} row={row} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
