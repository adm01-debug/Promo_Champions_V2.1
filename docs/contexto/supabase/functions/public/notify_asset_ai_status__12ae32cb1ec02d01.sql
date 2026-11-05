CREATE OR REPLACE FUNCTION public.notify_asset_ai_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Se view_count atingir um limite (ex: 50) e for ativo, notifica como 'IA Ativa'
    IF NEW.view_count >= 50 AND OLD.view_count < 50 THEN
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
            '🚀 Novo Material IA Ativa: ' || NEW.title,
            'Este material atingiu o nível de Elite e agora possui suporte neural aprimorado.',
            'ai',
            'high',
            '/sales-enablement'
        FROM public.salespeople sp;
    END IF;
    RETURN NEW;
END;
$function$
