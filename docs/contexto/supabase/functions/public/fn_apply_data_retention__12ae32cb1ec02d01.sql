CREATE OR REPLACE FUNCTION public.fn_apply_data_retention()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  r record;
  v_n bigint;
  v_total bigint;
  v_counts jsonb := '{}'::jsonb;
  v_cutoff timestamptz;
  v_batch constant int := 10000;
BEGIN
  FOR r IN
    SELECT p.table_name, p.ts_column, p.retention_days
    FROM public.data_retention_policies p
    WHERE p.enabled
    ORDER BY p.table_name
  LOOP
    v_total := 0;
    v_cutoff := now() - make_interval(days => r.retention_days);

    -- Tabela ou coluna ausente: política pulada sem derrubar o job.
    IF to_regclass('public.' || r.table_name) IS NULL
       OR NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = r.table_name
              AND column_name = r.ts_column) THEN
      v_counts := v_counts || jsonb_build_object(r.table_name, 'skipped:missing');
      CONTINUE;
    END IF;

    -- Qualquer erro numa tabela (coluna id ausente, permissão, drift de schema)
    -- é registrado e não derruba o job das demais.
    BEGIN
      IF r.table_name = 'website_visitor_logs' THEN
        -- Regra LGPD: purga expirados E sem consentimento ativo vinculado.
        LOOP
          EXECUTE format(
            'DELETE FROM public.%I WHERE id IN (
               SELECT w.id FROM public.%I w
               WHERE NOT EXISTS (
                       SELECT 1 FROM public.consent_records c
                       WHERE c.id = w.consent_record_id AND c.revoked_at IS NULL)
                 AND (w.retention_expires_at < now()
                      OR w.consent_record_id IS NOT NULL)
               LIMIT %s)',
            r.table_name, r.table_name, v_batch);
          GET DIAGNOSTICS v_n = ROW_COUNT;
          v_total := v_total + v_n;
          EXIT WHEN v_n = 0;
        END LOOP;
      ELSE
        LOOP
          EXECUTE format(
            'DELETE FROM public.%I WHERE id IN (
               SELECT id FROM public.%I
               WHERE %I < $1
               LIMIT %s)',
            r.table_name, r.table_name, r.ts_column, v_batch)
          USING v_cutoff;
          GET DIAGNOSTICS v_n = ROW_COUNT;
          v_total := v_total + v_n;
          EXIT WHEN v_n = 0;
        END LOOP;
      END IF;

      v_counts := v_counts || jsonb_build_object(r.table_name, v_total);
    EXCEPTION WHEN OTHERS THEN
      v_counts := v_counts || jsonb_build_object(r.table_name, 'error:' || SQLERRM);
    END;
  END LOOP;

  RETURN v_counts;
END;
$function$
