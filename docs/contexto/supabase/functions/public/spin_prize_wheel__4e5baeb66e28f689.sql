CREATE OR REPLACE FUNCTION public.spin_prize_wheel(p_request_id uuid)
 RETURNS TABLE(id uuid, prize_type text, prize_value integer, prize_label text, trigger_type text, spun_at timestamp with time zone, prize_index integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_salesperson_id uuid;
  v_spins_count integer;
  v_roll integer;
  v_prize_type text;
  v_prize_value integer;
  v_prize_label text;
  v_prize_index integer;
  v_existing public.prize_wheel_spins%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Autenticação obrigatória para girar a roda'
      USING ERRCODE = '28000';
  END IF;

  IF p_request_id IS NULL THEN
    RAISE EXCEPTION 'Identificador idempotente obrigatório'
      USING ERRCODE = '22004';
  END IF;

  v_salesperson_id := public.get_current_salesperson_id();
  IF v_salesperson_id IS NULL THEN
    RAISE EXCEPTION 'Perfil comercial não encontrado para o usuário autenticado'
      USING ERRCODE = 'P0001';
  END IF;

  -- Retorna a tentativa já concluída sem consumir outro giro.
  SELECT *
    INTO v_existing
    FROM public.prize_wheel_spins
   WHERE salesperson_id = v_salesperson_id
     AND request_id = p_request_id;

  IF FOUND THEN
    RETURN QUERY
    SELECT
      v_existing.id,
      v_existing.prize_type,
      v_existing.prize_value,
      v_existing.prize_label,
      v_existing.trigger_type,
      v_existing.spun_at,
      CASE v_existing.prize_label
        WHEN '+50 XP' THEN 0
        WHEN '+100 XP' THEN 1
        WHEN '+200 XP' THEN 2
        WHEN '2x XP 1h' THEN 3
        WHEN 'Badge 🔥' THEN 4
        WHEN '+500 XP' THEN 5
        WHEN '+25 XP' THEN 6
        ELSE NULL
      END;
    RETURN;
  END IF;

  -- Serializa somente os giros do vendedor atual. Uma chamada concorrente
  -- aguarda o lock, relê a requisição idempotente e não pode gerar prêmio
  -- adicional para o mesmo request_id.
  SELECT spins_count
    INTO v_spins_count
    FROM public.available_spins
   WHERE salesperson_id = v_salesperson_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Nenhum giro disponível'
      USING ERRCODE = 'P0001';
  END IF;

  -- A segunda leitura ocorre depois do lock. Em READ COMMITTED, isso permite
  -- que uma chamada concorrente enxergue a gravação concluída pela primeira
  -- transação antes de decidir se ainda há saldo a consumir.
  SELECT *
    INTO v_existing
    FROM public.prize_wheel_spins
   WHERE salesperson_id = v_salesperson_id
     AND request_id = p_request_id;

  IF FOUND THEN
    RETURN QUERY
    SELECT
      v_existing.id,
      v_existing.prize_type,
      v_existing.prize_value,
      v_existing.prize_label,
      v_existing.trigger_type,
      v_existing.spun_at,
      CASE v_existing.prize_label
        WHEN '+50 XP' THEN 0
        WHEN '+100 XP' THEN 1
        WHEN '+200 XP' THEN 2
        WHEN '2x XP 1h' THEN 3
        WHEN 'Badge 🔥' THEN 4
        WHEN '+500 XP' THEN 5
        WHEN '+25 XP' THEN 6
        ELSE NULL
      END;
    RETURN;
  END IF;

  IF v_spins_count <= 0 THEN
    RAISE EXCEPTION 'Nenhum giro disponível'
      USING ERRCODE = 'P0001';
  END IF;

  v_roll := floor(random() * 100)::integer;
  CASE
    WHEN v_roll < 25 THEN
      v_prize_type := 'xp'; v_prize_value := 50; v_prize_label := '+50 XP'; v_prize_index := 0;
    WHEN v_roll < 45 THEN
      v_prize_type := 'xp'; v_prize_value := 100; v_prize_label := '+100 XP'; v_prize_index := 1;
    WHEN v_roll < 55 THEN
      v_prize_type := 'xp'; v_prize_value := 200; v_prize_label := '+200 XP'; v_prize_index := 2;
    WHEN v_roll < 70 THEN
      v_prize_type := 'power_up'; v_prize_value := 2; v_prize_label := '2x XP 1h'; v_prize_index := 3;
    WHEN v_roll < 80 THEN
      v_prize_type := 'badge'; v_prize_value := 1; v_prize_label := 'Badge 🔥'; v_prize_index := 4;
    WHEN v_roll < 85 THEN
      v_prize_type := 'xp'; v_prize_value := 500; v_prize_label := '+500 XP'; v_prize_index := 5;
    ELSE
      v_prize_type := 'xp'; v_prize_value := 25; v_prize_label := '+25 XP'; v_prize_index := 6;
  END CASE;

  UPDATE public.available_spins
     SET spins_count = spins_count - 1,
         updated_at = now()
   WHERE salesperson_id = v_salesperson_id;

  INSERT INTO public.prize_wheel_spins (
    salesperson_id,
    request_id,
    prize_type,
    prize_value,
    prize_label,
    trigger_type
  )
  VALUES (
    v_salesperson_id,
    p_request_id,
    v_prize_type,
    v_prize_value,
    v_prize_label,
    'mission'
  )
  RETURNING * INTO v_existing;

  -- Concede o prêmio anunciado. O giro só alcança este ponto uma vez por
  -- request_id (o caminho idempotente retorna antes), então a concessão é
  -- exatamente-uma-vez por spin registrado.
  IF v_prize_type = 'xp' THEN
    INSERT INTO public.xp_history (
      salesperson_id, xp_amount, source_type, source_id, description
    ) VALUES (
      v_salesperson_id, v_prize_value, 'prize_wheel', v_existing.id::text,
      'Roleta da Sorte: ' || v_prize_label
    );
  ELSIF v_prize_type = 'power_up' THEN
    INSERT INTO public.active_power_ups (
      salesperson_id, power_up_type, multiplier, expires_at, source
    ) VALUES (
      v_salesperson_id, 'xp_boost', v_prize_value,
      now() + interval '1 hour', 'prize_wheel'
    );
  ELSIF v_prize_type = 'badge' THEN
    PERFORM private.award_achievement_if_not_exists(
      v_salesperson_id, 'prize_wheel_fire'
    );
  END IF;

  RETURN QUERY
  SELECT
    v_existing.id,
    v_existing.prize_type,
    v_existing.prize_value,
    v_existing.prize_label,
    v_existing.trigger_type,
    v_existing.spun_at,
    v_prize_index;
END;
$function$
