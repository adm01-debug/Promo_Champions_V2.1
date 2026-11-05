-- Limites operacionais e tipos permitidos dos buckets canônicos.
-- Nenhum objeto armazenado é alterado ou removido.

UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif'
    ]::text[]
WHERE id = 'avatars';

UPDATE storage.buckets
SET file_size_limit = 104857600,
    allowed_mime_types = ARRAY[
      'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a',
      'audio/wav', 'audio/x-wav', 'audio/vnd.wave', 'audio/webm', 'audio/ogg',
      'audio/m4a',
      'video/webm', 'video/mp4'
    ]::text[]
WHERE id = 'call-recordings';

UPDATE storage.buckets
SET file_size_limit = 20971520,
    allowed_mime_types = ARRAY['application/pdf']::text[]
WHERE id = 'quote-pdfs';

UPDATE storage.buckets
SET file_size_limit = 52428800,
    allowed_mime_types = ARRAY[
      'application/pdf', 'application/json', 'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]::text[]
WHERE id = 'report-exports';

UPDATE storage.buckets
SET file_size_limit = 20971520,
    allowed_mime_types = ARRAY['application/json', 'text/csv']::text[]
WHERE id = 'report-snapshots';

-- O código de export-winloss-pdf já usa este bucket. Criá-lo explicitamente
-- elimina a criação best-effort em runtime e mantém os artefatos privados.
INSERT INTO storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
) VALUES (
  'winloss-reports',
  'winloss-reports',
  false,
  5242880,
  ARRAY['text/markdown']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policies que dependem de auth.uid() não precisam ser avaliadas por anon.
DROP POLICY IF EXISTS "Salespeople delete own call audio" ON storage.objects;
CREATE POLICY "Salespeople delete own call audio"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'call-recordings'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.is_admin_or_manager(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Salespeople read own call audio" ON storage.objects;
CREATE POLICY "Salespeople read own call audio"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'call-recordings'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.is_admin_or_manager(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Salespeople upload own call audio" ON storage.objects;
CREATE POLICY "Salespeople upload own call audio"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'call-recordings'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "owner can read own report snapshots" ON storage.objects;
CREATE POLICY "owner can read own report snapshots"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'report-snapshots'
    AND (
      public.is_admin_or_manager(auth.uid())
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- Corrige apenas o nome enganoso; o comportamento continua sendo upload do
-- proprietário autenticado. service_role ignora RLS para os jobs internos.
DROP POLICY IF EXISTS "service_role_can_write_exports" ON storage.objects;
DROP POLICY IF EXISTS "report_owners_can_write_exports" ON storage.objects;
CREATE POLICY "report_owners_can_write_exports"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'report-exports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
