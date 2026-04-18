import { FC, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { severityToken, moduleLabel, type PulseAlert } from "./pulseHelpers";
import { cn } from "@/lib/utils";

interface Props {
  alerts: PulseAlert[];
}

const FILTERS: Array<{ id: PulseAlert["module"] | "all"; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "health", label: "Saúde" },
  { id: "winloss", label: "Win/Loss" },
  { id: "forecast", label: "Forecast" },
  { id: "routing", label: "Roteamento" },
  { id: "conversation", label: "Conversas" },
];

export const CriticalAlertsFeed: FC<Props> = ({ alerts }) => {
  const [filter, setFilter] = useState<PulseAlert["module"] | "all">("all");
  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.module === filter);

  return (
    <Card variant="elevated" className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-status-warning" />
          Alertas Críticos
        </CardTitle>
        <div className="flex flex-wrap gap-1 mt-2">
          {FILTERS.map((f) => (
            <Button
              key={f.id}
              size="sm"
              variant={filter === f.id ? "default" : "outline"}
              onClick={() => setFilter(f.id)}
              className="h-7 text-xs"
            >
              {f.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[520px] overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum alerta neste filtro 🎉</p>
        ) : (
          <AnimatePresence>
            {filtered.map((alert, i) => {
              const tokens = severityToken(alert.severity);
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn("rounded-lg border p-3", tokens.bg, "border-border/40")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={cn(tokens.color, "text-[10px]")}>
                          {tokens.label}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {moduleLabel(alert.module)}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                      <p className="text-xs text-foreground/80 mt-2">→ {alert.suggested_action}</p>
                    </div>
                    <Button size="icon-sm" variant="ghost">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
};
