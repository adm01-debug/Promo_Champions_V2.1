-- Corrigir a função auto_victory_post para atualizar a tabela correta
CREATE OR REPLACE FUNCTION public.auto_victory_post()
RETURNS TRIGGER AS $$
BEGIN
    -- Big Sale Victory (> 5000)
    IF TG_TABLE_NAME = 'sales' AND NEW.deal_status = 'won' AND (OLD.deal_status IS DISTINCT FROM NEW.deal_status) AND NEW.amount >= 5000 THEN
        INSERT INTO public.victory_feed (salesperson_id, title, description, value, event_type)
        VALUES (
            NEW.salesperson_id,
            'Fechamento Épico! 🚀',
            'Selou um deal de ' || COALESCE(NEW.product_name, 'Produto') || ' para ' || COALESCE(NEW.client_name, 'Cliente'),
            NEW.amount,
            'sale'
        );
        
        -- Award a Prize Wheel spin for big sales in the correct table
        INSERT INTO public.available_spins (salesperson_id, spins_count, updated_at)
        VALUES (NEW.salesperson_id, 1, now())
        ON CONFLICT (salesperson_id) 
        DO UPDATE SET spins_count = available_spins.spins_count + 1, updated_at = now();
    END IF;

    -- Battle Victory
    IF TG_TABLE_NAME = 'sales_battles' AND NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM NEW.status) AND NEW.winner_id IS NOT NULL THEN
        INSERT INTO public.victory_feed (salesperson_id, title, description, event_type)
        VALUES (
            NEW.winner_id,
            'Campeão da Arena! 🏆',
            'Venceu a batalha: ' || NEW.title,
            'achievement'
        );
        
        -- Award XP and Spin
        INSERT INTO public.xp_history (salesperson_id, xp_amount, source_type, source_id, description)
        VALUES (NEW.winner_id, COALESCE(NEW.xp_reward, 100), 'battle', NEW.id, 'Vitória na Batalha: ' || NEW.title);

        INSERT INTO public.available_spins (salesperson_id, spins_count, updated_at)
        VALUES (NEW.winner_id, 2, now())
        ON CONFLICT (salesperson_id) 
        DO UPDATE SET spins_count = available_spins.spins_count + 2, updated_at = now();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sincronizar XP Total automaticamente quando houver inserção no histórico
CREATE OR REPLACE FUNCTION public.sync_total_xp()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.salesperson_xp (salesperson_id, total_xp, updated_at)
    VALUES (NEW.salesperson_id, NEW.xp_amount, now())
    ON CONFLICT (salesperson_id) 
    DO UPDATE SET 
        total_xp = salesperson_xp.total_xp + NEW.xp_amount,
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_total_xp ON public.xp_history;
CREATE TRIGGER tr_sync_total_xp
AFTER INSERT ON public.xp_history
FOR EACH ROW EXECUTE FUNCTION public.sync_total_xp();

-- Corrigir a função maintain_sales_streaks para dar giros corretamente
CREATE OR REPLACE FUNCTION public.maintain_sales_streaks()
RETURNS TRIGGER AS $$
DECLARE
    v_last_activity TIMESTAMP;
    v_current_streak INTEGER;
BEGIN
    -- Obter a streak atual
    SELECT last_activity_at, current_streak INTO v_last_activity, v_current_streak
    FROM public.sales_streaks
    WHERE salesperson_id = NEW.salesperson_id;

    IF NOT FOUND THEN
        INSERT INTO public.sales_streaks (salesperson_id, current_streak, last_activity_at)
        VALUES (NEW.salesperson_id, 1, now());
    ELSE
        -- Se a última atividade foi ontem, incrementa
        IF v_last_activity::date = (now() - INTERVAL '1 day')::date THEN
            UPDATE public.sales_streaks
            SET current_streak = current_streak + 1,
                last_activity_at = now(),
                longest_streak = GREATEST(longest_streak, current_streak + 1)
            WHERE salesperson_id = NEW.salesperson_id;
            
            -- Ganha um giro a cada 7 dias de streak
            IF (v_current_streak + 1) % 7 = 0 THEN
                INSERT INTO public.available_spins (salesperson_id, spins_count, updated_at)
                VALUES (NEW.salesperson_id, 1, now())
                ON CONFLICT (salesperson_id) 
                DO UPDATE SET spins_count = available_spins.spins_count + 1, updated_at = now();
            END IF;
        -- Se a última atividade foi hoje, apenas atualiza o timestamp
        ELSIF v_last_activity::date = now()::date THEN
            UPDATE public.sales_streaks
            SET last_activity_at = now()
            WHERE salesperson_id = NEW.salesperson_id;
        -- Se falhou dias, reseta
        ELSE
            UPDATE public.sales_streaks
            SET current_streak = 1,
                last_activity_at = now()
            WHERE salesperson_id = NEW.salesperson_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que as tabelas de gamificação tenham RLS habilitado
ALTER TABLE IF EXISTS public.sales_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.battle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.victory_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sales_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prize_wheel_spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.available_spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.salesperson_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.xp_history ENABLE ROW LEVEL SECURITY;

-- Políticas Básicas (Permitir leitura por todos, inserção controlada)
DO $$ 
BEGIN 
    -- Victory Feed: Todos veem, apenas o sistema insere (via triggers) ou o próprio user
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view victory feed') THEN
        CREATE POLICY "Anyone can view victory feed" ON public.victory_feed FOR SELECT USING (true);
    END IF;

    -- XP & Spins: Usuários veem o seu próprio, sistema gerencia
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own XP') THEN
        CREATE POLICY "Users can view their own XP" ON public.salesperson_xp FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own spins') THEN
        CREATE POLICY "Users can view their own spins" ON public.available_spins FOR SELECT 
        USING (salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()));
    END IF;
END $$;
