-- Create saved_filters table for storing user filter presets
CREATE TABLE public.saved_filters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_type TEXT NOT NULL,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_saved_filters_user_entity ON public.saved_filters(user_id, entity_type);

-- Enable RLS
ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own saved filters" 
ON public.saved_filters FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved filters" 
ON public.saved_filters FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved filters" 
ON public.saved_filters FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved filters" 
ON public.saved_filters FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_saved_filters_updated_at
BEFORE UPDATE ON public.saved_filters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to ensure only one default per entity_type per user
CREATE OR REPLACE FUNCTION public.ensure_single_default_filter()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.saved_filters 
    SET is_default = false 
    WHERE user_id = NEW.user_id 
      AND entity_type = NEW.entity_type 
      AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER ensure_single_default_filter_trigger
BEFORE INSERT OR UPDATE ON public.saved_filters
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_default_filter();