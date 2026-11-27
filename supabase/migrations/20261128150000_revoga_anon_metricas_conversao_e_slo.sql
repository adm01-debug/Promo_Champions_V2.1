-- Fecha a leitura anonima de duas metricas internas que sobreviveram as ondas
-- de revogacao do papel anon (QA 025-028 / 191-198).
--
-- Encontrado por varredura exaustiva: das 446 tabelas/views de public, so duas
-- devolvem linhas para a chave publishable (papel anon):
--
--   GET /rest/v1/stage_conversion_metrics  -> 206, Content-Range 0-0/6
--     dados de negocio reais (from_stage/to_stage/entered_count/converted_count/
--     conversion_rate das linhas globais com owner_id IS NULL)
--   GET /rest/v1/v_platform_slo            -> 206, Content-Range 0-0/30
--     serie de 30 dias do SLO (valores zerados sob security_invoker, mas a
--     estrutura e o total da serie nao deveriam ser publicos)
--
-- Causa exata, nao hipotese:
--   1. GRANT SELECT ... TO anon nas duas (schema.sql:33523 e :33900).
--   2. A policy de SELECT de stage_conversion_metrics e TO PUBLIC
--      (schema.sql:30977) -- e PUBLIC inclui anon. Para anon, auth.uid() e NULL,
--      entao o ramo "owner_id IS NULL" libera as metricas globais.
--      As policies de INSERT/UPDATE tambem sao TO PUBLIC; nelas has_role(NULL, ...)
--      nao passa, mas TO PUBLIC no comando de escrita e a mesma armadilha.
--   A view ja tem security_invoker = true (schema.sql:24008), entao o vazamento
--   vem so do grant anon na propria view.
--
-- O que muda:
--   - stage_conversion_metrics: anon perde tudo; as tres policies passam a ser
--     TO authenticated com a MESMA logica (usuario ve as metricas globais e as
--     proprias; admin/gestor veem tudo). O consumidor e o painel de inteligencia
--     de negocios (src/hooks/deal-intelligence/useStageConversion.ts:37), que roda
--     atras de rota protegida -- authenticated continua lendo igual.
--   - v_platform_slo: anon perde SELECT. O painel usa fn_admin_platform_slo()
--     (src/hooks/admin/usePlatformSLO.ts:32), nao a view direto; authenticated
--     mantem o grant que ja existia.
--
-- Conferido em producao antes de escrever: relrowsecurity = true nas duas, e
-- nenhum consumidor anonimo dessas metricas existe no front.

REVOKE ALL ON TABLE public.stage_conversion_metrics FROM anon;

DROP POLICY IF EXISTS "Users view own and global conversion metrics" ON public.stage_conversion_metrics;
CREATE POLICY "Users view own and global conversion metrics"
  ON public.stage_conversion_metrics
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (((owner_id IS NULL) OR (owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)));

DROP POLICY IF EXISTS "Service role manages conversion metrics insert" ON public.stage_conversion_metrics;
CREATE POLICY "Service role manages conversion metrics insert"
  ON public.stage_conversion_metrics
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)));

DROP POLICY IF EXISTS "Service role manages conversion metrics update" ON public.stage_conversion_metrics;
CREATE POLICY "Service role manages conversion metrics update"
  ON public.stage_conversion_metrics
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)));

REVOKE ALL ON TABLE public.v_platform_slo FROM anon;