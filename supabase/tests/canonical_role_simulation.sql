-- Simulação por role. Deve rodar após as migrations e antes do rollback sentinela.
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '{"role":"anon"}', true);
SELECT set_config(
  'request.headers',
  '{"cf-connecting-ip":"203.0.113.10","user-agent":"canonical-simulation"}',
  true
);

DO $$
DECLARE
  v_before integer;
  v_after integer;
  v_other_ip_before integer;
  v_other_ip_after integer;
  v_invalid_before integer;
  v_invalid_after integer;
  v_valid_before integer;
  v_valid_after integer;
  v_distributed_lockout timestamptz;
  v_rate_limited boolean := false;
  v_index integer;
BEGIN
  SELECT s.attempts
    INTO v_before
    FROM public.get_login_lockout_status('simulation@example.invalid') AS s;

  PERFORM set_config(
    'request.headers',
    '{"cf-connecting-ip":"203.0.113.11","user-agent":"canonical-simulation"}',
    true
  );
  SELECT s.attempts
    INTO v_other_ip_before
    FROM public.get_login_lockout_status('simulation@example.invalid') AS s;
  PERFORM set_config(
    'request.headers',
    '{"cf-connecting-ip":"203.0.113.10","user-agent":"canonical-simulation"}',
    true
  );

  PERFORM public.record_failed_login_attempt(
    'simulation@example.invalid',
    'invalid_credentials',
    'canonical-simulation'
  );

  SELECT s.attempts
    INTO v_after
    FROM public.get_login_lockout_status('simulation@example.invalid') AS s;
  IF v_after <> v_before + 1 THEN
    RAISE EXCEPTION 'anon_login_aggregate_did_not_advance';
  END IF;

  PERFORM set_config(
    'request.headers',
    '{"cf-connecting-ip":"203.0.113.11","user-agent":"canonical-simulation"}',
    true
  );
  SELECT s.attempts
    INTO v_other_ip_after
    FROM public.get_login_lockout_status('simulation@example.invalid') AS s;
  IF v_other_ip_after <> v_other_ip_before THEN
    RAISE EXCEPTION 'login_lockout_leaked_between_source_ips';
  END IF;

  PERFORM set_config('request.headers', '{"cf-connecting-ip":"203.0.113.12"}', true);
  SELECT s.attempts INTO v_valid_before
    FROM public.get_login_lockout_status('invalid-ip-simulation@example.invalid') AS s;

  PERFORM set_config('request.headers', '{"x-forwarded-for":"not-an-ip"}', true);
  SELECT s.attempts INTO v_invalid_before
    FROM public.get_login_lockout_status('invalid-ip-simulation@example.invalid') AS s;
  PERFORM public.record_failed_login_attempt(
    'invalid-ip-simulation@example.invalid',
    'invalid_credentials',
    'canonical-simulation'
  );
  SELECT s.attempts INTO v_invalid_after
    FROM public.get_login_lockout_status('invalid-ip-simulation@example.invalid') AS s;
  IF v_invalid_after <> v_invalid_before + 1 THEN
    RAISE EXCEPTION 'invalid_ip_attempt_was_not_recorded_safely';
  END IF;

  PERFORM set_config('request.headers', '{"cf-connecting-ip":"203.0.113.12"}', true);
  SELECT s.attempts INTO v_valid_after
    FROM public.get_login_lockout_status('invalid-ip-simulation@example.invalid') AS s;
  IF v_valid_after <> v_valid_before THEN
    RAISE EXCEPTION 'invalid_ip_attempt_leaked_into_valid_source';
  END IF;

  -- Dez origens diferentes contra o mesmo e-mail acionam o limitador
  -- agregado; uma 11ª origem deve receber lockout e não apenas erro de log.
  FOR v_index IN 1..10 LOOP
    PERFORM set_config(
      'request.headers',
      format('{"cf-connecting-ip":"198.51.100.%s"}', v_index),
      true
    );
    PERFORM public.record_failed_login_attempt(
      'distributed-simulation@example.invalid',
      'invalid_credentials',
      'canonical-simulation'
    );
  END LOOP;

  PERFORM set_config('request.headers', '{"cf-connecting-ip":"198.51.100.250"}', true);
  SELECT s.lockout_until INTO v_distributed_lockout
    FROM public.get_login_lockout_status('distributed-simulation@example.invalid') AS s;
  IF v_distributed_lockout IS NULL OR v_distributed_lockout <= now() THEN
    RAISE EXCEPTION 'distributed_email_attack_did_not_lock_new_source';
  END IF;

  BEGIN
    PERFORM public.record_failed_login_attempt(
      'distributed-simulation@example.invalid',
      'invalid_credentials',
      'canonical-simulation'
    );
  EXCEPTION WHEN SQLSTATE 'P0001' THEN
    IF SQLERRM = 'rate_limit_exceeded' THEN
      v_rate_limited := true;
    ELSE
      RAISE;
    END IF;
  END;
  IF NOT v_rate_limited THEN
    RAISE EXCEPTION 'distributed_email_attack_was_not_rate_limited';
  END IF;

  BEGIN
    PERFORM 1 FROM public.login_attempts LIMIT 1;
    RAISE EXCEPTION 'anon_raw_login_select_unexpectedly_allowed';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  BEGIN
    DELETE FROM public.maintenance_log WHERE false;
    RAISE EXCEPTION 'anon_maintenance_delete_unexpectedly_allowed';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  BEGIN
    PERFORM public.claim_pending_cadence_tasks(current_date, 1);
    RAISE EXCEPTION 'anon_internal_claim_unexpectedly_allowed';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  BEGIN
    PERFORM public.record_successful_login_attempt('canonical-simulation');
    RAISE EXCEPTION 'anon_success_log_unexpectedly_allowed';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END;
$$;

RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"role":"authenticated"}', true);

DO $$
BEGIN
  BEGIN
    PERFORM public.hard_delete_record(
      'clients',
      '00000000-0000-0000-0000-000000000001'::uuid,
      '00000000-0000-0000-0000-000000000002'::uuid
    );
    RAISE EXCEPTION 'unauthenticated_hard_delete_unexpectedly_allowed';
  EXCEPTION
    WHEN invalid_authorization_specification OR insufficient_privilege THEN
      NULL;
  END;
END;
$$;

RESET ROLE;
