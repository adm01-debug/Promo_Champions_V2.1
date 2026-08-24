import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatDelta, deltaToneClass } from "./impactHelpers";
import type { ImpactRow } from "@/hooks/coaching/useCoachingImpact";

interface Props {
  row: ImpactRow;
  index?: number;
}

function DeltaPill({ value, label }: { value: number; label: string }) {
  const Icon = value > 0.5 ? TrendingUp : value < -0.5 ? TrendingDown : Minus;
  return (
    <div className="flex items-center gap-1.5">
      <Icon className={`h-3.5 w-3.5 ${deltaToneClass(value)}`} />
      <div className="flex flex-col leading-tight">
        <span className={`text-sm font-semibold ${deltaToneClass(value)}`}>{formatDelta(value)}</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

export function ImpactSessionCard({ row, index = 0 }: Props) {
  const date = new Date(row.completed_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <Card className="p-4 hover:border-primary/40 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground">{date}</p>
            <p className="text-sm font-medium">Sessão concluída</p>
          </div>
          {row.outcome_rating ? (
            <Badge variant="secondary" className="text-xs">★ {row.outcome_rating}</Badge>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
          <DeltaPill value={Number(row.delta_overall)} label="Score" />
          <DeltaPill value={Number(row.delta_conversion)} label="Conv." />
          <DeltaPill value={Number(row.delta_ticket)} label="Ticket" />
        </div>

        {row.focus_skills?.length ? (
          <div className="flex flex-wrap gap-1 mt-3">
            {row.focus_skills.slice(0, 3).map((s) => (
              <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
            ))}
          </div>
        ) : null}
      </Card>
    </motion.div>
  );
}
