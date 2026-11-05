CREATE OR REPLACE FUNCTION public.notify_asset_influence_boost()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    v_deals_count BIGINT;
    v_asset_title TEXT;
BEGIN
    -- Verifica quantos deals esse asset influenciou
    SELECT COUNT(DISTINCT deal_id) INTO v_deals_count 
    FROM asset_usage_logs 
    WHERE asset_id = NEW.asset_id;

    -- Notifica a cada 10 deals influenciados
    IF v_deals_count > 0 AND v_deals_count % 10 = 0 THEN
        SELECT title INTO v_asset_title FROM sales_enablement_assets WHERE id = NEW.asset_id;
        
        INSERT INTO public.notifications (
            user_id,
            title,
            message,
            category,
            priority,
            action_url
        )
        SELECT 
            sp.id,
            '🔥 Boost de Eficiência: ' || v_asset_title,
            'Este material acaba de influenciar seu ' || v_deals_count || 'º deal fechado! Considere usá-lo mais vezes.',
            'sales',
            'medium',
            '/sales-enablement'
        FROM salespeople sp;
    END IF;
    RETURN NEW;
END;
$function$
