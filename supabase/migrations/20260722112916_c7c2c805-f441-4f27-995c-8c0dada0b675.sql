-- Hardening: fn_cleanup_webhook_dedupe deve ser executável apenas por service_role.
-- CREATE FUNCTION grants EXECUTE to PUBLIC por default, o que dava acesso indireto
-- a `authenticated`. Revogamos explicitamente.
REVOKE ALL ON FUNCTION public.fn_cleanup_webhook_dedupe() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_cleanup_webhook_dedupe() FROM anon;
REVOKE ALL ON FUNCTION public.fn_cleanup_webhook_dedupe() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.fn_cleanup_webhook_dedupe() TO service_role;