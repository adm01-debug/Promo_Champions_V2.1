-- [STATUS-CANON] sales.status como coluna canônica; deal_status vira GENERATED.
--
-- Contexto: sales tinha duas colunas de status sincronizadas pelo trigger
-- tr_sync_sales_statuses (bidirecional, best-effort — divergiam quando o valor
-- de status não existia no enum deal_status: 'won', 'closed', 'cancelled',
-- 'lead', 'prospecting'). Todo o frontend e praticamente todas as edge
-- functions leem/escrevem apenas `status` (texto com CHECK sales_status_check);
-- deal_status tinha 0 referências no frontend. Canônica = status.
--
-- Expand-contract: deal_status permanece legível por 1 release como coluna
-- GENERATED derivada de status — os leitores legados (triggers de gamificação,
-- RPCs, functions) continuam funcionando. O DROP definitivo fica documentado
-- para o próximo pacote, após migrar os leitores restantes para `status`.
--
-- Efeitos:
--   1) tr_sync_sales_statuses removido (a coluna gerada torna a sincronização
--      desnecessária e impossível de escrever diretamente).
--   2) tr_auto_create_commission era AFTER UPDATE OF deal_status — colunas
--      generated nunca são alvo de SET, então o trigger deixaria de disparar;
--      recriado como AFTER UPDATE preservando o mesmo WHEN.
--   3) Linhas com status vazio/nulo e deal_status preenchido têm status
--      recuperado de deal_status antes da conversão (consolidação de
--      divergentes; nas demais linhas status — canônico — prevalece).

UPDATE public.sales
SET status = deal_status::text
WHERE deal_status IS NOT NULL
  AND (status IS NULL OR btrim(status) = '');

DROP TRIGGER IF EXISTS tr_sync_sales_statuses ON public.sales;
DROP FUNCTION IF EXISTS public.sync_sales_statuses();

-- Triggers que referenciam deal_status precisam cair ANTES do DROP COLUMN
-- (dependência em WHEN/UPDATE OF bloqueia o drop da coluna).
DROP TRIGGER IF EXISTS trg_broadcast_sale_completed ON public.sales;
DROP TRIGGER IF EXISTS tr_auto_create_commission ON public.sales;
DROP TRIGGER IF EXISTS tr_auto_create_commission_insert ON public.sales;

-- Recria deal_status como GENERATED ALWAYS — espelho derivado de status.
-- Valores fora do enum deal_status colapsam para o equivalente mais próximo:
-- 'won'/'closed' -> completed, 'cancelled' -> lost,
-- 'lead'/'prospecting'/'open'/'in_progress' -> pending.
ALTER TABLE public.sales DROP COLUMN IF EXISTS deal_status;
ALTER TABLE public.sales ADD COLUMN deal_status public.deal_status
  GENERATED ALWAYS AS (
    CASE
      WHEN status IN ('completed', 'won', 'closed') THEN 'completed'::public.deal_status
      WHEN status IN ('lost', 'cancelled')          THEN 'lost'::public.deal_status
      WHEN status = 'qualified'                     THEN 'qualified'::public.deal_status
      WHEN status = 'proposal'                      THEN 'proposal'::public.deal_status
      WHEN status = 'negotiation'                   THEN 'negotiation'::public.deal_status
      WHEN status IN ('pending', 'lead', 'prospecting', 'open', 'in_progress')
                                                    THEN 'pending'::public.deal_status
      ELSE NULL
    END
  ) STORED;

CREATE TRIGGER tr_auto_create_commission
  AFTER UPDATE ON public.sales
  FOR EACH ROW
  WHEN (NEW.deal_status = 'completed' AND OLD.deal_status IS DISTINCT FROM 'completed')
  EXECUTE FUNCTION public.auto_create_commission();

CREATE TRIGGER tr_auto_create_commission_insert
  AFTER INSERT ON public.sales
  FOR EACH ROW
  WHEN (NEW.deal_status = 'completed')
  EXECUTE FUNCTION public.auto_create_commission();

CREATE TRIGGER trg_broadcast_sale_completed
  AFTER INSERT OR UPDATE OF status, deal_status ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.broadcast_sale_completed();
