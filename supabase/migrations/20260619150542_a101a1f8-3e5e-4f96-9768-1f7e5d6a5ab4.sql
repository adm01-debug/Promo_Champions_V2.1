REVOKE EXECUTE ON FUNCTION public.generate_mfa_backup_codes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_current_user_email() FROM PUBLIC, anon, authenticated;