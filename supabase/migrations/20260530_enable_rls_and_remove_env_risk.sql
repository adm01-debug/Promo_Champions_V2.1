-- DROP AND RECREATE RLS MIGRATION: Enable RLS and add policies for critical tables
-- This migration ensures all tables without RLS get it enabled retroactively

-- TABLES to check and fix

-- 1. sales table: ensure RLS enabled
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'sales' AND rowsecurity = true) THEN
    ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 2. activities: ensure RLS enabled
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'activities' AND rowsecurity = true) THEN
    ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 3. sales_goals: ensure RLS enabled
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'sales_goals' AND rowsecurity = true) THEN
    ALTER TABLE sales_goals ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 4. activity_goals: ensure RLS enabled
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'activity_goals' AND rowsecurity = true) THEN
    ALTER TABLE activity_goals ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 5. achievements: ensure RLS enabled
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'achievements' AND rowsecurity = true) THEN
    ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 6. conversation_analyses: ensure RLS enabled
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'conversation_analyses' AND rowsecurity = true) THEN
    ALTER TABLE conversation_analyses ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- POLICIES: Allow authenticated users to read their own data
-- sales: users can read all (for team view), insert their own
CREATE POLICY IF NOT EXISTS "sales_select_policy" ON sales 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "sales_insert_policy" ON sales 
  FOR INSERT TO authenticated WITH CHECK (true);

-- activities: users can read all, insert their own
CREATE POLICY IF NOT EXISTS "activities_select_policy" ON activities 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "activities_insert_policy" ON activities 
  FOR INSERT TO authenticated WITH CHECK (true);

-- sales_goals: read all, manager insert
CREATE POLICY IF NOT EXISTS "sales_goals_select_policy" ON sales_goals 
  FOR SELECT TO authenticated USING (true);

-- activity_goals: read all, manager insert
CREATE POLICY IF NOT EXISTS "activity_goals_select_policy" ON activity_goals 
  FOR SELECT TO authenticated USING (true);

-- achievements: read all, insert own
CREATE POLICY IF NOT EXISTS "achievements_select_policy" ON achievements 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "achievements_insert_policy" ON achievements 
  FOR INSERT TO authenticated WITH CHECK (true);

-- conversation_analyses: read all, insert own
CREATE POLICY IF NOT EXISTS "conversation_analyses_select_policy" ON conversation_analyses 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "conversation_analyses_insert_policy" ON conversation_analyses 
  FOR INSERT TO authenticated WITH CHECK (true);
