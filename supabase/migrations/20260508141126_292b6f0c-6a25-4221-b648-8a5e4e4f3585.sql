-- Adicionar user_id à tabela clients se não existir (para notificações direcionadas)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'clients' AND column_name = 'user_id') THEN
    ALTER TABLE public.clients ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Tabela para logs detalhados por lead
CREATE TABLE IF NOT EXISTS public.lead_detailed_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'interaction', 'trigger', 'transition', 'task_created', 'alert'
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Habilitar RLS para lead_detailed_logs
ALTER TABLE public.lead_detailed_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logs of their clients" 
ON public.lead_detailed_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.clients c 
    WHERE c.id = lead_detailed_logs.client_id 
    AND (c.user_id = auth.uid() OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'))
  )
);

CREATE POLICY "Users can insert logs for their clients" 
ON public.lead_detailed_logs 
FOR INSERT 
WITH CHECK (true);

-- Adicionar configurações de alerta multi-canal nas regras de funil
ALTER TABLE public.cadence_funnel_rules 
ADD COLUMN IF NOT EXISTS notify_push BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notify_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS alert_priority TEXT DEFAULT 'normal'; -- 'low', 'normal', 'high', 'urgent'

-- Adicionar resultado da ligação nas tarefas de cadência
ALTER TABLE public.cadence_tasks 
ADD COLUMN IF NOT EXISTS call_result TEXT, -- 'answered', 'no_answer', 'interested', 'scheduled', 'busy', 'wrong_number'
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal'; -- Para gerenciar a fila "Ligar Agora"

-- Função para registrar log de transição de etapa (Trigger)
CREATE OR REPLACE FUNCTION public.log_lead_stage_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.funnel_stage IS DISTINCT FROM NEW.funnel_stage THEN
    INSERT INTO public.lead_detailed_logs (client_id, event_type, action, details, created_by)
    VALUES (
      NEW.id, 
      'transition', 
      'Stage Change', 
      jsonb_build_object('from', OLD.funnel_stage, 'to', NEW.funnel_stage),
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para log de transição
DROP TRIGGER IF EXISTS tr_log_lead_stage_transition ON public.clients;
CREATE TRIGGER tr_log_lead_stage_transition
AFTER UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.log_lead_stage_transition();
