/**
 * Datas de negócio (America/Sao_Paulo) para o frontend.
 *
 * Re-exporta o contrato compartilhado `supabase/functions/_shared/business-date.ts`
 * — a mesma implementação roda nas edge functions. Use `toBusinessDate` /
 * `usecaseDate` em vez de `toISOString().split('T')[0]` em filtros,
 * agregações e campos de negócio.
 */

export {
  BUSINESS_TZ,
  toBusinessDate,
  usecaseDate,
  toBusinessMonth,
  toBusinessMonthStart,
  toBusinessMonthEnd,
  toBusinessHourKey,
} from '../../supabase/functions/_shared/business-date';
