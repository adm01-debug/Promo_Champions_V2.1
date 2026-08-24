-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated can view chat" ON public.competitive_chat_messages;
DROP POLICY IF EXISTS "Users can read global or squad messages" ON public.competitive_chat_messages;

-- Enforce squad privacy for reading
CREATE POLICY "Users can read global or squad messages" ON public.competitive_chat_messages
FOR SELECT
USING (
    squad_id IS NULL 
    OR 
    squad_id IN (
        SELECT squad_id FROM public.salespeople WHERE auth_user_id = auth.uid()
    )
);

-- Enforce squad integrity for sending
DROP POLICY IF EXISTS "Users can insert messages to global or their squad" ON public.competitive_chat_messages;
CREATE POLICY "Users can insert messages to global or their squad" ON public.competitive_chat_messages
FOR INSERT
WITH CHECK (
    (salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()))
    AND
    (
        squad_id IS NULL 
        OR 
        squad_id IN (SELECT squad_id FROM public.salespeople WHERE auth_user_id = auth.uid())
    )
);

-- Update additional policies to use correct user identification
DROP POLICY IF EXISTS "Users can update own messages" ON public.competitive_chat_messages;
CREATE POLICY "Users can update own messages" ON public.competitive_chat_messages
FOR UPDATE
USING (salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()));
