-- Revoke execute on all functions in public from PUBLIC
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon;

-- Specifically revoke from existing functions if needed (this can be tedious, so we focus on sensitive ones)
REVOKE EXECUTE ON FUNCTION public.disable_totp() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.initialize_totp(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.disable_sms() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_pending_reset_request(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_mfa_status() FROM PUBLIC;

-- Grant execute to authenticated and service_role
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
