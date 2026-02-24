
-- Add pdf_url column to quotes
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS pdf_url text;

-- Create storage bucket for quote PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('quote-pdfs', 'quote-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to quote PDFs
CREATE POLICY "Quote PDFs are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'quote-pdfs');

-- Allow service role to upload (edge functions use service role key)
CREATE POLICY "Service role can upload quote PDFs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'quote-pdfs');

CREATE POLICY "Service role can update quote PDFs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'quote-pdfs');
