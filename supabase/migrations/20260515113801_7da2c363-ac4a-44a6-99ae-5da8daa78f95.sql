-- Alter sales table to support AI predictions and WhatsApp
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS ai_prediction_score FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_prediction_reasoning TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_last_interaction TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS whatsapp_status TEXT DEFAULT 'not_connected';

-- Create table for granular AI sales behavioral insights
CREATE TABLE IF NOT EXISTS public.ai_sales_insights (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL,
    insight_content JSONB NOT NULL,
    confidence_score FLOAT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for insights
ALTER TABLE public.ai_sales_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view insights for their sales" 
ON public.ai_sales_insights 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.sales 
        WHERE sales.id = ai_sales_insights.sale_id 
        AND (sales.salesperson_id = auth.uid())
    )
);

-- Create table for WhatsApp integrated messages
CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id),
    external_message_id TEXT UNIQUE,
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    body TEXT,
    status TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for WhatsApp conversations
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view WhatsApp conversations for their sales" 
ON public.whatsapp_conversations 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.sales 
        WHERE sales.id = whatsapp_conversations.sale_id 
        AND (sales.salesperson_id = auth.uid())
    )
);

CREATE POLICY "Users can log WhatsApp messages" 
ON public.whatsapp_conversations 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.sales 
        WHERE sales.id = whatsapp_conversations.sale_id 
        AND (sales.salesperson_id = auth.uid())
    )
);
