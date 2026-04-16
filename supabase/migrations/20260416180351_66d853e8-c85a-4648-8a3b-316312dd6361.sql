
-- Approval Workflows system
CREATE TABLE public.approval_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  workflow_type TEXT NOT NULL DEFAULT 'discount' CHECK (workflow_type IN ('discount', 'proposal', 'exception', 'refund')),
  description TEXT,
  threshold_amount NUMERIC(12,2),
  threshold_percentage NUMERIC(5,2),
  required_approvers INTEGER NOT NULL DEFAULT 1,
  auto_approve_below NUMERIC(12,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.approval_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active workflows"
ON public.approval_workflows FOR SELECT TO authenticated
USING (is_active = true);

CREATE POLICY "Admins and managers can manage workflows"
ON public.approval_workflows FOR ALL TO authenticated
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- Approval Requests
CREATE TABLE public.approval_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.approval_workflows(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id),
  deal_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
  deal_name TEXT,
  requested_value NUMERIC(12,2) NOT NULL,
  original_value NUMERIC(12,2),
  discount_percentage NUMERIC(5,2),
  justification TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'cancelled')),
  current_level INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests"
ON public.approval_requests FOR SELECT TO authenticated
USING (requester_id = auth.uid() OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can create requests"
ON public.approval_requests FOR INSERT TO authenticated
WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Admins and managers can update requests"
ON public.approval_requests FOR UPDATE TO authenticated
USING (public.is_admin_or_manager(auth.uid()));

-- Approval Decisions
CREATE TABLE public.approval_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.approval_requests(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES auth.users(id),
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  comments TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.approval_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view decisions on their requests"
ON public.approval_decisions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.approval_requests ar
    WHERE ar.id = request_id
    AND (ar.requester_id = auth.uid() OR public.is_admin_or_manager(auth.uid()))
  )
);

CREATE POLICY "Admins and managers can create decisions"
ON public.approval_decisions FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_manager(auth.uid()) AND approver_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_approval_workflows_updated_at
  BEFORE UPDATE ON public.approval_workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_approval_requests_updated_at
  BEFORE UPDATE ON public.approval_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for approval requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.approval_requests;
