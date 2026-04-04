
-- Fix 1: Remove duplicate email-based INSERT policy on notification_preferences
DROP POLICY IF EXISTS "Users can insert own notification_preferences" ON public.notification_preferences;

-- Fix 2: Consolidate duplicate SELECT policies on document_signers
DROP POLICY IF EXISTS "Users can view signers of their documents" ON public.document_signers;
