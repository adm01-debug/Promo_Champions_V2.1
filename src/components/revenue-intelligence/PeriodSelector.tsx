import { FC } from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  ForecastPeriodType,
} from "@/hooks/revenue-intelligence/useRevenueForecast";
import { shiftPeriod } from "./forecastHelpers";

interface Props {
  periodType: ForecastPeriodType;
  periodStart: string;
  onChangeType: (t: ForecastPeriodType) => void;
  onChangeStart: (s: string) => void;
}

export const PeriodSelector: FC<Props> = ({ periodType, periodStart, onChangeType, onChangeStart }) => {
  const fmt = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(
    new Date(periodStart + "T00:00:00Z"),
  );
  return (
    <div className="flex items-center gap-3">
      <ToggleGroup
        type="single"
        value={periodType}
        onValueChange={(v) => v && onChangeType(v as ForecastPeriodType)}
        size="sm"
      >
        <ToggleGroupItem value="week">Semana</ToggleGroupItem>
        <ToggleGroupItem value="month">Mês</ToggleGroupItem>
        <ToggleGroupItem value="quarter">Trimestre</ToggleGroupItem>
      </ToggleGroup>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onChangeStart(shiftPeriod(periodStart, periodType, -1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium capitalize px-2 min-w-[140px] text-center">{fmt}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onChangeStart(shiftPeriod(periodStart, periodType, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
