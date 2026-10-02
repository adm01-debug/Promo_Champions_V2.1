-- Pacote auditoria auth/authz (2026-10-01) — SELECT-USER_ROLES
-- Recria a policy de SELECT de public.user_roles explicitando os tres
-- caminhos de leitura: a propria role, admin via has_role, ou
-- admin/manager via helper canonico is_admin_or_manager.
-- (A policy anterior, criada por 20260317223307, ja restringia ao proprio
-- usuario ou admin/manager — esta versao torna o caminho admin explicito e
-- alinha o texto com o padrao do pacote. Sem mudanca efetiva de escopo.)

DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role"
  ON public.user_roles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.is_admin_or_manager(auth.uid())
  );
