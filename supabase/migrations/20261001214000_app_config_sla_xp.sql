-- Pacote de auditoria 2026-10: SLA de leads e níveis de XP configuráveis via banco.
--
-- Hoje esses parâmetros são literais espalhados pelo código:
--   * check-lead-sla            → critical_hours default 8 (edge function)
--   * LeadSLAMonitor.tsx        → SLA_HOURS = 24 (taxa de resposta/overdue)
--   * constants.ts (PIPELINE)   → SLA_HOURS_DEFAULT = 48
--   * add_salesperson_xp (RPC)  → nível = 1 + total_xp / 1000
--   * useSalespersonXP.ts       → LEVEL_THRESHOLDS / LEVEL_INFO / XP_REWARDS
--
-- Esta migration cria public.app_config (chave → valor JSONB) e seeda todas as
-- chaves com EXATAMENTE os valores hardcoded atuais — nenhum comportamento muda
-- até que alguém edite os valores no banco. Frontend e edge leem via
-- select; só admin/manager escreve.

CREATE TABLE IF NOT EXISTS public.app_config (
  key         text PRIMARY KEY,
  value       jsonb NOT NULL,
  description text,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.app_config IS
  'Configuração de aplicação org-wide (SLA de leads, níveis de XP, etc). Chave estável, valor JSONB.';

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'app_config'
      AND policyname = 'authenticated read app_config'
  ) THEN
    CREATE POLICY "authenticated read app_config"
      ON public.app_config FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'app_config'
      AND policyname = 'admin manager write app_config'
  ) THEN
    CREATE POLICY "admin manager write app_config"
      ON public.app_config FOR ALL TO authenticated
      USING (public.is_admin_or_manager(auth.uid()))
      WITH CHECK (public.is_admin_or_manager(auth.uid()));
  END IF;
END;
$$;

INSERT INTO public.app_config (key, value, description) VALUES
  ('sla.lead_critical_hours', '8',  'Horas sem atividade para lead ser tratado como crítico (check-lead-sla)'),
  ('sla.lead_response_hours', '24', 'SLA de primeira resposta do lead em horas (LeadSLAMonitor)'),
  ('sla.hours_default',       '48', 'SLA padrão de deals do pipeline em horas (constants.ts)'),
  ('xp.level_base',           '1000','XP por nível na RPC add_salesperson_xp (divisor linear)'),
  ('xp.rewards', '{"SALE_PER_1000":10,"DAILY_GOAL":25,"STREAK_3_DAYS":50,"STREAK_5_DAYS":100,"STREAK_7_DAYS":200,"STREAK_10_DAYS":500,"STREAK_15_DAYS":1000,"NEW_RECORD":250}',
   'Recompensas de XP por evento (useSalespersonXP.XP_REWARDS)'),
  ('xp.level_thresholds', '[0,100,250,500,850,1300,1900,2700,3700,5000,6500,8500,11000,14000,18000,23000,30000,40000,55000,75000]',
   'XP mínimo por nível (useSalespersonXP.LEVEL_THRESHOLDS, 20 níveis)'),
  ('xp.level_info', '{"1":{"title":"Iniciante","color":"from-gray-400 to-gray-500","emoji":"🌱"},"2":{"title":"Aprendiz","color":"from-gray-500 to-gray-600","emoji":"📚"},"3":{"title":"Promissor","color":"from-green-400 to-green-500","emoji":"⭐"},"4":{"title":"Competente","color":"from-green-500 to-green-600","emoji":"💪"},"5":{"title":"Habilidoso","color":"from-blue-400 to-blue-500","emoji":"🎯"},"6":{"title":"Experiente","color":"from-blue-500 to-blue-600","emoji":"🔥"},"7":{"title":"Avançado","color":"from-purple-400 to-purple-500","emoji":"⚡"},"8":{"title":"Expert","color":"from-purple-500 to-purple-600","emoji":"🏅"},"9":{"title":"Mestre","color":"from-amber-400 to-amber-500","emoji":"👑"},"10":{"title":"Grão-Mestre","color":"from-amber-500 to-amber-600","emoji":"🎖️"},"11":{"title":"Campeão","color":"from-orange-400 to-orange-500","emoji":"🏆"},"12":{"title":"Lendário","color":"from-orange-500 to-red-500","emoji":"🌟"},"13":{"title":"Épico","color":"from-red-400 to-red-500","emoji":"💎"},"14":{"title":"Mítico","color":"from-red-500 to-pink-500","emoji":"🔮"},"15":{"title":"Imortal","color":"from-pink-400 to-purple-500","emoji":"⚔️"},"16":{"title":"Divino","color":"from-purple-500 to-indigo-500","emoji":"👼"},"17":{"title":"Celestial","color":"from-indigo-400 to-blue-500","emoji":"✨"},"18":{"title":"Supremo","color":"from-blue-500 to-cyan-500","emoji":"🌈"},"19":{"title":"Transcendente","color":"from-cyan-400 to-teal-500","emoji":"🚀"},"20":{"title":"O Vendedor","color":"from-yellow-400 to-amber-500","emoji":"👑"}}',
   'Título/cor/emoji por nível (useSalespersonXP.LEVEL_INFO)')
ON CONFLICT (key) DO NOTHING;

-- Helper interno: lê app_config com fallback (usado pela RPC de XP).
CREATE OR REPLACE FUNCTION public.get_app_config_number(p_key text, p_default numeric)
RETURNS numeric
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT CASE jsonb_typeof(value)
       WHEN 'number' THEN (value)::numeric
       ELSE NULLIF(value #>> '{}', '')::numeric
     END
     FROM public.app_config WHERE key = p_key),
    p_default
  );
$$;

REVOKE ALL ON FUNCTION public.get_app_config_number(text, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_app_config_number(text, numeric) TO authenticated, service_role;

-- add_salesperson_xp vive no schema private (moved em 20260619145322); recria
-- com o divisor vindo de app_config. Uma cópia pública pode ainda existir no
-- catálogo vivo — tratada logo abaixo apenas se existir.
CREATE OR REPLACE FUNCTION private.add_salesperson_xp(
  p_salesperson_id uuid,
  p_xp_amount integer,
  p_source text DEFAULT 'system'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_caller_sp_id uuid;
  v_level_base numeric;
BEGIN
  v_caller_sp_id := get_current_salesperson_id();

  -- Only the salesperson themselves or admin/manager can add XP
  IF v_caller_sp_id != p_salesperson_id AND NOT is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Validate positive increment
  IF p_xp_amount <= 0 OR p_xp_amount > 10000 THEN
    RAISE EXCEPTION 'Invalid XP amount (must be 1-10000)';
  END IF;

  v_level_base := public.get_app_config_number('xp.level_base', 1000);

  UPDATE public.salesperson_xp SET
    total_xp = total_xp + p_xp_amount,
    current_level = GREATEST(current_level, 1 + floor((total_xp + p_xp_amount) / v_level_base)::int),
    updated_at = now()
  WHERE salesperson_id = p_salesperson_id;

  RETURN FOUND;
END;
$$;

-- Cópia pública legada (se existir no catálogo vivo) recebe o mesmo corpo.
DO $$
BEGIN
  IF to_regprocedure('public.add_salesperson_xp(uuid,integer,text)') IS NOT NULL THEN
    EXECUTE $f$
      CREATE OR REPLACE FUNCTION public.add_salesperson_xp(
        p_salesperson_id uuid,
        p_xp_amount integer,
        p_source text DEFAULT 'system'
      )
      RETURNS boolean
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path TO 'public'
      AS $body$
      DECLARE
        v_caller_sp_id uuid;
        v_level_base numeric;
      BEGIN
        v_caller_sp_id := get_current_salesperson_id();

        IF v_caller_sp_id != p_salesperson_id AND NOT is_admin_or_manager(auth.uid()) THEN
          RAISE EXCEPTION 'Not authorized';
        END IF;

        IF p_xp_amount <= 0 OR p_xp_amount > 10000 THEN
          RAISE EXCEPTION 'Invalid XP amount (must be 1-10000)';
        END IF;

        v_level_base := public.get_app_config_number('xp.level_base', 1000);

        UPDATE public.salesperson_xp SET
          total_xp = total_xp + p_xp_amount,
          current_level = GREATEST(current_level, 1 + floor((total_xp + p_xp_amount) / v_level_base)::int),
          updated_at = now()
        WHERE salesperson_id = p_salesperson_id;

        RETURN FOUND;
      END;
      $body$;
    $f$;
    EXECUTE 'REVOKE ALL ON FUNCTION public.add_salesperson_xp(uuid, integer, text) FROM PUBLIC, anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.add_salesperson_xp(uuid, integer, text) TO authenticated, service_role';
  END IF;
END;
$$;
