ALTER TABLE public.stage_velocity_baselines
  ADD COLUMN IF NOT EXISTS segment text NOT NULL DEFAULT 'all',
  ADD COLUMN IF NOT EXISTS p50_hours numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS p75_hours numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS p90_hours numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS computed_at timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stage_velocity_baselines_stage_segment_key'
  ) THEN
    BEGIN
      ALTER TABLE public.stage_velocity_baselines
        ADD CONSTRAINT stage_velocity_baselines_stage_segment_key UNIQUE (stage, segment);
    EXCEPTION WHEN duplicate_table OR unique_violation THEN NULL;
    END;
  END IF;
END $$;