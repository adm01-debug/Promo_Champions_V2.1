import { format } from 'date-fns';

/**
 * Returns the date as a YYYY-MM-DD string in the user's local timezone.
 * Prefer this over `new Date().toISOString().split('T')[0]`, which returns UTC
 * and shows the wrong day at night for users west of UTC (e.g. America/Sao_Paulo).
 */
export function getLocalISODate(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}
