-- Create chat conversations table
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nova conversa',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_conversations
CREATE POLICY "Authenticated users can read chat_conversations"
  ON public.chat_conversations FOR SELECT
  USING (is_authenticated());

CREATE POLICY "Authenticated users can insert chat_conversations"
  ON public.chat_conversations FOR INSERT
  WITH CHECK (is_authenticated());

CREATE POLICY "Authenticated users can update chat_conversations"
  ON public.chat_conversations FOR UPDATE
  USING (is_authenticated());

CREATE POLICY "Authenticated users can delete chat_conversations"
  ON public.chat_conversations FOR DELETE
  USING (is_authenticated());

-- RLS policies for chat_messages
CREATE POLICY "Authenticated users can read chat_messages"
  ON public.chat_messages FOR SELECT
  USING (is_authenticated());

CREATE POLICY "Authenticated users can insert chat_messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (is_authenticated());

-- Create indexes for performance
CREATE INDEX idx_chat_conversations_salesperson ON public.chat_conversations(salesperson_id);
CREATE INDEX idx_chat_messages_conversation ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created ON public.chat_messages(created_at);

-- Trigger to update updated_at
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();