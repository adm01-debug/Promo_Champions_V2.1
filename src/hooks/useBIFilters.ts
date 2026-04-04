import { useState, useMemo } from "react";
import { 
  startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfQuarter, endOfQuarter, startOfYear, endOfYear,
  subDays, subWeeks, subMonths, subQuarters, subYears,
  format
} from "date-fns";
import { ptBR } from "date-fns/locale";

export type PeriodType = 
  | "today" 
  | "yesterday"
  | "last_week" 
  | "this_month"
  | "last_month" 
  | "last_quarter" 
  | "last_semester" 
  | "last_year"
  | "this_year"
  | "custom";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface BIFilterState {
  period: PeriodType;
  dateRange: DateRange;
  salespersonId?: string;
  clientId?: string;
  category?: string;
  source?: string;
  status?: string;
}

export interface PeriodOption {
  value: PeriodType;
  label: string;
  shortLabel: string;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
  { value: "today", label: "Hoje", shortLabel: "Hoje" },
  { value: "yesterday", label: "Ontem", shortLabel: "Ontem" },
  { value: "last_week", label: "Última Semana", shortLabel: "7d" },
  { value: "this_month", label: "Este Mês", shortLabel: "Mês" },
  { value: "last_month", label: "Mês Anterior", shortLabel: "Mês Ant." },
  { value: "last_quarter", label: "Último Trimestre", shortLabel: "3M" },
  { value: "last_semester", label: "Último Semestre", shortLabel: "6M" },
  { value: "this_year", label: "Este Ano", shortLabel: "Ano" },
  { value: "last_year", label: "Ano Anterior", shortLabel: "Ano Ant." },
  { value: "custom", label: "Personalizado", shortLabel: "Custom" },
];

function getDateRangeForPeriod(period: PeriodType, customRange?: DateRange): DateRange {
  const now = new Date();
  
  switch (period) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    
    case "yesterday": {
      const yesterday = subDays(now, 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    }
    
    case "last_week": {
      const weekStart = startOfWeek(subWeeks(now, 1), { locale: ptBR });
      const weekEnd = endOfWeek(subWeeks(now, 1), { locale: ptBR });
      return { start: weekStart, end: weekEnd };
    }
    
    case "this_month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    
    case "last_month": {
      const lastMonth = subMonths(now, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    }
    
    case "last_quarter": {
      const lastQuarter = subQuarters(now, 1);
      return { start: startOfQuarter(lastQuarter), end: endOfQuarter(lastQuarter) };
    }
    
    case "last_semester": {
      const sixMonthsAgo = subMonths(now, 6);
      return { start: startOfMonth(sixMonthsAgo), end: endOfMonth(subMonths(now, 1)) };
    }
    
    case "this_year":
      return { start: startOfYear(now), end: endOfYear(now) };
    
    case "last_year": {
      const lastYear = subYears(now, 1);
      return { start: startOfYear(lastYear), end: endOfYear(lastYear) };
    }
    
    case "custom":
      return customRange || { start: startOfMonth(now), end: endOfMonth(now) };
    
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) };
  }
}

export function getPreviousPeriodRange(dateRange: DateRange): DateRange {
  const durationMs = dateRange.end.getTime() - dateRange.start.getTime();
  return {
    start: new Date(dateRange.start.getTime() - durationMs),
    end: new Date(dateRange.end.getTime() - durationMs)
  };
}

export function getSamePeriodLastYear(dateRange: DateRange): DateRange {
  return {
    start: subYears(dateRange.start, 1),
    end: subYears(dateRange.end, 1)
  };
}

export function useBIFilters(defaultPeriod: PeriodType = "this_month") {
  const [period, setPeriod] = useState<PeriodType>(defaultPeriod);
  const [customRange, setCustomRange] = useState<DateRange | null>(null);
  const [salespersonId, setSalespersonId] = useState<string | undefined>();
  const [clientId, setClientId] = useState<string | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const [source, setSource] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();

  const dateRange = useMemo(() => {
    return getDateRangeForPeriod(period, customRange || undefined);
  }, [period, customRange]);

  const previousPeriodRange = useMemo(() => {
    return getPreviousPeriodRange(dateRange);
  }, [dateRange]);

  const samePeriodLastYear = useMemo(() => {
    return getSamePeriodLastYear(dateRange);
  }, [dateRange]);

  const periodLabel = useMemo(() => {
    if (period === "custom" && customRange) {
      return `${format(customRange.start, "dd/MM/yyyy")} - ${format(customRange.end, "dd/MM/yyyy")}`;
    }
    return PERIOD_OPTIONS.find(p => p.value === period)?.label || "";
  }, [period, customRange]);

  const filters: BIFilterState = useMemo(() => ({
    period,
    dateRange,
    salespersonId,
    clientId,
    category,
    source,
    status,
  }), [period, dateRange, salespersonId, clientId, category, source, status]);

  const resetFilters = () => {
    setPeriod(defaultPeriod);
    setCustomRange(null);
    setSalespersonId(undefined);
    setClientId(undefined);
    setCategory(undefined);
    setSource(undefined);
    setStatus(undefined);
  };

  const hasActiveFilters = useMemo(() => {
    return period !== defaultPeriod || 
           salespersonId !== undefined || 
           clientId !== undefined ||
           category !== undefined ||
           source !== undefined ||
           status !== undefined;
  }, [period, defaultPeriod, salespersonId, clientId, category, source, status]);

  return {
    // Current filter state
    filters,
    dateRange,
    previousPeriodRange,
    samePeriodLastYear,
    periodLabel,
    hasActiveFilters,

    // Setters
    setPeriod,
    setCustomRange,
    setSalespersonId,
    setClientId,
    setCategory,
    setSource,
    setStatus,
    resetFilters,

    // Individual values for controlled components
    period,
    customRange,
    salespersonId,
    clientId,
    category,
    source,
    status,
  };
}
