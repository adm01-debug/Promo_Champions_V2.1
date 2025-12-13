import { Calendar, CalendarDays, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PeriodFilter = "week" | "month" | "quarter";

interface PeriodFilterProps {
  value: PeriodFilter;
  onChange: (period: PeriodFilter) => void;
}

const periods: { value: PeriodFilter; label: string; icon: React.ReactNode }[] = [
  { value: "week", label: "Semana", icon: <Calendar className="h-4 w-4" /> },
  { value: "month", label: "Mês", icon: <CalendarDays className="h-4 w-4" /> },
  { value: "quarter", label: "Trimestre", icon: <CalendarRange className="h-4 w-4" /> },
];

export function PeriodFilterButtons({ value, onChange }: PeriodFilterProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
      {periods.map((period) => (
        <Button
          key={period.value}
          variant={value === period.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(period.value)}
          className={
            value === period.value
              ? "gap-2 gradient-primary border-0"
              : "gap-2 text-muted-foreground hover:text-foreground"
          }
        >
          {period.icon}
          <span className="hidden sm:inline">{period.label}</span>
        </Button>
      ))}
    </div>
  );
}
