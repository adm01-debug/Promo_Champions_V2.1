-- =====================================================
-- SEC-008: RLS Policies Complete
-- Descrição: Políticas RLS para todas as tabelas
-- =====================================================

-- 1. DEALS - Políticas baseadas em role e ownership
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can do anything on deals" ON deals;
CREATE POLICY "Admins can do anything on deals"
  ON deals
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Managers can view all deals" ON deals;
CREATE POLICY "Managers can view all deals"
  ON deals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('manager', 'admin')
    )
  );

DROP POLICY IF EXISTS "Users can view assigned deals" ON deals;
CREATE POLICY "Users can view assigned deals"
  ON deals
  FOR SELECT
  USING (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update own deals" ON deals;
CREATE POLICY "Users can update own deals"
  ON deals
  FOR UPDATE
  USING (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Users can create deals" ON deals;
CREATE POLICY "Users can create deals"
  ON deals
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
  );

-- 2. CLIENTS - Políticas similares
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access clients" ON clients;
CREATE POLICY "Admins full access clients"
  ON clients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Managers view all clients" ON clients;
CREATE POLICY "Managers view all clients"
  ON clients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('manager', 'admin')
    )
  );

DROP POLICY IF EXISTS "Users view assigned clients" ON clients;
CREATE POLICY "Users view assigned clients"
  ON clients FOR SELECT
  USING (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Users modify own clients" ON clients;
CREATE POLICY "Users modify own clients"
  ON clients FOR UPDATE
  USING (assigned_to = auth.uid());

DROP POLICY IF EXISTS "Users create clients" ON clients;
CREATE POLICY "Users create clients"
  ON clients FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- 3. ACTIVITIES - Acesso baseado em deals/clients
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins activities" ON activities;
CREATE POLICY "Admins activities"
  ON activities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "View activities of accessible deals" ON activities;
CREATE POLICY "View activities of accessible deals"
  ON activities FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM deals
      WHERE deals.id = activities.deal_id
      AND (deals.assigned_to = auth.uid() OR deals.created_by = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = activities.client_id
      AND (clients.assigned_to = auth.uid() OR clients.created_by = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Create own activities" ON activities;
CREATE POLICY "Create own activities"
  ON activities FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Update own activities" ON activities;
CREATE POLICY "Update own activities"
  ON activities FOR UPDATE
  USING (user_id = auth.uid());

-- 4. TASKS - Acesso pessoal e atribuídas
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View assigned tasks" ON tasks;
CREATE POLICY "View assigned tasks"
  ON tasks FOR SELECT
  USING (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "Create tasks" ON tasks;
CREATE POLICY "Create tasks"
  ON tasks FOR INSERT
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Update tasks" ON tasks;
CREATE POLICY "Update tasks"
  ON tasks FOR UPDATE
  USING (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
  );

-- 5. NOTES - Privadas por padrão
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View own notes" ON notes;
CREATE POLICY "View own notes"
  ON notes FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_public = true
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Create notes" ON notes;
CREATE POLICY "Create notes"
  ON notes FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Update own notes" ON notes;
CREATE POLICY "Update own notes"
  ON notes FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Delete own notes" ON notes;
CREATE POLICY "Delete own notes"
  ON notes FOR DELETE
  USING (user_id = auth.uid());

-- 6. USERS - Acesso restrito
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own profile" ON users;
CREATE POLICY "Users view own profile"
  ON users FOR SELECT
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "Users update own profile" ON users;
CREATE POLICY "Users update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins full users access" ON users;
CREATE POLICY "Admins full users access"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );
