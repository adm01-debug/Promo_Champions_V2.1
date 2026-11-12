-- Soft delete de activities ignorado por funções SQL (achado db-funcoes-activities-deleted-at).
--
-- Causa: activities usa soft delete (deleted_at/deleted_by/delete_reason,
-- 20251228000001_add_soft_delete.sql), mas as funções abaixo liam a tabela
-- sem "deleted_at IS NULL". Atividade apagada pelo vendedor continuava
-- contando como contato real.
--
-- Efeito desta migration (só o filtro novo; o resto do corpo é idêntico):
--   1) calculate_deal_health: contagem e recência de atividades do deal
--      ignoram apagadas (antes, uma atividade apagada ontem rendia +15 de
--      "Atividade recente" e evitava o -20 de "sem atividades").
--   2) compute_pipeline_inspection: last_activity_at / flag
--      no_recent_activity ignoram apagadas (antes, deal sem contato real
--      não era sinalizado). Base = versão de 20261027120000 (status
--      canônico WON/LOST), para não desfazer aquela correção.
--   3) create_activities_from_action_items: a checagem de idempotência
--      ignora follow-ups apagados (antes, apagar o follow-up gerado
--      impedia recriá-lo: o RPC devolvia 0 e nada aparecia).
--   4) get_semantic_coverage: total de 'activity' ignora apagadas (antes a
--      cobertura semântica de atividades era subestimada). Base = versão
--      de 20261027210000 (alias si.* contra ambiguidade de entity_type).
--
-- Fora de escopo, de propósito:
--   - cleanup_deleted_records: precisa enxergar as apagadas (é o expurgo).
--   - archive_old_activities, calculate_deal_health_score,
--     calculate_deal_probability, update_lead_score: referenciam objetos
--     que não existem no banco (activities_archive, deals, activities.deal_id,
--     clients.lead_score) — falham em qualquer chamada e não têm chamador
--     no código; o filtro não mudaria comportamento algum.
--
-- Idempotente: só CREATE OR REPLACE com a mesma assinatura, mesmo
-- SECURITY DEFINER/STABLE e search_path fixo; owner e grants vigentes
-- (authenticated, service_role; sem PUBLIC/anon) são preservados pelo
-- CREATE OR REPLACE.

-- ════════════════════════════════════════════════════════════════════════
-- 1) calculate_deal_health
-- ════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.calculate_deal_health(_sale_id UUID)
RETURNS TABLE(
  health_score INTEGER,
  health_label TEXT,
  positive_factors JSONB,
  negative_factors JSONB
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _sale RECORD;
  _last_activity TIMESTAMPTZ;
  _activity_count INTEGER;
  _days_in_stage INTEGER;
  _interaction_count INTEGER;
  _score INTEGER := 50;
  _pos JSONB := '[]'::jsonb;
  _neg JSONB := '[]'::jsonb;
  _label TEXT;
BEGIN
  SELECT * INTO _sale FROM public.sales WHERE id = _sale_id;
  IF _sale.id IS NULL THEN RETURN; END IF;

  SELECT MAX(created_at), COUNT(*) INTO _last_activity, _activity_count
  FROM public.activities WHERE sale_id = _sale_id AND deleted_at IS NULL;

  SELECT COUNT(*) INTO _interaction_count
  FROM public.channel_interactions WHERE deal_id = _sale_id AND created_at > now() - interval '14 days';

  _days_in_stage := EXTRACT(DAY FROM (now() - _sale.updated_at))::INT;

  -- Recência de atividades
  IF _last_activity IS NOT NULL AND _last_activity > now() - interval '3 days' THEN
    _score := _score + 15;
    _pos := _pos || jsonb_build_object('factor','recent_activity','impact',15,'label','Atividade recente nos últimos 3 dias');
  ELSIF _last_activity IS NULL OR _last_activity < now() - interval '14 days' THEN
    _score := _score - 20;
    _neg := _neg || jsonb_build_object('factor','no_recent_activity','impact',-20,'label','Sem atividades há mais de 14 dias');
  END IF;

  -- Volume de atividades
  IF _activity_count >= 5 THEN
    _score := _score + 10;
    _pos := _pos || jsonb_build_object('factor','high_activity','impact',10,'label',_activity_count || ' atividades registradas');
  END IF;

  -- Engajamento via canais
  IF _interaction_count >= 3 THEN
    _score := _score + 15;
    _pos := _pos || jsonb_build_object('factor','engaged','impact',15,'label',_interaction_count || ' interações nos últimos 14 dias');
  ELSIF _interaction_count = 0 THEN
    _score := _score - 15;
    _neg := _neg || jsonb_build_object('factor','no_engagement','impact',-15,'label','Nenhuma interação multicanal recente');
  END IF;

  -- Tempo no estágio
  IF _days_in_stage > 30 THEN
    _score := _score - 25;
    _neg := _neg || jsonb_build_object('factor','stagnation','impact',-25,'label',_days_in_stage || ' dias parado no mesmo estágio');
  ELSIF _days_in_stage <= 7 THEN
    _score := _score + 10;
    _pos := _pos || jsonb_build_object('factor','fast_progress','impact',10,'label','Avanço rápido no funil');
  END IF;

  -- Estágio avançado
  IF _sale.stage IN ('proposal','negotiation') THEN
    _score := _score + 5;
    _pos := _pos || jsonb_build_object('factor','advanced_stage','impact',5,'label','Deal em estágio avançado');
  END IF;

  -- Clamp 0-100
  _score := GREATEST(0, LEAST(100, _score));

  _label := CASE
    WHEN _score >= 80 THEN 'excellent'
    WHEN _score >= 60 THEN 'healthy'
    WHEN _score >= 40 THEN 'at_risk'
    ELSE 'critical'
  END;

  RETURN QUERY SELECT _score, _label, _pos, _neg;
END;
$$;

-- ════════════════════════════════════════════════════════════════════════
-- 2) compute_pipeline_inspection
-- ════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.compute_pipeline_inspection()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _r RECORD;
  _flags jsonb;
  _last_act timestamptz;
  _days_act integer;
  _days_stage integer;
  _count integer := 0;
BEGIN
  IF NOT is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  FOR _r IN
    SELECT id, status, updated_at, salesperson_id
    FROM public.sales
    WHERE status NOT IN ('completed','won','closed','lost','cancelled')
  LOOP
    _flags := '[]'::jsonb;
    _days_stage := EXTRACT(epoch FROM (now() - _r.updated_at))::integer / 86400;

    SELECT MAX(created_at) INTO _last_act FROM public.activities WHERE sale_id = _r.id AND deleted_at IS NULL;
    _days_act := CASE WHEN _last_act IS NULL THEN NULL ELSE EXTRACT(epoch FROM (now() - _last_act))::integer / 86400 END;

    IF _days_stage > 14 THEN _flags := _flags || jsonb_build_array(jsonb_build_object('flag','stale_stage','severity','high','days',_days_stage)); END IF;
    IF _days_act IS NULL OR _days_act > 7 THEN _flags := _flags || jsonb_build_array(jsonb_build_object('flag','no_recent_activity','severity','medium','days',_days_act)); END IF;
    IF NOT EXISTS (SELECT 1 FROM public.buying_committee_members WHERE sale_id = _r.id AND committee_role IN ('decision_maker','champion')) THEN
      _flags := _flags || jsonb_build_array(jsonb_build_object('flag','no_decision_maker','severity','high'));
    END IF;
    IF (SELECT COUNT(*) FROM public.buying_committee_members WHERE sale_id = _r.id) <= 1 THEN
      _flags := _flags || jsonb_build_array(jsonb_build_object('flag','single_threaded','severity','medium'));
    END IF;

    INSERT INTO public.pipeline_inspection_snapshots
      (sale_id, stage, days_in_stage, last_activity_at, days_since_activity, risk_flags)
    VALUES (_r.id, _r.status, _days_stage, _last_act, _days_act, _flags);
    _count := _count + 1;
  END LOOP;

  RETURN _count;
END;
$$;

-- ════════════════════════════════════════════════════════════════════════
-- 3) create_activities_from_action_items
-- ════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.create_activities_from_action_items(_recording_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rec RECORD;
  v_caller_sp uuid;
  v_item jsonb;
  v_inserted int := 0;
  v_tag text;
  v_title text;
BEGIN
  SELECT id, salesperson_id, sale_id, action_items, title
    INTO v_rec
  FROM public.call_recordings
  WHERE id = _recording_id;

  IF v_rec.id IS NULL THEN
    RAISE EXCEPTION 'Recording not found';
  END IF;

  v_caller_sp := public.get_current_salesperson_id();
  IF v_rec.salesperson_id <> v_caller_sp AND NOT public.is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  v_tag := '[ai-summary:' || _recording_id::text || ']';

  FOR v_item IN SELECT * FROM jsonb_array_elements(COALESCE(v_rec.action_items, '[]'::jsonb))
  LOOP
    v_title := COALESCE(v_item->>'title', 'Follow-up da reunião');

    -- Idempotency: skip if note already contains tag for this item title
    IF EXISTS (
      SELECT 1 FROM public.activities
      WHERE salesperson_id = v_rec.salesperson_id
        AND notes LIKE '%' || v_tag || '%'
        AND notes LIKE '%' || v_title || '%'
        AND deleted_at IS NULL
    ) THEN
      CONTINUE;
    END IF;

    INSERT INTO public.activities (
      activity_type, outcome, sale_id, salesperson_id, notes, contact_name
    ) VALUES (
      'follow_up'::activity_type,
      'pending'::activity_outcome,
      v_rec.sale_id,
      v_rec.salesperson_id,
      v_tag || ' ' || v_title ||
        COALESCE(' | Prazo: ' || (v_item->>'due_hint'), '') ||
        COALESCE(' | Prioridade: ' || (v_item->>'priority'), '') ||
        COALESCE(' | Responsável: ' || (v_item->>'owner_hint'), ''),
      NULL
    );
    v_inserted := v_inserted + 1;
  END LOOP;

  RETURN v_inserted;
END;
$$;

-- ════════════════════════════════════════════════════════════════════════
-- 4) get_semantic_coverage
-- ════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_semantic_coverage()
RETURNS TABLE(
  entity_type text,
  total_rows bigint,
  indexed_rows bigint,
  coverage_pct numeric,
  last_indexed timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT 'client'::text AS et, (SELECT count(*) FROM public.clients) AS total
    UNION ALL SELECT 'lead', (SELECT count(*) FROM public.sales WHERE status IN ('lead','prospecting','qualified'))
    UNION ALL SELECT 'deal', (SELECT count(*) FROM public.sales WHERE status IN ('proposal','negotiation','pending','completed','won','closed','lost','cancelled'))
    UNION ALL SELECT 'activity', (SELECT count(*) FROM public.activities WHERE deleted_at IS NULL)
    UNION ALL SELECT 'call_recording', (SELECT count(*) FROM public.call_recordings)
  ),
  idx AS (
    SELECT si.entity_type AS et, count(*) AS indexed, max(si.updated_at) AS last_at
    FROM public.semantic_index si
    GROUP BY si.entity_type
  )
  SELECT
    b.et,
    b.total,
    COALESCE(i.indexed, 0),
    CASE WHEN b.total = 0 THEN 100::numeric
         ELSE ROUND((COALESCE(i.indexed,0)::numeric / b.total::numeric) * 100, 1)
    END,
    i.last_at
  FROM base b
  LEFT JOIN idx i ON i.et = b.et
  ORDER BY b.et;
END;
$$;
