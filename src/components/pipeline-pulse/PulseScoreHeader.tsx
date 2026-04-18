import { FC } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { statusToToken, type PulsePayload } from "./pulseHelpers";
import { cn } from "@/lib/utils";

interface Props {
  pulseScore: number;
  status: PulsePayload["status"];
  generatedAt: string;
}

export const PulseScoreHeader: FC<Props> = ({ pulseScore, status, generatedAt }) => {
  const tokens = statusToToken(status);
  const dashOffset = 283 - (283 * pulseScore) / 100;

  return (
    <Card variant="gradient" className="overflow-hidden">
      <CardContent className="p-6 flex items-center gap-6">
        <div className="relative w-28 h-28 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="283"
              initial={{ strokeDashoffset: 283 }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className={tokens.color}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("font-display text-3xl font-bold", tokens.color)}>{pulseScore}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">pulse</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Activity className={cn("h-4 w-4", tokens.color)} />
            <h2 className="font-display text-xl font-semibold">Pulso do Pipeline</h2>
            <Badge variant="outline" className={cn(tokens.color, tokens.border)}>
              {tokens.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Score global de saúde combinando Deal Health, Forecast, Win Rate, Routing e Sentimento.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Atualizado {new Date(generatedAt).toLocaleTimeString("pt-BR")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
