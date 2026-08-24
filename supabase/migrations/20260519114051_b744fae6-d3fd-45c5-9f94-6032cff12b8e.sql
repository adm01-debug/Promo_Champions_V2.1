-- Phase 1: Performance Optimization - Missing FK Indexes
DO $$
DECLARE
    rec RECORD;
    idx_name text;
BEGIN
    FOR rec IN (
        WITH fk_columns AS (
            SELECT
                conrelid::regclass AS table_name,
                a.attname AS column_name,
                c.conname AS constraint_name
            FROM
                pg_constraint AS c
                JOIN pg_attribute AS a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
                JOIN pg_class cl ON cl.oid = c.conrelid
            WHERE
                c.contype = 'f' 
                AND c.connamespace = 'public'::regnamespace
                AND cl.relkind = 'r'
        ),
        indexed_columns AS (
            SELECT
                t.relname AS table_name,
                a.attname AS column_name
            FROM
                pg_index AS i
                JOIN pg_class AS t ON i.indrelid = t.oid
                JOIN pg_attribute AS a ON a.attrelid = t.oid AND a.attnum = ANY(i.indkey)
            WHERE
                t.relnamespace = 'public'::regnamespace
        )
        SELECT
            fk.table_name,
            fk.column_name,
            fk.constraint_name
        FROM
            fk_columns AS fk
        LEFT JOIN
            indexed_columns AS idx ON fk.table_name::text = idx.table_name AND fk.column_name = idx.column_name
        WHERE
            idx.column_name IS NULL
    ) LOOP
        idx_name := substring('idx_' || replace(rec.table_name::text, '.', '_') || '_' || rec.column_name FROM 1 FOR 63);
        BEGIN
            EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %s (%I)', 
                idx_name,
                rec.table_name,
                rec.column_name);
        EXCEPTION WHEN others THEN
            RAISE NOTICE 'Could not create index for %s.%s: %', rec.table_name, rec.column_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Phase 2: Standardizing updated_at triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN (
        SELECT t.table_name 
        FROM information_schema.tables t
        JOIN information_schema.columns c ON c.table_name = t.table_name AND c.table_schema = t.table_schema
        WHERE c.column_name = 'updated_at' 
          AND t.table_schema = 'public'
          AND t.table_type = 'BASE TABLE'
          AND t.table_name NOT IN (
              SELECT tgrelid::regclass::text 
              FROM pg_trigger 
              WHERE tgname = 'set_updated_at'
          )
    ) LOOP
        BEGIN
            EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()', t);
        EXCEPTION WHEN others THEN
            RAISE NOTICE 'Could not create trigger for %: %', t, SQLERRM;
        END;
    END LOOP;
END $$;

-- Phase 3: Security Hardening

-- Helper to safely apply policies
DO $$
BEGIN
    -- API Tokens
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'api_tokens') THEN
        ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can see own tokens" ON public.api_tokens;
        EXECUTE 'CREATE POLICY "Users can see own tokens" ON public.api_tokens
        FOR SELECT TO authenticated
        USING (created_by = auth.uid() OR public.has_role(auth.uid(), ''admin''))';
    END IF;

    -- Admin Actions
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'admin_actions') THEN
        ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Admins can view all actions" ON public.admin_actions;
        EXECUTE 'CREATE POLICY "Admins can view all actions" ON public.admin_actions
        FOR SELECT TO authenticated
        USING (public.has_role(auth.uid(), ''admin''))';
    END IF;
END $$;
