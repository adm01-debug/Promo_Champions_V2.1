-- Win/Loss Intelligence: colunas necessárias para analyze-win-loss edge function.
-- Idempotente — só adiciona se não existir.
-- Resolve 400 Bad Request / analyze-win-loss retornando zero linhas.

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS stage text,
  ADD COLUMN IF NOT EXISTS segment text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS loss_reason text,
  ADD COLUMN IF NOT EXISTS competitor_name text,
  ADD COLUMN IF NOT EXISTS closed_at timestamp with time zone;

-- Backfill segment a partir do amount onde ainda não estiver preenchido.
UPDATE public.sales
   SET segment = CASE
     WHEN amount IS NULL THEN 'smb'
     WHEN amount >= 100000 THEN 'enterprise'
     WHEN amount >= 25000 THEN 'mid'
     ELSE 'smb'
   END
 WHERE segment IS NULL;

-- Backfill closed_at a partir de updated_at (proxy razoável) onde ainda não tiver.
UPDATE public.sales
   SET closed_at = updated_at
 WHERE closed_at IS NULL
   AND status IN ('won','lost','completed','closed');

-- Backfill stage padrão para que os gráficos popularem.
UPDATE public.sales
   SET stage = COALESCE(stage,
     CASE status
       WHEN 'prospecting' THEN 'Prospecção'
       WHEN 'lead'        THEN 'Lead'
       WHEN 'qualified'   THEN 'Qualificação'
       WHEN 'proposal'    THEN 'Proposta'
       WHEN 'negotiation' THEN 'Negociação'
       WHEN 'won'         THEN 'Ganho'
       WHEN 'completed'   THEN 'Concluído'
       WHEN 'lost'        THEN 'Perdido'
       WHEN 'closed'      THEN 'Fechado'
       ELSE status
     END)
 WHERE stage IS NULL;
