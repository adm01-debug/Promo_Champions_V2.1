-- Adicionar colunas faltantes na league_members se não existirem
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='league_members' AND column_name='last_reset_xp') THEN
        ALTER TABLE public.league_members ADD COLUMN last_reset_xp INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='league_members' AND column_name='current_streak') THEN
        ALTER TABLE public.league_members ADD COLUMN current_streak INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='league_members' AND column_name='max_streak') THEN
        ALTER TABLE public.league_members ADD COLUMN max_streak INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='league_members' AND column_name='promoted_at') THEN
        ALTER TABLE public.league_members ADD COLUMN promoted_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='league_members' AND column_name='demoted_at') THEN
        ALTER TABLE public.league_members ADD COLUMN demoted_at TIMESTAMPTZ;
    END IF;
END $$;

-- Tabela de Histórico (caso não exista)
CREATE TABLE IF NOT EXISTS public.league_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
    league_id UUID REFERENCES public.leagues(id),
    rank_achieved INT,
    xp_earned INT,
    season_date DATE DEFAULT CURRENT_DATE,
    promoted BOOLEAN DEFAULT false,
    demoted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.league_history ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own league history') THEN
        CREATE POLICY "Users can view their own league history" ON public.league_history FOR SELECT 
        USING (salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()));
    END IF;
END $$;

-- Função para Reset Semanal de Ligas
CREATE OR REPLACE FUNCTION public.process_weekly_league_reset()
RETURNS void AS $$
DECLARE
    league_record RECORD;
    member_record RECORD;
    next_league_id UUID;
    prev_league_id UUID;
    total_members INT;
    top_slots INT;
    bottom_slots INT;
    current_rank INT;
BEGIN
    -- 1. Salvar histórico da semana anterior
    INSERT INTO public.league_history (salesperson_id, league_id, rank_achieved, xp_earned, season_date)
    SELECT salesperson_id, league_id, 0, weekly_xp, (CURRENT_DATE - INTERVAL '1 day')::DATE
    FROM public.league_members;

    -- 2. Processar Ligas Individualmente (Promoção/Rebaixamento)
    FOR league_record IN SELECT * FROM public.leagues ORDER BY tier DESC LOOP
        -- Pegar configurações da liga
        top_slots := league_record.promotion_slots;
        bottom_slots := league_record.demotion_slots;

        current_rank := 1;
        FOR member_record IN 
            SELECT * FROM public.league_members 
            WHERE league_id = league_record.id 
            ORDER BY weekly_xp DESC 
        LOOP
            -- Determinar Próxima Liga
            IF current_rank <= top_slots AND league_record.tier < 5 THEN
                SELECT id INTO next_league_id FROM public.leagues WHERE tier = league_record.tier + 1;
                IF next_league_id IS NOT NULL THEN
                    UPDATE public.league_members SET league_id = next_league_id, promoted_at = now() WHERE id = member_record.id;
                    UPDATE public.league_history SET promoted = true WHERE salesperson_id = member_record.salesperson_id AND season_date = (CURRENT_DATE - INTERVAL '1 day')::DATE;
                END IF;
            ELSIF current_rank > (SELECT count(*) FROM public.league_members WHERE league_id = league_record.id) - bottom_slots AND league_record.tier > 1 THEN
                SELECT id INTO prev_league_id FROM public.leagues WHERE tier = league_record.tier - 1;
                IF prev_league_id IS NOT NULL THEN
                    UPDATE public.league_members SET league_id = prev_league_id, demoted_at = now() WHERE id = member_record.id;
                    UPDATE public.league_history SET demoted = true WHERE salesperson_id = member_record.salesperson_id AND season_date = (CURRENT_DATE - INTERVAL '1 day')::DATE;
                END IF;
            END IF;

            UPDATE public.league_history SET rank_achieved = current_rank 
            WHERE salesperson_id = member_record.salesperson_id AND season_date = (CURRENT_DATE - INTERVAL '1 day')::DATE;
            
            current_rank := current_rank + 1;
        END LOOP;
    END LOOP;

    -- 3. Zerar XP Semanal
    UPDATE public.league_members SET weekly_xp = 0, last_reset_xp = weekly_xp, updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar XP Semanal na Liga quando o Vendedor ganha XP
CREATE OR REPLACE FUNCTION public.sync_weekly_xp()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.league_members (salesperson_id, weekly_xp, updated_at)
    VALUES (NEW.salesperson_id, NEW.xp_amount, now())
    ON CONFLICT (salesperson_id) 
    DO UPDATE SET 
        weekly_xp = league_members.weekly_xp + NEW.xp_amount,
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar existência de xp_logs para trigger
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'xp_logs') THEN
        DROP TRIGGER IF EXISTS tr_sync_weekly_xp ON public.xp_logs;
        CREATE TRIGGER tr_sync_weekly_xp
        AFTER INSERT ON public.xp_logs
        FOR EACH ROW EXECUTE FUNCTION public.sync_weekly_xp();
    END IF;
END $$;
