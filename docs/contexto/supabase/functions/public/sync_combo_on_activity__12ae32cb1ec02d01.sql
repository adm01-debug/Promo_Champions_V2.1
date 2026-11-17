CREATE OR REPLACE FUNCTION public.sync_combo_on_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_date date;
BEGIN
  -- Atividade sem vendedor (importacao, automacao) nao gera combo.
  IF NEW.salesperson_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_date := (COALESCE(NEW.created_at, now()) AT TIME ZONE 'America/Sao_Paulo')::date;

  -- Uma escrita so: o incremento e a escada de tier saem juntos, sem janela
  -- de corrida entre duas atividades do mesmo vendedor no mesmo instante.
  -- Dentro do ON CONFLICT a linha existente e referenciada por
  -- `combo_tracking.<col>` (sem o schema, que o Postgres nao aceita aqui).
  INSERT INTO public.combo_tracking (
    salesperson_id, combo_date, actions_count, current_multiplier, current_tier, max_tier_today
  )
  VALUES (NEW.salesperson_id, v_date, 1, 1.0, 0, 0)
  ON CONFLICT (salesperson_id, combo_date) DO UPDATE
    SET actions_count = combo_tracking.actions_count + 1,
        current_tier = CASE
                         WHEN combo_tracking.actions_count + 1 >= 12 THEN 4
                         WHEN combo_tracking.actions_count + 1 >= 8  THEN 3
                         WHEN combo_tracking.actions_count + 1 >= 5  THEN 2
                         WHEN combo_tracking.actions_count + 1 >= 3  THEN 1
                         ELSE 0
                       END,
        current_multiplier = CASE
                               WHEN combo_tracking.actions_count + 1 >= 12 THEN 3.0
                               WHEN combo_tracking.actions_count + 1 >= 8  THEN 2.5
                               WHEN combo_tracking.actions_count + 1 >= 5  THEN 2.0
                               WHEN combo_tracking.actions_count + 1 >= 3  THEN 1.5
                               ELSE 1.0
                             END,
        max_tier_today = GREATEST(
                           combo_tracking.max_tier_today,
                           CASE
                             WHEN combo_tracking.actions_count + 1 >= 12 THEN 4
                             WHEN combo_tracking.actions_count + 1 >= 8  THEN 3
                             WHEN combo_tracking.actions_count + 1 >= 5  THEN 2
                             WHEN combo_tracking.actions_count + 1 >= 3  THEN 1
                             ELSE 0
                           END
                         ),
        updated_at = now();

  RETURN NEW;
END;
$function$
