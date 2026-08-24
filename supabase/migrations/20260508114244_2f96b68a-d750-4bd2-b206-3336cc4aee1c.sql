-- Add scheduled effectiveness and resolution timestamp to commercial approvals
ALTER TABLE public.commercial_approval_requests 
ADD COLUMN IF NOT EXISTS effective_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Add comment to clarify usage
COMMENT ON COLUMN public.commercial_approval_requests.effective_at IS 'When the approved change should actually take effect in the system.';
