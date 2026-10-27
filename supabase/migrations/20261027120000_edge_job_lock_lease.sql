-- Lease de execução para edge jobs (1º consumidor: bitrix24-sync).
--
-- Dois runs sobrepostos do bitrix24-sync liam o mesmo lote
-- (`external_deal_id IS NULL`) e duplicavam deals no Bitrix24; o pull de
-- companies podia abortar a sync inteira ao bater em ux_icp_data_bitrix_id.
--
-- O lock é um LEASE EM TABELA (INSERT ... ON CONFLICT atômico no PK + TTL
-- auto-curável), não pg_try_advisory_lock: via PostgREST, acquire e release
-- podem cair em conexões diferentes do pool de sessões — um advisory lock de
-- sessão adquirido numa conexão não seria liberado pela outra e o lock
-- vazado travaria o job para sempre.
--
-- Acesso: apenas service_role (edge functions); try/release via RPC com
-- SECURITY DEFINER + search_path fixo (padrão de hardening do repo).

CREATE TABLE IF NOT EXISTS public.edge_job_locks (
  job_name   text PRIMARY KEY,
  locked_at  timestamptz NOT NULL DEFAULT now(),
  request_id text
);

ALTER TABLE public.edge_job_locks ENABLE ROW LEVEL SECURITY;

-- Só service_role manipula o lease.
CREATE POLICY "Service role can manage job locks"
ON public.edge_job_locks
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Tenta adquirir o lease: sucesso se não houver linha ou se a existente
-- estiver expirada (o dono morreu sem liberar).
CREATE OR REPLACE FUNCTION public.try_edge_job_lock(
  _job_name text,
  _ttl_seconds integer,
  _request_id text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_acquired integer;
BEGIN
  INSERT INTO public.edge_job_locks (job_name, locked_at, request_id)
  VALUES (_job_name, now(), _request_id)
  ON CONFLICT (job_name) DO UPDATE
    SET locked_at = now(),
        request_id = EXCLUDED.request_id
    WHERE edge_job_locks.locked_at < now() - make_interval(secs => _ttl_seconds);
  GET DIAGNOSTICS v_acquired = ROW_COUNT;
  RETURN v_acquired > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_edge_job_lock(_job_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.edge_job_locks WHERE job_name = _job_name;
END;
$$;

REVOKE ALL ON FUNCTION public.try_edge_job_lock(text, integer, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_edge_job_lock(text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.try_edge_job_lock(text, integer, text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.release_edge_job_lock(text)
  TO service_role;
