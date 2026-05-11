-- 1. Função para criar notificações de IA Ativa
CREATE OR REPLACE FUNCTION public.notify_asset_ai_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Se view_count atingir um limite (ex: 50) e for ativo, notifica como 'IA Ativa'
    -- (Aqui simplificamos a lógica de IA Ativa baseada em volume/eficiência)
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
        FROM salespeople sp;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_asset_ai_activation
AFTER UPDATE OF view_count ON public.sales_enablement_assets
FOR EACH ROW EXECUTE FUNCTION public.notify_asset_ai_status();

-- 2. Notificação de subida no Ranking (Deals Influenciados)
-- Registramos quando um log de uso acontece
CREATE OR REPLACE FUNCTION public.notify_asset_influence_boost()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_asset_influence_boost
AFTER INSERT ON public.asset_usage_logs
FOR EACH ROW EXECUTE FUNCTION public.notify_asset_influence_boost();
