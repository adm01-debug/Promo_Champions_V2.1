-- Comprehensive RLS Policies for SalesPro
-- Enable RLS on all tables

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

-- Clients policies
CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);

-- Deals policies
CREATE POLICY "Users can view own deals"
  ON deals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deals"
  ON deals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deals"
  ON deals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own deals"
  ON deals FOR DELETE
  USING (auth.uid() = user_id);

-- Activities policies
CREATE POLICY "Users can view own activities"
  ON activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON activities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON activities FOR DELETE
  USING (auth.uid() = user_id);

-- Products policies (shared resource)
CREATE POLICY "Everyone can view active products"
  ON products FOR SELECT
  USING (active = true);

-- Tasks policies
CREATE POLICY "Users can view own or assigned tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update assigned tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);
