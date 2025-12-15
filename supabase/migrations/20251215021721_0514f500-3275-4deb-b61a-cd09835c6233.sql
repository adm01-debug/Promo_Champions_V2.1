-- Create table for deal chat history
CREATE TABLE public.deal_chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_deal_chat_history_deal_id ON public.deal_chat_history(deal_id);
CREATE INDEX idx_deal_chat_history_created_at ON public.deal_chat_history(created_at DESC);

-- Enable RLS
ALTER TABLE public.deal_chat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can read deal_chat_history"
ON public.deal_chat_history
FOR SELECT
USING (is_authenticated());

CREATE POLICY "Authenticated users can insert deal_chat_history"
ON public.deal_chat_history
FOR INSERT
WITH CHECK (is_authenticated());

CREATE POLICY "Users can delete own chat history"
ON public.deal_chat_history
FOR DELETE
USING (salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid()));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.deal_chat_history;