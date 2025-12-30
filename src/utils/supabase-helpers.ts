import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

// Magic numbers extraídos para constantes
const MAX_STRING_LENGTH = 1000;
const MAX_ARRAY_SIZE = 100;


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

export function isSupabaseError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

/**
 * Valida e sanitiza string input
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Input deve ser string');
  }

  // Remove caracteres perigosos
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < e >
    .substring(0, MAX_STRING_LENGTH); // Limita tamanho
}

/**
 * Valida parâmetros de filtro
 */
export function validateFilters(filters: Record<string, unknown>): void {
  const allowedKeys = ['userId', 'clientId', 'status', 'segment', 'dateRange', 'teamId', 'stageId'];

  Object.keys(filters).forEach(key => {
    if (!allowedKeys.includes(key)) {
      throw new Error(`Filtro inválido: ${key}`);
    }
  });
}

/**
 * Rate limiting checker (cliente-side awareness)
 */
export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const limit = MAX_ARRAY_SIZE; // requests por hora
  const window = 60 * 60 * MAX_STRING_LENGTH; // 1 hora

  const stored = localStorage.getItem(`rl_${key}`);

  if (!stored) {
    localStorage.setItem(`rl_${key}`, JSON.stringify({ count: 1, start: now }));
    return true;
  }

  const data = JSON.parse(stored);

  if (now - data.start > window) {
    // Reset window
    localStorage.setItem(`rl_${key}`, JSON.stringify({ count: 1, start: now }));
    return true;
  }

  if (data.count >= limit) {
    console.warn(`Rate limit atingido para ${key}`);
    return false;
  }

  data.count++;
  localStorage.setItem(`rl_${key}`, JSON.stringify(data));
  return true;
}
