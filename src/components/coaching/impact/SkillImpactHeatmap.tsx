import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { formatDelta, heatmapShade } from "./impactHelpers";

interface Props {
  data: Array<{ skill: string; avg_delta: number; sessions: number }>;
}

export function SkillImpactHeatmap({ data }: Props) {
  if (!data.length) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        Sem dados de impacto por skill ainda.
      </Card>
    );
  }
  return (
    <Card className="p-4">
      <h3 className="font-display text-sm font-semibold mb-3">Impacto por skill</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {data.map((d, i) => (
          <motion.div
            key={d.skill}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            className="rounded-lg p-3 border border-border/50"
            style={{ background: heatmapShade(d.avg_delta) }}
          >
            <p className="text-xs font-medium text-foreground/90 truncate">{d.skill}</p>
            <p className="text-lg font-display font-bold mt-1">{formatDelta(d.avg_delta)}</p>
            <p className="text-[10px] text-muted-foreground">{d.sessions} sessões</p>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
