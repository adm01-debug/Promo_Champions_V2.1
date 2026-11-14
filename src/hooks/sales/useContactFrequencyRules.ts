import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import type { ContactFrequencyConfig } from '@/types/sales';

/**
 * Regras de frequência de contato do vendedor logado, persistidas em
 * `salesperson_preferences.contact_rules` (jsonb, RLS por salesperson_id).
 * O mesmo campo é lido/escrito por `ContactRulesDialog` no formato
 * `{ quiet_hours: { start, end }, max_calls_per_day, prioritize_human }`;
 * aqui os campos extras são acrescentados sem apagar chaves desconhecidas.
 */

// Espelha o DEFAULT da coluna contact_rules (quiet 20:00-08:00, 3 ligações,
// prioriza humano). Os dois campos sem default no banco usam valores de formulário.
export const DEFAULT_CONTACT_FREQUENCY: ContactFrequencyConfig = {
  quiet_hours_start: '20:00',
  quiet_hours_end: '08:00',
  max_calls_per_day: 3,
  max_messages_per_day: 3,
  min_interval_minutes: 240,
  prioritize_human: true,
};

type JsonObject = { [key: string]: Json | undefined };

function asObject(value: Json | null | undefined): JsonObject | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function pickTime(value: Json | undefined, fallback: string): string {
  return typeof value === 'string' && TIME_RE.test(value) ? value : fallback;
}

function pickInt(value: Json | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.round(value)
    : fallback;
}

/** Converte o jsonb salvo no formato do formulário (null = nada salvo). */
export function parseContactRules(
  raw: Json | null | undefined
): ContactFrequencyConfig | null {
  const obj = asObject(raw);
  if (!obj) return null;
  const quiet = asObject(obj.quiet_hours ?? null);
  const d = DEFAULT_CONTACT_FREQUENCY;
  return {
    quiet_hours_start: pickTime(quiet?.start, d.quiet_hours_start),
    quiet_hours_end: pickTime(quiet?.end, d.quiet_hours_end),
    max_calls_per_day: pickInt(obj.max_calls_per_day, d.max_calls_per_day),
    max_messages_per_day: pickInt(obj.max_messages_per_day, d.max_messages_per_day),
    min_interval_minutes: pickInt(obj.min_interval_minutes, d.min_interval_minutes),
    prioritize_human:
      typeof obj.prioritize_human === 'boolean'
        ? obj.prioritize_human
        : d.prioritize_human,
  };
}

/** Mescla o formulário no jsonb existente, preservando chaves que não são deste formulário. */
export function serializeContactRules(
  config: ContactFrequencyConfig,
  existing: Json | null | undefined
): Json {
  const base = asObject(existing) ?? {};
  const quiet = asObject(base.quiet_hours ?? null) ?? {};
  return {
    ...base,
    quiet_hours: {
      ...quiet,
      start: config.quiet_hours_start,
      end: config.quiet_hours_end,
    },
    max_calls_per_day: config.max_calls_per_day,
    max_messages_per_day: config.max_messages_per_day,
    min_interval_minutes: config.min_interval_minutes,
    prioritize_human: config.prioritize_human,
  };
}

export const contactFrequencyRulesKey = (salespersonId: string | undefined) =>
  ['contact-frequency-rules', salespersonId] as const;

async function fetchRawRules(salespersonId: string): Promise<Json | null> {
  const { data, error } = await supabase
    .from('salesperson_preferences')
    .select('contact_rules')
    .eq('salesperson_id', salespersonId)
    .maybeSingle();
  if (error) throw error;
  return data?.contact_rules ?? null;
}

export function useContactFrequencyRules() {
  const { salesperson } = useAuth();
  const salespersonId = salesperson?.id;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: contactFrequencyRulesKey(salespersonId),
    queryFn: async () => parseContactRules(await fetchRawRules(salespersonId as string)),
    enabled: !!salespersonId,
  });

  const mutation = useMutation({
    mutationFn: async (config: ContactFrequencyConfig) => {
      if (!salespersonId) throw new Error('Perfil de vendedor não encontrado');
      // Relê o jsonb atual para não apagar chaves gravadas por outra tela.
      const existing = await fetchRawRules(salespersonId);
      const { error } = await supabase.from('salesperson_preferences').upsert(
        {
          salesperson_id: salespersonId,
          contact_rules: serializeContactRules(config, existing),
        },
        { onConflict: 'salesperson_id' }
      );
      if (error) throw error;
      return config;
    },
    onSuccess: config => {
      queryClient.setQueryData(contactFrequencyRulesKey(salespersonId), config);
    },
  });

  return {
    hasSalesperson: !!salespersonId,
    /** Regras salvas; null quando o vendedor ainda não salvou nenhuma. */
    savedRules: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    saveRules: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
}
