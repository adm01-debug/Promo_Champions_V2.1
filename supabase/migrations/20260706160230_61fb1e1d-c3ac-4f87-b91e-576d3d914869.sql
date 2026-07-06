
REVOKE ALL ON FUNCTION public.upsert_client_from_quote(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.convert_quote_to_order() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enqueue_v4_callback() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.upsert_client_from_quote(TEXT, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.convert_quote_to_order() TO service_role;
GRANT EXECUTE ON FUNCTION public.enqueue_v4_callback() TO service_role;
