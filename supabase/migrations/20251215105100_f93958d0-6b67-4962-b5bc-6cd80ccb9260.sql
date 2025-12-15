-- Add question_type column to deal_chat_history
ALTER TABLE public.deal_chat_history 
ADD COLUMN question_type text NOT NULL DEFAULT 'general';

-- Add index for filtering by type
CREATE INDEX idx_deal_chat_history_question_type ON public.deal_chat_history(question_type);