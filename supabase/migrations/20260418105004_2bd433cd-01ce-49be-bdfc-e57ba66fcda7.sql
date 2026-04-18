-- Ensure badges table has unique constraint for idempotent inserts (already declared in plan)
-- No-op safety: confirm existence; if not, create.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'race_badges_unique_per_season'
  ) THEN
    BEGIN
      ALTER TABLE public.race_badges
        ADD CONSTRAINT race_badges_unique_per_season UNIQUE (salesperson_id, badge_code, season_id);
    EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;