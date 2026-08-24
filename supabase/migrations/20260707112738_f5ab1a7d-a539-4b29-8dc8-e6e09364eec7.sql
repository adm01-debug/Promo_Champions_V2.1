REVOKE EXECUTE ON FUNCTION public.fn_auto_map_inbound_seller() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_auto_map_inbound_seller() FROM anon;
REVOKE EXECUTE ON FUNCTION public.fn_auto_map_inbound_seller() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.fn_auto_map_inbound_seller() TO service_role;