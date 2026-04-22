import { FC } from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, FileDown, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import type { ReportPeriod } from "@/hooks/reports/salesReportHelpers";

interface Props {
  period: ReportPeriod;
  refDate: Date;
  onPeriodChange: (p: ReportPeriod) => void;
  onDateChange: (d: Date) => void;
  onExport: () => void;
  exporting: boolean;
}

export const SalesReportHeader: FC<Props> = ({
  period,
  refDate,
  onPeriodChange,
  onDateChange,
  onExport,
  exporting,
}) => {
  const navigate = useNavigate();
  const dateLabel =
    period === "weekly"
      ? `Semana de ${format(refDate, "dd 'de' MMM", { locale: ptBR })}`
      : format(refDate, "MMMM yyyy", { locale: ptBR });

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Voltar">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-page-title">Relatório de Vendas</h1>
            <p className="text-caption capitalize">{dateLabel}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            type="single"
            value={period}
            onValueChange={(v) => v && onPeriodChange(v as ReportPeriod)}
            className="border border-border rounded-md"
          >
            <ToggleGroupItem value="weekly" className="px-3 text-xs">
              Semanal
            </ToggleGroupItem>
            <ToggleGroupItem value="monthly" className="px-3 text-xs">
              Mensal
            </ToggleGroupItem>
          </ToggleGroup>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(refDate, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={refDate}
                onSelect={(d) => d && onDateChange(d)}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          <Button onClick={onExport} disabled={exporting} size="sm" className="gap-2">
            <FileDown className="h-4 w-4" />
            {exporting ? "Gerando..." : "Exportar PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
};
