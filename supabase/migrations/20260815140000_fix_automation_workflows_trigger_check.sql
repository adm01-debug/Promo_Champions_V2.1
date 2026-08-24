-- src/hooks/automation/useAutomationWorkflows.ts's TriggerType includes
-- 'proposal_opened' and 'price_clicked' (used by AutomationBuilder.tsx's
-- trigger Select), but the check constraint only allowed 6 of the 8 values,
-- so creating a workflow with either of those two triggers always failed.

ALTER TABLE public.automation_workflows DROP CONSTRAINT automation_workflows_trigger_type_check;

ALTER TABLE public.automation_workflows
  ADD CONSTRAINT automation_workflows_trigger_type_check
  CHECK (trigger_type = ANY (ARRAY['deal_created', 'stage_changed', 'activity_logged', 'scheduled', 'manual', 'no_activity_days', 'proposal_opened', 'price_clicked']));
