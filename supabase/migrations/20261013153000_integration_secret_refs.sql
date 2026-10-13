-- integration_secret_refs: referências a segredos de provedores externos.
--
-- Motivo: channel_credentials.credentials (jsonb) guarda tokens Twilio/Meta/
-- Z-API/N8N em texto puro, legível por qualquer role com SELECT na linha.
-- Esta tabela guarda APENAS referências (nunca o valor): cada linha aponta um
-- campo da credencial para uma fonte de segredo —
--   • 'internal:<key>' → public._internal_secrets.key (RLS deny-all; só
--     service_role lê — mesmo padrão dos crons internos)
--   • 'env:<VAR>'      → variável de ambiente da edge function (Supabase
--     Edge Functions → Secrets)
--
-- As edge functions consumidoras resolvem refs via
-- _shared/secret-refs.ts e caem no jsonb quando não há ref (retrocompatível:
-- credenciais antigas continuam funcionando até serem migradas).
--
-- RLS espelha channel_credentials: o ref é metadado (nome do segredo), não o
-- segredo — owner/admin veem as refs, mas só service_role resolve o valor.
CREATE TABLE IF NOT EXISTS public.integration_secret_refs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  credential_id uuid NOT NULL REFERENCES public.channel_credentials(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  key text NOT NULL,
  secret_ref text NOT NULL CHECK (secret_ref ~ '^(internal|env):[A-Za-z_][A-Za-z0-9_.-]*$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (credential_id, key)
);

CREATE INDEX IF NOT EXISTS idx_integration_secret_refs_credential
  ON public.integration_secret_refs(credential_id);
CREATE INDEX IF NOT EXISTS idx_integration_secret_refs_owner
  ON public.integration_secret_refs(owner_id);

ALTER TABLE public.integration_secret_refs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their secret refs"
  ON public.integration_secret_refs FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Owners can insert their secret refs"
  ON public.integration_secret_refs FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their secret refs"
  ON public.integration_secret_refs FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()))
  WITH CHECK (owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Owners can delete their secret refs"
  ON public.integration_secret_refs FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()));

CREATE TRIGGER trg_integration_secret_refs_updated_at
  BEFORE UPDATE ON public.integration_secret_refs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
