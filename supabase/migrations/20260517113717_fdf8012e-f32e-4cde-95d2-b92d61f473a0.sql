-- Fix deal_health_history
DROP POLICY IF EXISTS "Authenticated users can insert health history" ON deal_health_history;
CREATE POLICY "Authenticated users can insert health history" 
ON deal_health_history FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- Fix call_critical_moments
DROP POLICY IF EXISTS "Authenticated users can insert critical moments" ON call_critical_moments;
CREATE POLICY "Authenticated users can insert critical moments" 
ON call_critical_moments FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- Fix critical_moment_notifications
DROP POLICY IF EXISTS "Authenticated users can insert critical moment notifications" ON critical_moment_notifications;
CREATE POLICY "Authenticated users can insert critical moment notifications" 
ON critical_moment_notifications FOR INSERT 
WITH CHECK (auth.uid() = recipient_user_id);
