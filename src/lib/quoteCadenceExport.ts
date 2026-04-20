import type { QuoteCadenceRow } from "@/hooks/cadences/useQuoteCadences";

export function quoteCadencesToCsvRows(rows: QuoteCadenceRow[]): Record<string, string | number>[] {
  return rows.map((r) => {
    const q = r.quote;
    return {
      Cliente: q?.client_name ?? "",
      "Nº Orçamento": q?.quote_number ?? "",
      Valor: q?.total_value ?? 0,
      Status: r.status,
      "Etapa Atual": r.current_step,
      "Próxima Ação": r.next_action_date ?? "",
      Vendedor: q?.seller_name ?? "",
      Cadência: r.cadence?.name ?? "",
      "Iniciado em": r.started_at ?? "",
    };
  });
}
