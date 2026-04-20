import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Swords } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import type { CompetitorStat } from "@/hooks/win-loss/useWinLossAggregations";
import { fmtBRL, fmtPct } from "@/components/deal-intelligence/winloss/winLossHelpers";

interface Props { competitors: CompetitorStat[] }

export function CompetitorBattleCard({ competitors }: Props) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Swords className="h-4 w-4 text-primary" />
          Análise Competitiva
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!competitors.length ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Nenhum concorrente identificado no período.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {competitors.map((c, idx) => {
              const losingBadly = c.winRateVs < 30;
              return (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  className="rounded-lg border border-border/50 p-3 bg-card"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground">{c.encounters} confrontos</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        losingBadly
                          ? "border-rose-500/40 text-rose-700 bg-rose-500/10"
                          : "border-emerald-500/40 text-emerald-700 bg-emerald-500/10"
                      }
                    >
                      Win {fmtPct(c.winRateVs)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <p className="text-muted-foreground">Wins / Losses</p>
                      <p className="font-medium tabular-nums">{c.wins} / {c.losses}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ticket perdido méd.</p>
                      <p className="font-medium tabular-nums">{fmtBRL(c.avgLostAmount)}</p>
                    </div>
                  </div>
                  {c.topReason && c.topReason !== "—" && (
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Top motivo perda: <span className="text-foreground">{c.topReason}</span>
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
