
-- Fix quote-pdfs SELECT: restrict to owner or admin
DROP POLICY IF EXISTS "Authenticated users can read quote PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own quote PDFs" ON storage.objects;

CREATE POLICY "Users can read own quote PDFs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'quote-pdfs'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.is_admin_or_manager(auth.uid())
  )
);

-- Add DELETE policy for quote-pdfs
CREATE POLICY "Users can delete own quote PDFs"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'quote-pdfs'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.is_admin_or_manager(auth.uid())
  )
);

-- Remove sdr_alert_history from Realtime
ALTER PUBLICATION supabase_realtime DROP TABLE public.sdr_alert_history;
