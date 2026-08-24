
REVOKE EXECUTE ON FUNCTION public.fn_cleanup_webhook_dedupe() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_cleanup_webhook_dedupe() FROM anon;
REVOKE EXECUTE ON FUNCTION public.fn_cleanup_webhook_dedupe() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.fn_cleanup_webhook_dedupe() TO service_role;
