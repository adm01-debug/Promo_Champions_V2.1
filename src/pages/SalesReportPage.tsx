import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SalesReportHeader } from "@/components/reports/sales/SalesReportHeader";
import { SalesReportKpis } from "@/components/reports/sales/SalesReportKpis";
import { SalesRevenueChart } from "@/components/reports/sales/SalesRevenueChart";
import { SalesTopProductsChart } from "@/components/reports/sales/SalesTopProductsChart";
import { SalesStatusDonut } from "@/components/reports/sales/SalesStatusDonut";
import { SalesTeamRankingChart } from "@/components/reports/sales/SalesTeamRankingChart";
import { SalesTopDealsTable } from "@/components/reports/sales/SalesTopDealsTable";
import { useSalesReport } from "@/hooks/reports/useSalesReport";
import { generateSalesReportPdf } from "@/lib/reports/salesReportPdf";
import type { ReportPeriod } from "@/hooks/reports/salesReportHelpers";

export default function SalesReportPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<ReportPeriod>("weekly");
  const [refDate, setRefDate] = useState<Date>(new Date());
  const [exporting, setExporting] = useState(false);

  const { data, isLoading } = useSalesReport(period, refDate);

  const periodLabel =
    period === "weekly"
      ? `Semana de ${format(refDate, "dd 'de' MMMM yyyy", { locale: ptBR })}`
      : format(refDate, "MMMM 'de' yyyy", { locale: ptBR });

  const handleExport = async () => {
    if (!data) return;
    setExporting(true);
    try {
      await generateSalesReportPdf(data, periodLabel);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Relatório de Vendas | Promo Champions</title>
        <meta name="description" content="Relatório semanal e mensal de vendas com KPIs, gráficos e exportação em PDF." />
        <link rel="canonical" href="/relatorios/vendas" />
      </Helmet>

      <div className="container max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <SalesReportHeader
          period={period}
          refDate={refDate}
          onPeriodChange={setPeriod}
          onDateChange={setRefDate}
          onExport={handleExport}
          exporting={exporting}
        />

        {isLoading || !data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Skeleton className="h-72 rounded-xl" />
              <Skeleton className="h-72 rounded-xl" />
            </div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        ) : data.isEmpty ? (
          <Card className="p-10 text-center">
            <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h2 className="text-lg font-semibold mb-1">Sem vendas no período</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Não encontramos vendas em {periodLabel.toLowerCase()}.
            </p>
            <Button onClick={() => navigate("/vendas")}>Registrar venda</Button>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <SalesReportKpis data={data.current} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SalesRevenueChart data={data.revenueSeries} />
              <SalesTopProductsChart data={data.topProducts} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SalesStatusDonut data={data.statusBreakdown} />
              <SalesTeamRankingChart data={data.teamRanking} />
            </div>

            <SalesTopDealsTable data={data.topDeals} />
          </motion.div>
        )}
      </div>
    </>
  );
}
