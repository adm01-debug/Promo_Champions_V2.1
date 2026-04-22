import { FC } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Receipt, Target } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import { formatBRL, type ReportKpiDelta } from "@/hooks/reports/salesReportHelpers";

interface Props {
  data: ReportKpiDelta;
}

interface KpiCardProps {
  label: string;
  value: string;
  delta: number;
  Icon: typeof DollarSign;
  index: number;
}

const KpiCard: FC<KpiCardProps> = ({ label, value, delta, Icon, index }) => {
  const positive = delta >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
    >
      <Card className="p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <Badge
              variant="outline"
              className={
                positive
                  ? "border-success/30 bg-success/10 text-success gap-1"
                  : "border-destructive/30 bg-destructive/10 text-destructive gap-1"
              }
            >
              {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {positive ? "+" : ""}
              {delta}%
            </Badge>
          </div>
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export const SalesReportKpis: FC<Props> = ({ data }) => {
  const revenue = useCountUp(data.revenue, { duration: 800 });
  const sales = useCountUp(data.salesCount, { duration: 800 });
  const ticket = useCountUp(data.avgTicket, { duration: 800 });
  const conv = useCountUp(data.conversionRate, { duration: 800, decimals: 1 });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Receita total" value={formatBRL(revenue)} delta={data.revenueDelta} Icon={DollarSign} index={0} />
      <KpiCard label="Nº de vendas" value={String(sales)} delta={data.salesCountDelta} Icon={ShoppingCart} index={1} />
      <KpiCard label="Ticket médio" value={formatBRL(ticket)} delta={data.avgTicketDelta} Icon={Receipt} index={2} />
      <KpiCard label="Taxa de conversão" value={`${conv.toFixed(1)}%`} delta={data.conversionRateDelta} Icon={Target} index={3} />
    </div>
  );
};
