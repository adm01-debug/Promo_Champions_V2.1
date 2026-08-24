-- Table for auditing sale notifications
CREATE TABLE IF NOT EXISTS public.sale_notifications_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES public.sales(id),
    seller_id UUID REFERENCES public.salespeople(id),
    seller_name TEXT,
    sale_amount NUMERIC,
    seller_rank_at_time INT,
    recipient_id UUID REFERENCES public.salespeople(id),
    recipient_rank_at_time INT,
    notification_type TEXT DEFAULT 'in-app',
    status TEXT DEFAULT 'sent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for the audit table
ALTER TABLE public.sale_notifications_audit ENABLE ROW LEVEL SECURITY;

-- Allow only managers and admins to view all audit logs
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Managers can view sale notification audits') THEN
        CREATE POLICY "Managers can view sale notification audits" 
        ON public.sale_notifications_audit 
        FOR SELECT 
        USING (
            EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('admin', 'manager')
            )
        );
    END IF;
END $$;

-- Function to notify all other salespeople about a sale closure (Elite Version)
CREATE OR REPLACE FUNCTION public.notify_sale_completion()
RETURNS TRIGGER AS $$
DECLARE
    v_seller_name TEXT;
    v_sale_amount NUMERIC;
    v_seller_rank INT;
    v_recipient RECORD;
    v_recipient_rank INT;
    v_seller_id UUID;
    v_formatted_amount TEXT;
BEGIN
    -- Detect closure event (deal_status = 'completed')
    IF (TG_OP = 'UPDATE' AND NEW.deal_status = 'completed'::deal_status AND (OLD.deal_status IS NULL OR OLD.deal_status != 'completed'::deal_status)) 
       OR (TG_OP = 'INSERT' AND NEW.deal_status = 'completed'::deal_status) THEN
        
        v_seller_id := NEW.salesperson_id;
        v_sale_amount := NEW.amount;
        v_formatted_amount := 'R$ ' || to_char(v_sale_amount, 'FM999G999G990D00');

        -- Get seller details
        SELECT name INTO v_seller_name FROM public.salespeople WHERE id = v_seller_id;

        -- Calculate seller rank at this exact moment
        SELECT pos INTO v_seller_rank 
        FROM (
            SELECT salesperson_id, RANK() OVER (ORDER BY SUM(amount) DESC) as pos
            FROM public.sales 
            WHERE deal_status = 'completed'::deal_status 
              AND created_at >= date_trunc('month', now())
            GROUP BY salesperson_id
        ) snap WHERE salesperson_id = v_seller_id;

        IF v_seller_rank IS NULL THEN v_seller_rank := 1; END IF;

        -- Notify ALL other active salespeople
        FOR v_recipient IN 
            SELECT sp.id, sp.auth_user_id, sp.name, COALESCE(r.pos, 0) as recipient_rank
            FROM public.salespeople sp
            LEFT JOIN (
                SELECT salesperson_id, RANK() OVER (ORDER BY SUM(amount) DESC) as pos
                FROM public.sales 
                WHERE deal_status = 'completed'::deal_status 
                  AND created_at >= date_trunc('month', now())
                GROUP BY salesperson_id
            ) r ON r.salesperson_id = sp.id
            WHERE sp.is_active = true 
              AND sp.id != v_seller_id 
              AND sp.auth_user_id IS NOT NULL
        LOOP
            v_recipient_rank := v_recipient.recipient_rank;

            -- 1. Insert individual notification
            INSERT INTO public.notifications (
                user_id,
                type,
                category,
                priority,
                title,
                message,
                icon,
                metadata
            ) VALUES (
                v_recipient.auth_user_id,
                'sale_alert',
                'gamification',
                'high',
                '🚀 ' || v_seller_name || ' vendeu!',
                'Fechou ' || v_formatted_amount || '! Rank dele: #' || v_seller_rank || 
                '. Seu rank: ' || CASE WHEN v_recipient_rank = 0 THEN 'S/R' ELSE '#' || v_recipient_rank END || 
                '. Vamos buscar!',
                'Zap',
                jsonb_build_object(
                    'sale_id', NEW.id,
                    'seller_id', v_seller_id,
                    'seller_name', v_seller_name,
                    'amount', v_sale_amount,
                    'seller_rank', v_seller_rank,
                    'recipient_rank', v_recipient_rank,
                    'is_competition_alert', true
                )
            );

            -- 2. Log audit history
            INSERT INTO public.sale_notifications_audit (
                sale_id,
                seller_id,
                seller_name,
                sale_amount,
                seller_rank_at_time,
                recipient_id,
                recipient_rank_at_time,
                notification_type
            ) VALUES (
                NEW.id,
                v_seller_id,
                v_seller_name,
                v_sale_amount,
                v_seller_rank,
                v_recipient.id,
                v_recipient_rank,
                'in-app'
            );
        END LOOP;

        -- Competitive Chat Post
        INSERT INTO public.competitive_chat_messages (
            salesperson_id,
            message,
            message_type
        ) VALUES (
            v_seller_id,
            'Acabei de fechar ' || v_formatted_amount || '! A meta tá logo ali! 🔥',
            'chat'
        );
        
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path TO public;

-- Trigger check and create
DROP TRIGGER IF EXISTS tr_notify_sale_completion ON public.sales;
CREATE TRIGGER tr_notify_sale_completion
AFTER INSERT OR UPDATE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.notify_sale_completion();
