-- Anexa o trigger canônico de auditoria às duas tabelas de webhook.
--
-- Causa: 20261001193100_audit_log_canonical.sql unificou a auditoria em
-- public.audit_logs e anexou audit_business_changes a 8 tabelas de negócio
-- (activities, client_portfolio, clients, commissions, orders, quotes, sales,
-- user_roles). public.webhooks e public.winloss_webhook_subscriptions ficaram
-- de fora da lista e nunca ganharam trilha: medido em produção,
--   SELECT count(*) FROM public.audit_logs WHERE table_name ILIKE '%webhook%'  -> 0
--   winloss_webhook_subscriptions não tem nenhum trigger não-interno
--   webhooks só tem os dois de updated_at
-- e as escritas vêm direto do front (src/hooks/useWebhooks.ts,
-- src/hooks/win-loss/useWebhookSubscriptions.ts), sem chamar log_audit_event.
--
-- Efeito: hoje ninguém consegue provar quem criou, alterou, desligou ou apagou
-- um webhook — o endereço externo, com segredo próprio, para onde o sistema
-- despeja dados de negócios ganhos e perdidos. Há 1 assinatura ativa.
--
-- Esta migration NÃO ressuscita 20260725000008_audit_log_fixes.sql
-- (archive/audit/rlx-security-fix), que atacava o mesmo problema. Aquele arquivo
-- não aplica mais e seria destrutivo: consulta pg_triggers (não existe), insere
-- em resource_type/resource_id (colunas que public.audit_log não tem) e move
-- public.audit_logs para um schema deprecated — justamente a tabela canônica em
-- que o mecanismo atual grava e que src/hooks/admin/useAuditLogs.ts lê.
--
-- Diferença deliberada em relação às 8 tabelas: aqui o trigger inclui INSERT.
-- Nas tabelas de negócio o canônico é AFTER UPDATE OR DELETE porque a criação de
-- uma venda não é evento de risco; a criação de um webhook é. A função
-- public.audit_log_row_change() já trata TG_OP = 'INSERT'
-- (v_new := CASE WHEN TG_OP IN ('INSERT','UPDATE') ... e RETURN COALESCE(NEW, OLD)),
-- então não precisa de alteração.

DO $do$
DECLARE
  t    text;
  trg  record;
BEGIN
  FOREACH t IN ARRAY ARRAY['webhooks', 'winloss_webhook_subscriptions'] LOOP
    IF to_regclass(format('public.%I', t)) IS NULL THEN
      RAISE NOTICE 'tabela public.% não existe — auditoria não anexada', t;
      CONTINUE;
    END IF;

    -- Mesma limpeza do canônico: remove trigger de auditoria legado antes de
    -- anexar o atual, para não acumular duas trilhas na mesma tabela.
    FOR trg IN
      SELECT tgname
        FROM pg_trigger
       WHERE tgrelid = format('public.%I', t)::regclass
         AND NOT tgisinternal
         AND tgname LIKE 'audit\_%' ESCAPE '\'
    LOOP
      EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', trg.tgname, t);
    END LOOP;

    EXECUTE format('DROP TRIGGER IF EXISTS audit_business_changes ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER audit_business_changes '
      'AFTER INSERT OR UPDATE OR DELETE ON public.%I '
      'FOR EACH ROW EXECUTE FUNCTION public.audit_log_row_change()',
      t
    );
    RAISE NOTICE 'auditoria anexada a public.%', t;
  END LOOP;
END
$do$;
