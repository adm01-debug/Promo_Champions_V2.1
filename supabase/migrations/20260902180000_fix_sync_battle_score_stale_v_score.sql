-- Achado da validação adversarial de 5 agentes (2026-09-02, segunda rodada): v_score
-- era declarado uma única vez fora do LOOP e nunca resetado a cada iteração. Se um
-- vendedor participa de duas batalhas ativas simultâneas e a segunda tiver uma métrica
-- fora de {revenue,deals,calls,meetings}, nenhum ramo do IF/ELSIF roda, e v_score mantém
-- o valor calculado da batalha anterior -- gravado indevidamente em current_score da
-- batalha com métrica desconhecida. Fix: resetar v_score no início de cada iteração.

CREATE OR REPLACE FUNCTION public.sync_battle_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_battle_id UUID;
  v_metric TEXT;
  v_score NUMERIC;
BEGIN
  FOR v_battle_id, v_metric IN
    SELECT b.id, b.metric
    FROM public.sales_battles b
    JOIN public.battle_participants p ON p.battle_id = b.id
    WHERE b.status = 'active'
      AND p.salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id)
      AND (b.starts_at <= NOW() AND b.ends_at >= NOW())
  LOOP
    v_score := 0;

    IF v_metric = 'revenue' THEN
      SELECT COALESCE(SUM(amount), 0) INTO v_score
      FROM public.sales
      WHERE salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id)
        AND (status = 'won' OR status = 'completed')
        AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id);
    ELSIF v_metric = 'deals' THEN
      SELECT COUNT(*) INTO v_score
      FROM public.sales
      WHERE salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id)
        AND (status = 'won' OR status = 'completed')
        AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id);
    ELSIF v_metric = 'calls' THEN
      SELECT COUNT(*) INTO v_score
      FROM public.activities
      WHERE salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id)
        AND activity_type = 'call'
        AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id);
    ELSIF v_metric = 'meetings' THEN
      SELECT COUNT(*) INTO v_score
      FROM public.activities
      WHERE salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id)
        AND activity_type = 'meeting'
        AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id);
    END IF;

    UPDATE public.battle_participants
    SET current_score = v_score
    WHERE battle_id = v_battle_id
      AND salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id);
  END LOOP;

  RETURN NEW;
END;
$function$;
