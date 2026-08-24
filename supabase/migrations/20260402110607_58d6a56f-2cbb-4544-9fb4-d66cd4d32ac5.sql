
-- =============================================
-- FIX 1: AVATARS BUCKET - Restrict to owner only
-- =============================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete avatars" ON storage.objects;

-- Create secure policies: user can only manage their own folder
CREATE POLICY "Authenticated users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- FIX 2: QUOTE-PDFS BUCKET - Make private
-- =============================================

-- Make bucket private
UPDATE storage.buckets SET public = false WHERE id = 'quote-pdfs';

-- Drop overly permissive SELECT policy
DROP POLICY IF EXISTS "Quote PDFs are publicly accessible" ON storage.objects;

-- Only authenticated users can read quote PDFs
CREATE POLICY "Authenticated users can read quote PDFs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'quote-pdfs');
