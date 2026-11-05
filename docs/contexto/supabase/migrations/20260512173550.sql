-- Add squad_id to competitive chat
ALTER TABLE public.competitive_chat_messages 
ADD COLUMN squad_id UUID;

-- Update RLS policies for competitive_chat_messages
DROP POLICY IF EXISTS "Authenticated can read competitive chat" ON public.competitive_chat_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.competitive_chat_messages;

CREATE POLICY "Users can read global or squad messages"
ON public.competitive_chat_messages FOR SELECT
TO authenticated
USING (
    squad_id IS NULL OR 
    squad_id IN (
        SELECT squad_id FROM public.salespeople WHERE id = auth.uid()
    )
);

CREATE POLICY "Users can insert messages to global or their squad"
ON public.competitive_chat_messages FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = salesperson_id AND (
        squad_id IS NULL OR 
        squad_id IN (
            SELECT squad_id FROM public.salespeople WHERE id = auth.uid()
        )
    )
);
