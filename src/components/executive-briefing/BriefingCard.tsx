import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar } from "lucide-react";
import { formatBriefingDate, scoreTone, type ExecutiveBriefing } from "./briefingHelpers";

interface Props {
  briefing: ExecutiveBriefing;
}

export function BriefingCard({ briefing }: Props) {
  const tone = scoreTone(briefing.pulse_score);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className={`p-6 border ${tone.border} ${tone.bg} relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span className="capitalize">{formatBriefingDate(briefing.briefing_date)}</span>
            <Badge variant="outline" className="ml-auto gap-1">
              <Sparkles className="h-3 w-3" />
              {briefing.generated_by === "auto" ? "Automático" : "Manual"}
            </Badge>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-sora text-foreground leading-tight">
            {briefing.headline}
          </h2>
          <div className="flex items-center gap-4 pt-2">
            <div className={`text-5xl font-bold font-sora ${tone.color}`}>{briefing.pulse_score}</div>
            <div>
              <div className={`text-sm font-semibold ${tone.color}`}>Pulse Score</div>
              <Badge variant="outline" className={tone.color}>{tone.label}</Badge>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
