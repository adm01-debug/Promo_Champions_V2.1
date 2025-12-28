-- Melhorias 85-88 - RLS Policies Avançadas

-- 85: Activities RLS
DROP POLICY IF EXISTS "Users can view own or team activities" ON activities;
CREATE POLICY "Users can view own or team activities"
  ON activities FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM team_members WHERE user_id = auth.uid() AND team_id = activities.team_id)
  );

-- 86: Tasks RLS
CREATE POLICY "Users can view assigned tasks"
  ON tasks FOR SELECT
  USING (assigned_to = auth.uid());

-- 87: Notifications RLS
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- 88: Playbooks RLS
CREATE POLICY "Users can view authorized playbooks"
  ON playbooks FOR SELECT
  USING (
    is_public = true OR
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM playbook_permissions WHERE playbook_id = playbooks.id AND user_id = auth.uid())
  );
