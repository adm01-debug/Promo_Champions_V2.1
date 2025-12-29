import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

export async function fetchWithErrorHandling<T>(
  query: Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<T> {
  const { data, error } = await query;
  
  if (error) {
    console.error('[Supabase Error]', error);
    throw new Error(handleSupabaseError(error));
  }
  
  if (!data) {
    throw new Error('Nenhum dado retornado da consulta');
  }
  
  return data;
}

export function handleSupabaseError(error: PostgrestError): string {
  const errorMessages: Record<string, string> = {
    '23505': 'Este registro já existe no sistema',
    '23503': 'Referência inválida - verifique as dependências',
    '23502': 'Campo obrigatório está faltando',
    'PGRST116': 'Registro não encontrado',
    '42P01': 'Tabela não encontrada no banco',
    '42703': 'Coluna não existe nesta tabela',
    '22P02': 'Formato de dados inválido',
  };
  
  return errorMessages[error.code] || `Erro: ${error.message}`;
}

export async function upsertWithErrorHandling<T>(
  table: string,
  data: Partial<T> | Partial<T>[],
  options?: { onConflict?: string }
): Promise<T | T[]> {
  const isArray = Array.isArray(data);
  
  let query = supabase
    .from(table)
    .upsert(data as any, { 
      onConflict: options?.onConflict || 'id'
    });
  
  if (!isArray) {
    query = query.single();
  }
  
  return fetchWithErrorHandling(query.select());
}

export async function deleteWithErrorHandling(
  table: string,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);
  
  if (error) {
    throw new Error(handleSupabaseError(error));
  }
}

export function isSupabaseError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}


/**
 * Batch insert com error handling
 */
export async function batchInsert<T>(
  table: string,
  data: Partial<T>[],
  batchSize: number = 100
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const inserted = await upsertWithErrorHandling<T>(table, batch);
    results.push(...(Array.isArray(inserted) ? inserted : [inserted]));
  }
  
  return results;
}

/**
 * Count com filtros
 */
export async function countWithFilters(
  table: string,
  filters?: Record<string, any>
): Promise<number> {
  let query = supabase
    .from(table)
    .select('*', { count: 'exact', head: true });
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }
  
  const { count, error } = await query;
  
  if (error) {
    throw new Error(handleSupabaseError(error));
  }
  
  return count || 0;
}

/**
 * Paginated query
 */
export async function paginatedQuery<T>(
  table: string,
  page: number,
  pageSize: number,
  filters?: Record<string, any>,
  orderBy?: { column: string; ascending?: boolean }
): Promise<{ data: T[]; total: number; totalPages: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  let query = supabase
    .from(table)
    .select('*', { count: 'exact' })
    .range(from, to);
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }
  
  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending !== false });
  }
  
  const { data, count, error } = await query;
  
  if (error) {
    throw new Error(handleSupabaseError(error));
  }
  
  return {
    data: (data || []) as T[],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
}
