CREATE POLICY "Admins and managers can view churn alert notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (
  type = 'churn_alert'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
);