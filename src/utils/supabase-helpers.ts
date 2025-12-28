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
