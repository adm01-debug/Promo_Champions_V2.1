-- Create digital_signatures table
CREATE TABLE public.digital_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'signed', 'rejected', 'expired')),
  file_url TEXT,
  created_by UUID REFERENCES public.salespeople(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE
);

-- Create signers table for document signers
CREATE TABLE public.document_signers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.digital_signatures(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'rejected')),
  signed_at TIMESTAMP WITH TIME ZONE,
  sign_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.digital_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_signers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for digital_signatures
CREATE POLICY "Authenticated users can read digital_signatures" 
ON public.digital_signatures 
FOR SELECT 
USING (is_authenticated());

CREATE POLICY "Authenticated users can insert digital_signatures" 
ON public.digital_signatures 
FOR INSERT 
WITH CHECK (is_authenticated());

CREATE POLICY "Authenticated users can update digital_signatures" 
ON public.digital_signatures 
FOR UPDATE 
USING (is_authenticated());

CREATE POLICY "Admins and managers can delete digital_signatures" 
ON public.digital_signatures 
FOR DELETE 
USING (is_admin_or_manager(auth.uid()));

-- RLS Policies for document_signers
CREATE POLICY "Authenticated users can read document_signers" 
ON public.document_signers 
FOR SELECT 
USING (is_authenticated());

CREATE POLICY "Authenticated users can insert document_signers" 
ON public.document_signers 
FOR INSERT 
WITH CHECK (is_authenticated());

CREATE POLICY "Authenticated users can update document_signers" 
ON public.document_signers 
FOR UPDATE 
USING (is_authenticated());

CREATE POLICY "Admins and managers can delete document_signers" 
ON public.document_signers 
FOR DELETE 
USING (is_admin_or_manager(auth.uid()));

-- Indexes
CREATE INDEX idx_digital_signatures_status ON public.digital_signatures(status);
CREATE INDEX idx_digital_signatures_created_by ON public.digital_signatures(created_by);
CREATE INDEX idx_document_signers_document ON public.document_signers(document_id);
CREATE INDEX idx_document_signers_email ON public.document_signers(email);

-- Trigger for updated_at
CREATE TRIGGER update_digital_signatures_updated_at
BEFORE UPDATE ON public.digital_signatures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();