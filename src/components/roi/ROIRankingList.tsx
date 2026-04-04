import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ROIEntry {
  id: string;
  name: string;
  role: string;
  totalRevenue: number;
  estimatedCost: number;
  wonDeals: number;
  activitiesCount: number;
  cac: number;
  ltv: number;
  paybackDays: number;
  roi: number;
  revenuePerActivity: number;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

const formatPercent = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;

interface ROIRankingListProps {
  roiData: ROIEntry[];
}

export const ROIRankingList = React.memo(function ROIRankingList({ roiData }: ROIRankingListProps) {
  if (roiData.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Sem dados de ROI</h3>
          <p className="text-sm text-muted-foreground mt-1">Cadastre vendedores e registre vendas para ver o ROI.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {roiData.map((sp, i) => (
        <motion.div key={sp.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                  i === 0 && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                  i === 1 && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                  i === 2 && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                  i > 2 && "bg-muted text-muted-foreground"
                )}>
                  {i + 1}º
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground truncate">{sp.name}</span>
                    <Badge variant="outline" className="text-[10px] shrink-0">{sp.role === "sdr" ? "SDR" : "Closer"}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>{formatCurrency(sp.totalRevenue)} receita</span>
                    <span>{sp.wonDeals} vendas</span>
                    <span>{sp.activitiesCount} atividades</span>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-6 shrink-0 text-sm">
                  <div className="text-center"><p className="text-muted-foreground text-xs">CAC</p><p className="font-semibold">{formatCurrency(sp.cac)}</p></div>
                  <div className="text-center"><p className="text-muted-foreground text-xs">LTV</p><p className="font-semibold">{formatCurrency(sp.ltv)}</p></div>
                  <div className="text-center"><p className="text-muted-foreground text-xs">Payback</p><p className="font-semibold">{sp.paybackDays}d</p></div>
                </div>
                <div className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-bold shrink-0",
                  sp.roi >= 100 && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                  sp.roi >= 0 && sp.roi < 100 && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                  sp.roi < 0 && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                )}>
                  {formatPercent(sp.roi)} ROI
                </div>
              </div>
              <div className="mt-3">
                <Progress value={Math.min(100, Math.max(0, (sp.totalRevenue / (sp.estimatedCost * 3)) * 100))} className="h-1.5" />
                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                  <span>Custo: {formatCurrency(sp.estimatedCost)}</span>
                  <span>Receita: {formatCurrency(sp.totalRevenue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
});
