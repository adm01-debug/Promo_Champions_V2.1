
-- Drop overly permissive quote-pdfs policies
DROP POLICY IF EXISTS "Service role can upload quote PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Service role can update quote PDFs" ON storage.objects;

-- Recreate with proper service_role restriction
CREATE POLICY "Service role can upload quote PDFs"
ON storage.objects FOR INSERT TO service_role
WITH CHECK (bucket_id = 'quote-pdfs');

CREATE POLICY "Service role can update quote PDFs"
ON storage.objects FOR UPDATE TO service_role
USING (bucket_id = 'quote-pdfs');
