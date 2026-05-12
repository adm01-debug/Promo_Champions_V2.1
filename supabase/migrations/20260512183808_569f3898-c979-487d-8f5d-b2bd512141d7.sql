-- Drop existing policies for cleaner setup
DROP POLICY IF EXISTS "Users can read global or squad messages" ON public.competitive_chat_messages;
DROP POLICY IF EXISTS "Users can insert messages to global or their squad" ON public.competitive_chat_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.competitive_chat_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.competitive_chat_messages;

-- Policy for SELECT: Read global messages OR messages from my squad
CREATE POLICY "Competitive Chat - SELECT"
ON public.competitive_chat_messages
FOR SELECT
USING (
  squad_id IS NULL OR 
  squad_id IN (
    SELECT squad_id FROM public.salespeople 
    WHERE auth_user_id = auth.uid()
  )
);

-- Policy for INSERT: Allow global or my squad only
CREATE POLICY "Competitive Chat - INSERT"
ON public.competitive_chat_messages
FOR INSERT
WITH CHECK (
  (squad_id IS NULL OR squad_id IN (
    SELECT squad_id FROM public.salespeople 
    WHERE auth_user_id = auth.uid()
  )) AND
  salesperson_id IN (
    SELECT id FROM public.salespeople 
    WHERE auth_user_id = auth.uid()
  )
);

-- Policy for UPDATE: Allow updates (reactions/edits) only on global or my squad messages
-- AND the user must be part of that squad (or any user can react to global)
CREATE POLICY "Competitive Chat - UPDATE"
ON public.competitive_chat_messages
FOR UPDATE
USING (
  squad_id IS NULL OR 
  squad_id IN (
    SELECT squad_id FROM public.salespeople 
    WHERE auth_user_id = auth.uid()
  )
);
