/**
 * Datas de negócio no fuso canônico da operação (America/Sao_Paulo).
 *
 * Substitui o antipadrão `new Date().toISOString().split('T')[0]` (ou
 * `.slice(0, 10)`), que devolve o dia em UTC e erra a data em qualquer
 * horário noturno no Brasil (21h–03h). Usar SEMPRE que a data alimentar
 * filtros, agregações, chaves de período ou campos de negócio (due_date,
 * period_start, month, scheduled_date etc.) — não para exibição já
 * formatada na UI.
 *
 * Puro TypeScript (Intl) — compartilhado entre edge functions e frontend.
 */

/** Fuso canônico do negócio. */
export const BUSINESS_TZ = "America/Sao_Paulo";

const DATE_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const MONTH_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TZ,
  year: "numeric",
  month: "2-digit",
});

const HOUR_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
});

function asDate(d: Date | string | number): Date {
  return d instanceof Date ? d : new Date(d);
}

/** "YYYY-MM-DD" no fuso de negócio. Aceita Date, ISO string ou epoch ms. */
export function toBusinessDate(d: Date | string | number = new Date()): string {
  return DATE_FMT.format(asDate(d));
}

/** Alias pedido pela auditoria: data de negócio para usecases/serviços. */
export const usecaseDate = toBusinessDate;

/** "YYYY-MM" no fuso de negócio. */
export function toBusinessMonth(d: Date | string | number = new Date()): string {
  return MONTH_FMT.format(asDate(d));
}

/** "YYYY-MM-01" — primeiro dia do mês de negócio (chave de metas/quotas). */
export function toBusinessMonthStart(d: Date | string | number = new Date()): string {
  return `${toBusinessMonth(d)}-01`;
}

/**
 * Instante (Date) da virada do mês corrente no fuso de negócio —
 * equivalente ao SQL `date_trunc('month', now() AT TIME ZONE 'America/Sao_Paulo')
 * AT TIME ZONE 'America/Sao_Paulo'`. Usar em filtros `.gte('updated_at', ...)`
 * sobre colunas timestamptz (`.setDate(1)` solto erra a fronteira em UTC).
 */
export function businessMonthStartInstant(d: Date | string | number = new Date()): Date {
  const ref = asDate(d);
  // Relógio de parede de America/Sao_Paulo via Intl: a diferença entre os
  // campos de parede (lidos como UTC) e o instante real é o offset vigente
  // (SP não adota DST desde 2019).
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TZ,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(ref);
  const f = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const wallAsUtcMs = Date.UTC(
    f("year"), f("month") - 1, f("day"), f("hour"), f("minute"), f("second")
  );
  const offsetMs = Math.round((ref.getTime() - wallAsUtcMs) / 1000) * 1000;
  return new Date(Date.UTC(f("year"), f("month") - 1, 1) + offsetMs);
}

/** Último dia do mês de negócio ("YYYY-MM-DD"). */
export function toBusinessMonthEnd(d: Date | string | number = new Date()): string {
  const [y, m] = toBusinessMonth(d).split("-").map(Number) as [number, number];
  // Dia 0 do mês seguinte = último dia do mês corrente.
  const last = new Date(Date.UTC(y, m, 0));
  return DATE_FMT.format(last);
}

/** "YYYY-MM-DDTHH" — bucket de hora no fuso de negócio (agregações por hora). */
export function toBusinessHourKey(d: Date | string | number = new Date()): string {
  // en-CA com hour 2-digit gera "MM/DD/YYYY, HH" em alguns runtimes — montar por partes.
  const parts = HOUR_FMT.formatToParts(asDate(d));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}`;
}
