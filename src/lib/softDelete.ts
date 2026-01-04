import { supabase } from '@/integrations/supabase/client';

export async function softDelete(table: string, id: string) {
  const { error } = await supabase
    .from(table)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function restore(table: string, id: string) {
  const { error } = await supabase
    .from(table)
    .update({ deleted_at: null })
    .eq('id', id);

  if (error) throw error;
}

export async function permanentDelete(table: string, id: string) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export function addDeletedFilter(query: any) {
  return query.is('deleted_at', null);
}
