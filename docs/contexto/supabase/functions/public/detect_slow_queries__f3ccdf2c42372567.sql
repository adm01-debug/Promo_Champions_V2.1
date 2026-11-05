CREATE OR REPLACE FUNCTION public.detect_slow_queries(_mean_ms double precision DEFAULT 500, _min_calls bigint DEFAULT 100)
 RETURNS TABLE(inserted integer, updated integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  ins integer := 0;
  upd integer := 0;
  r record;
  h text;
BEGIN
  IF _mean_ms <= 0 OR _min_calls <= 0 THEN
    RAISE EXCEPTION 'thresholds_must_be_positive' USING ERRCODE = '22023';
  END IF;

  FOR r IN
    SELECT
      left(pss.query, 500) AS query_text,
      pss.calls,
      pss.total_exec_time,
      pss.mean_exec_time,
      pss.max_exec_time
    FROM extensions.pg_stat_statements AS pss
    JOIN pg_catalog.pg_database AS d
      ON d.oid = pss.dbid
     AND d.datname = current_database()
    WHERE pss.mean_exec_time >= _mean_ms
      AND pss.calls >= _min_calls
      AND pss.query !~* '^(SET |BEGIN|COMMIT|ROLLBACK|SHOW |DEALLOCATE|DISCARD|VACUUM|ANALYZE|LISTEN|NOTIFY)'
      AND pss.query NOT ILIKE '%pg_stat_statements%'
      AND pss.query NOT ILIKE '%pg_catalog.%'
    ORDER BY pss.mean_exec_time DESC
    LIMIT 50
  LOOP
    h := encode(extensions.digest(r.query_text, 'sha1'), 'hex');

    INSERT INTO public.slow_query_alerts(
      query_hash, query_preview, mean_exec_ms, max_exec_ms,
      calls, total_exec_ms, threshold_mean_ms, threshold_min_calls
    )
    VALUES (
      h, r.query_text, r.mean_exec_time, r.max_exec_time,
      r.calls, r.total_exec_time, _mean_ms, _min_calls
    )
    ON CONFLICT (query_hash) WHERE acknowledged_at IS NULL
    DO UPDATE SET
      last_detected_at = now(),
      detection_count = public.slow_query_alerts.detection_count + 1,
      mean_exec_ms = EXCLUDED.mean_exec_ms,
      max_exec_ms = EXCLUDED.max_exec_ms,
      calls = EXCLUDED.calls,
      total_exec_ms = EXCLUDED.total_exec_ms;

    IF FOUND THEN
      IF (
        SELECT detection_count = 1
        FROM public.slow_query_alerts
        WHERE query_hash = h AND acknowledged_at IS NULL
      ) THEN
        ins := ins + 1;
      ELSE
        upd := upd + 1;
      END IF;
    END IF;
  END LOOP;

  INSERT INTO public.maintenance_log(
    job_name, status, completed_at, rows_affected, metadata
  ) VALUES (
    'detect_slow_queries',
    'completed',
    now(),
    ins + upd,
    jsonb_build_object(
      'inserted', ins,
      'updated', upd,
      'threshold_mean_ms', _mean_ms,
      'threshold_min_calls', _min_calls
    )
  );

  inserted := ins;
  updated := upd;
  RETURN NEXT;
END;
$function$
