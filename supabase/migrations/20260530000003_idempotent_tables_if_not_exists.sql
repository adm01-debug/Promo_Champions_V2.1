-- Retroactive IF NOT EXISTS guards for existing migration patterns
-- This ensures re-runs and CI deployments are idempotent

-- Add IF NOT EXISTS to any table that may need it
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salesperson_id UUID REFERENCES salespeople(id),
    client_id UUID,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    category TEXT,
    source TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salesperson_id UUID REFERENCES salespeople(id),
    activity_type TEXT NOT NULL,
    outcome TEXT,
    contact_name TEXT,
    notes TEXT,
    duration_minutes INTEGER,
    sale_id UUID REFERENCES sales(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS sales_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salesperson_id UUID REFERENCES salespeople(id),
    month TEXT NOT NULL,
    goal_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS activity_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salesperson_id UUID REFERENCES salespeople(id),
    calls_goal INTEGER NOT NULL DEFAULT 0,
    emails_goal INTEGER NOT NULL DEFAULT 0,
    meetings_goal INTEGER NOT NULL DEFAULT 0,
    linkedin_goal INTEGER NOT NULL DEFAULT 0,
    whatsapp_goal INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salesperson_id UUID REFERENCES salespeople(id),
    achievement_type TEXT NOT NULL,
    achievement_date TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS conversation_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analyzed_by UUID REFERENCES salespeople(id),
    buying_signals JSONB DEFAULT '[]'::jsonb,
    risk_signals JSONB DEFAULT '[]'::jsonb,
    sentiment TEXT,
    transcript TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
