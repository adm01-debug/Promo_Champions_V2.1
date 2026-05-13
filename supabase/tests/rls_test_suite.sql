-- SQL Test Suite using pgTAP style (compatible with Supabase CLI test)
BEGIN;

-- Function to check if RLS is enabled on a table
CREATE OR REPLACE FUNCTION check_rls(tbl_name text) RETURNS boolean AS $$
DECLARE
    is_enabled boolean;
BEGIN
    SELECT relrowsecurity INTO is_enabled
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = tbl_name;
    RETURN is_enabled;
END;
$$ LANGUAGE plpgsql;

-- Test suite
DO $$
DECLARE
    tbl RECORD;
    critical_tables text[] := ARRAY[
        'api_tokens', 'automation_workflows', 'clients', 'coaching_sessions', 
        'daily_challenges', 'daily_metrics', 'win_loss_insights', 
        'active_power_ups', 'sdr_performance_settings', 'sdr_alert_history',
        'winloss_webhook_alerts', 'win_loss_patterns', 'agenda_events',
        'buying_committee_members', 'race_cars', 'race_daily_snapshots',
        'race_user_preferences', 'call_recordings', 'ai_agent_actions',
        'call_insights', 'call_logs', 'chat_conversations', 'chat_messages',
        'coaching_actions', 'coaching_opportunities', 'contact_engagement_score',
        'commission_rules', 'commissions', 'daily_challenge_progress',
        'commercial_approval_requests'
    ];
    tbl_name text;
    missing_rls text[] := ARRAY[]::text[];
BEGIN
    FOREACH tbl_name IN ARRAY critical_tables LOOP
        IF NOT check_rls(tbl_name) THEN
            missing_rls := array_append(missing_rls, tbl_name);
        END IF;
    END LOOP;

    IF array_length(missing_rls, 1) > 0 THEN
        RAISE EXCEPTION 'As seguintes tabelas críticas não possuem RLS habilitado: %', missing_rls;
    ELSE
        RAISE NOTICE 'Sucesso: Todas as 30 tabelas críticas possuem RLS habilitado.';
    END IF;
END $$;

ROLLBACK;
