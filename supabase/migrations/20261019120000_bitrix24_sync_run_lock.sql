-- Lock de execução do bitrix24-sync.
--
-- Dois runs sobrepostos do bitrix24-sync liam o mesmo lote de pendências
-- (sales.external_deal_id IS NULL, clients sem icp_data.bitrix_id) e chamavam
-- crm.deal.add / crm.company.add em duplicata no Bitrix; o pull de companies
-- ainda podia estourar ux_icp_data_bitrix_id abortando a sync inteira.
--
-- Advisory lock de sessão não funciona aqui: cada chamada PostgREST cai numa
-- conexão potencialmente diferente do pool, então o lock precisa ser um ESTADO
-- persistido. Modelo: uma linha 'running' por vez em bitrix24_sync_runs,
-- garantida por índice parcial único; a claim usa pg_advisory_xact_lock para
-- serializar a decisão e rebaixa runs abandonadas (edge function morta) após
-- _stale_after. O release marca a linha ao final do run.

CREATE TABLE IF NOT EXISTS public.bitrix24_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'running',
  request_id text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Só uma run 'running' por vez — esta é a garantia real de exclusão mútua.
CREATE UNIQUE INDEX IF NOT EXISTS ux_bitrix24_sync_runs_running
  ON public.bitrix24_sync_runs (status)
  WHERE status = 'running';

ALTER TABLE public.bitrix24_sync_runs ENABLE ROW LEVEL SECURITY;

-- Sem policies: a tabela só é acessível via service_role (que bypassa RLS) —
-- o estado interno do lock não é dado de usuário.

-- Reserva a run corrente. Retorna o id da run ou NULL quando já existe uma
-- run 'running' não expirada (run sobreposta deve abortar com resposta
-- honesta, não correr em paralelo).
CREATE OR REPLACE FUNCTION public.bitrix24_sync_claim(
  _request_id text DEFAULT NULL,
  _stale_after interval DEFAULT '20 minutes'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid;
BEGIN
  -- Serializa claims concorrentes: dois claims simultâneos passam um de cada
  -- vez pelo bloco cleanup+insert e o índice único decide o vencedor.
  PERFORM pg_advisory_xact_lock(hashtextextended('bitrix24_sync_claim', 0));

  -- Edge function morta no meio do run nunca chama release: a linha 'running'
  -- órfã viraria bloqueio permanente sem este rebaixamento por idade.
  UPDATE public.bitrix24_sync_runs
     SET status = 'stale',
         finished_at = now()
   WHERE status = 'running'
     AND started_at < now() - _stale_after;

  INSERT INTO public.bitrix24_sync_runs (status, request_id)
  VALUES ('running', _request_id)
  RETURNING id INTO _id;

  RETURN _id;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NULL;
END;
$$;

-- Encerra a run reservada. Status finais: 'done' (sucesso) ou 'error'.
CREATE OR REPLACE FUNCTION public.bitrix24_sync_release(
  _id uuid,
  _status text DEFAULT 'done'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.bitrix24_sync_runs
     SET status = COALESCE(_status, 'done'),
         finished_at = now()
   WHERE id = _id
     AND status = 'running';
END;
$$;

REVOKE ALL ON FUNCTION public.bitrix24_sync_claim(text, interval) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.bitrix24_sync_release(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bitrix24_sync_claim(text, interval) TO service_role;
GRANT EXECUTE ON FUNCTION public.bitrix24_sync_release(uuid, text) TO service_role;
