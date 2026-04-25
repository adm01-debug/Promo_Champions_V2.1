import type { Database } from "@/integrations/supabase/types";

/**
 * Names of tables in the public schema (typed from the generated Database type).
 */
export type PublicTable = keyof Database["public"]["Tables"];

/**
 * Row type for a given public table — what `select()` returns.
 */
export type TableRow<T extends PublicTable> = Database["public"]["Tables"][T]["Row"];

/**
 * Insert payload type for a given public table.
 */
export type TableInsert<T extends PublicTable> = Database["public"]["Tables"][T]["Insert"];

/**
 * Update payload type for a given public table — already a Partial in the
 * generated types. Use this in mutations instead of `Record<string, unknown>`.
 */
export type TableUpdate<T extends PublicTable> = Database["public"]["Tables"][T]["Update"];

/**
 * Identity helper that constrains an object literal to a valid update payload
 * for the given table. Replaces unsafe `as never` / `as Record<string, unknown>`
 * casts and keeps autocomplete + excess-property checking.
 *
 * @example
 * const patch = updatePayload("teams", { name, sdr_id, is_active });
 * await supabase.from("teams").update(patch).eq("id", id);
 */
export function updatePayload<T extends PublicTable>(
  _table: T,
  payload: TableUpdate<T>,
): TableUpdate<T> {
  return payload;
}

/**
 * Same idea for inserts.
 */
export function insertPayload<T extends PublicTable>(
  _table: T,
  payload: TableInsert<T>,
): TableInsert<T> {
  return payload;
}
