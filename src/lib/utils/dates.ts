import { format, formatDistanceToNow, parseISO, isValid, differenceInDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Format date in Brazilian format
 */
export function formatDate(date: Date | string, formatStr = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '-';
  return format(d, formatStr, { locale: ptBR });
}

/**
 * Format datetime
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
}

/**
 * Format time only
 */
export function formatTime(date: Date | string): string {
  return formatDate(date, 'HH:mm');
}

/**
 * Relative time (e.g., "há 2 dias")
 */
export function formatRelative(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '-';
  return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
}

/**
 * Days since date
 */
export function daysSince(date: Date | string): number {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return differenceInDays(new Date(), d);
}

/**
 * Days until date
 */
export function daysUntil(date: Date | string): number {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return differenceInDays(d, new Date());
}

/**
 * Is date in past
 */
export function isInPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return d < new Date();
}

/**
 * Is date today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  return format(d, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
}

/**
 * Get date ranges
 */
export const dateRanges = {
  today: () => ({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  }),
  yesterday: () => ({
    start: startOfDay(subDays(new Date(), 1)),
    end: endOfDay(subDays(new Date(), 1)),
  }),
  thisWeek: () => ({
    start: startOfWeek(new Date(), { locale: ptBR }),
    end: endOfWeek(new Date(), { locale: ptBR }),
  }),
  lastWeek: () => ({
    start: startOfWeek(subWeeks(new Date(), 1), { locale: ptBR }),
    end: endOfWeek(subWeeks(new Date(), 1), { locale: ptBR }),
  }),
  thisMonth: () => ({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  }),
  lastMonth: () => ({
    start: startOfMonth(subMonths(new Date(), 1)),
    end: endOfMonth(subMonths(new Date(), 1)),
  }),
  last7Days: () => ({
    start: startOfDay(subDays(new Date(), 6)),
    end: endOfDay(new Date()),
  }),
  last30Days: () => ({
    start: startOfDay(subDays(new Date(), 29)),
    end: endOfDay(new Date()),
  }),
  last90Days: () => ({
    start: startOfDay(subDays(new Date(), 89)),
    end: endOfDay(new Date()),
  }),
};

/**
 * Format duration in minutes to human readable
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}
