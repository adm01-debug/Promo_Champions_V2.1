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
    IF (TG_OP = 'UPDATE' AND NEW.deal_status = 'completed'::deal_status AND OLD.deal_status != 'completed'::deal_status) 
       OR (TG_OP = 'INSERT' AND NEW.deal_status = 'completed'::deal_status) THEN
        
        v_seller_id := NEW.salesperson_id;
        v_sale_amount := NEW.amount;
        v_formatted_amount := 'R$ ' || to_char(v_sale_amount, 'FM999G999G990D00');

        -- Get seller name
        SELECT name INTO v_seller_name FROM public.salespeople WHERE id = v_seller_id;

        -- Calculate seller's current rank in the month
        SELECT pos INTO v_seller_rank 
        FROM (
            SELECT salesperson_id, RANK() OVER (ORDER BY SUM(amount) DESC) as pos
            FROM public.sales 
            WHERE deal_status = 'completed'::deal_status 
              AND created_at >= date_trunc('month', now())
            GROUP BY salesperson_id
        ) r WHERE salesperson_id = v_seller_id;

        IF v_seller_rank IS NULL THEN v_seller_rank := 0; END IF;

        -- Notify ALL other active salespeople who have a user account
        FOR v_recipient IN 
            SELECT sp.id, sp.auth_user_id, sp.name, r.pos as recipient_rank
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
            v_recipient_rank := COALESCE(v_recipient.recipient_rank, 0);

            -- Insert individual notification for the recipient
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
                'gamification', -- Updated from 'competition'
                'high',
                '🚀 ' || v_seller_name || ' vendeu!',
                'Fechou ' || v_formatted_amount || '! 🏆 Eles estão em #' || v_seller_rank || 
                '. Você está em ' || CASE WHEN v_recipient_rank = 0 THEN 'S/Rank' ELSE '#' || v_recipient_rank END || 
                '. Bora acelerar!',
                'Zap',
                jsonb_build_object(
                    'seller_id', v_seller_id,
                    'seller_name', v_seller_name,
                    'amount', v_sale_amount,
                    'seller_rank', v_seller_rank,
                    'recipient_rank', v_recipient_rank
                )
            );
        END LOOP;

        -- Also post a global announcement in the Competitive Chat
        INSERT INTO public.competitive_chat_messages (
            salesperson_id,
            message,
            message_type
        ) VALUES (
            v_seller_id,
            'Acabei de fechar uma venda de ' || v_formatted_amount || '! Rumo ao topo! 🔥',
            'chat'
        );
        
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path TO public;
