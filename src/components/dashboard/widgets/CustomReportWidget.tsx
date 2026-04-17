import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, FileBarChart, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useCustomReport } from "@/hooks/reporting/useCustomReports";
import { useReportExecution } from "@/hooks/reporting/useReportExecution";
import { ReportPreview } from "@/components/reporting/ReportPreview";

interface Props {
  reportId?: string;
  height?: number;
}

export const CustomReportWidget = memo(({ reportId, height = 360 }: Props) => {
  const { data: report, isLoading: loadingReport, error: reportError } = useCustomReport(reportId);
  const { data: result, isLoading: loadingExec, error: execError } = useReportExecution(reportId);

  if (!reportId) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full py-10 text-center gap-2">
          <FileBarChart className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Selecione um relatório customizado</p>
          <Button asChild variant="outline" size="sm" className="mt-2">
            <Link to="/relatorios/builder">Abrir builder</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loadingReport) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2"><Skeleton className="h-5 w-40" /></CardHeader>
        <CardContent><Skeleton className="w-full" style={{ height }} /></CardContent>
      </Card>
    );
  }

  if (reportError || !report) {
    return (
      <Card className="h-full border-destructive/40">
        <CardContent className="flex items-center gap-2 py-8 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">Relatório não encontrado ou sem acesso</p>
        </CardContent>
      </Card>
    );
  }

  const cfg = report.config ?? {};
  const vizType = (cfg as { viz_type?: string }).viz_type ?? "table";
  const columns = (cfg as { columns?: string[] }).columns ?? [];

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-display flex items-center gap-2 truncate">
          <FileBarChart className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate">{report.name}</span>
        </CardTitle>
        <Button asChild variant="ghost" size="icon" className="h-7 w-7 shrink-0">
          <Link to={`/relatorios/builder?id=${report.id}`} title="Abrir no builder">
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0" style={{ maxHeight: height, overflow: "auto" }}>
        <ReportPreview
          result={result}
          isLoading={loadingExec}
          error={execError as Error | null}
          vizType={vizType}
          columns={columns}
        />
      </CardContent>
    </Card>
  );
});
CustomReportWidget.displayName = "CustomReportWidget";
