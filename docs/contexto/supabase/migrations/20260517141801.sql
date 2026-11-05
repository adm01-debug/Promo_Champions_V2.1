-- Função para verificar se é a primeira venda concluída de um cliente
CREATE OR REPLACE FUNCTION public.check_is_first_activation(p_client_id UUID, p_sale_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.sales
    WHERE client_id = p_client_id
    AND (status = 'completed' OR status = 'won' OR deal_status = 'completed')
    AND id != p_sale_id;
    
    RETURN v_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Atualização da função de processamento de comissões
CREATE OR REPLACE FUNCTION public.handle_sale_commissions()
RETURNS TRIGGER AS $$
DECLARE
    v_is_activation BOOLEAN;
    v_sdr_commission NUMERIC := 0;
    v_closer_commission NUMERIC := 0;
    v_rule_percentage NUMERIC;
    v_rule_id UUID;
    v_target_closer_id UUID;
BEGIN
    -- Determinar se a venda está sendo concluída agora
    IF (
        (TG_OP = 'UPDATE' AND (NEW.status IN ('completed', 'won') OR NEW.deal_status = 'completed') AND (OLD.status NOT IN ('completed', 'won') AND OLD.deal_status != 'completed'))
        OR 
        (TG_OP = 'INSERT' AND (NEW.status IN ('completed', 'won') OR NEW.deal_status = 'completed'))
    ) THEN
        
        -- Definir quem é o Closer (prioridade para closer_id, fallback para salesperson_id)
        v_target_closer_id := COALESCE(NEW.closer_id, NEW.salesperson_id);
        
        -- Se não tiver closer, não processa comissão
        IF v_target_closer_id IS NULL THEN
            RETURN NEW;
        END IF;

        -- Determinar se é a primeira ativação (usar coluna se disponível, senão calcular)
        IF NEW.is_first_sale IS NOT NULL THEN
            v_is_activation := NEW.is_first_sale;
        ELSE
            -- Se for por client_id
            IF NEW.client_id IS NOT NULL THEN
                v_is_activation := public.check_is_first_activation(NEW.client_id, NEW.id);
            ELSE
                v_is_activation := TRUE; -- Default para true se não tiver histórico
            END IF;
        END IF;

        -- Buscar regra de comissão aplicável (simplificado para o exemplo, pode ser expandido)
        SELECT id, percentage INTO v_rule_id, v_rule_percentage 
        FROM public.commission_rules 
        WHERE is_active = true 
        AND (salesperson_id = v_target_closer_id OR salesperson_id IS NULL)
        ORDER BY priority DESC LIMIT 1;
        
        IF v_rule_percentage IS NULL THEN v_rule_percentage := 5.0; END IF;

        -- Lógica Closer: Sempre ganha comissão
        v_closer_commission := (NEW.amount * v_rule_percentage / 100);
        
        -- Registrar comissão do Closer
        INSERT INTO public.commissions (
            sale_id, 
            salesperson_id, 
            rule_id,
            base_amount, 
            percentage, 
            commission_amount, 
            status, 
            is_first_sale
        ) VALUES (
            NEW.id, 
            v_target_closer_id, 
            v_rule_id,
            NEW.amount, 
            v_rule_percentage, 
            v_closer_commission, 
            'pending', 
            v_is_activation
        );

        -- Lógica SDR: Só ganha comissão se for Ativação (is_first_sale)
        IF v_is_activation AND NEW.sdr_id IS NOT NULL AND NEW.sdr_id != v_target_closer_id THEN
            -- SDR ganha o mesmo percentual configurado para a ativação
            v_sdr_commission := (NEW.amount * v_rule_percentage / 100);
            
            INSERT INTO public.commissions (
                sale_id, 
                salesperson_id, 
                rule_id,
                base_amount, 
                percentage, 
                commission_amount, 
                status, 
                is_first_sale
            ) VALUES (
                NEW.id, 
                NEW.sdr_id, 
                v_rule_id,
                NEW.amount, 
                v_rule_percentage, 
                v_sdr_commission, 
                'pending', 
                TRUE
            );
        END IF;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Garantir que apenas este trigger de comissão esteja ativo para evitar duplicidade
-- Desabilitamos outros que possam estar fazendo o mesmo
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_auto_create_commission') THEN
        ALTER TABLE public.sales DISABLE TRIGGER tr_auto_create_commission;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_auto_create_commission_insert') THEN
        ALTER TABLE public.sales DISABLE TRIGGER tr_auto_create_commission_insert;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auto_create_commission') THEN
        ALTER TABLE public.sales DISABLE TRIGGER trg_auto_create_commission;
    END IF;
END $$;
