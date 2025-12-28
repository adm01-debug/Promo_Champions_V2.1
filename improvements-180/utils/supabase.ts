import { PostgrestError } from '@supabase/supabase-js';
export function handleSupabaseError(error: PostgrestError): string {
  return error.message;
}
