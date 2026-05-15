import { useMemo } from "react";
import { subDays, parseISO, isWithinInterval, startOfDay, endOfDay, isAfter } from "date-fns";
import { CS360Response } from "./useCustomerSuccess360";

export function useFilteredCS360Data(data: CS360Response | null | undefined, period: string, startDate: string, endDate: string) {
  return useMemo(() => {
    if (!data) return null;
    const now = new Date();
    let start: Date;
    let end = now;

    if (period === "custom") {
      start = startDate ? parseISO(startDate) : subDays(now, 30);
      end = endDate ? parseISO(endDate) : now;
      if (isAfter(start, end)) [start, end] = [end, start];
    } else if (period === "0") {
      start = new Date(0);
    } else {
      start = subDays(now, parseInt(period));
    }

    const filterByDate = (item: { created_at?: string | null; renewal_date?: string | null; responded_at?: string | null }, dateField: string = "created_at") => {
      try {
        const dateStr = item[dateField as keyof typeof item];
        if (!dateStr) return true;
        const date = parseISO(dateStr);
        return isWithinInterval(date, { start: startOfDay(start), end: endOfDay(end) });
      } catch (e) {
        return true;
      }
    };

    return {
      tickets: data.tickets.filter(t => filterByDate(t)),
      expansion: data.expansion.filter(e => filterByDate(e)),
      surveys: data.surveys.filter(s => s.responded_at ? filterByDate(s, "responded_at") : false),
      renewals: data.renewals.filter(r => filterByDate(r, "renewal_date")),
      orders: data.orders.filter(o => filterByDate(o)),
      start,
      end
    };
  }, [data, period, startDate, endDate]);
}
