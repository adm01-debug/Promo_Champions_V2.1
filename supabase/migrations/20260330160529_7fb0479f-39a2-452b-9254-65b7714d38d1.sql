
CREATE TABLE public.mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(salesperson_id, entry_date)
);

ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own mood entries"
  ON public.mood_entries FOR SELECT
  TO authenticated
  USING (salesperson_id IN (
    SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own mood entries"
  ON public.mood_entries FOR INSERT
  TO authenticated
  WITH CHECK (salesperson_id IN (
    SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can update own mood entries"
  ON public.mood_entries FOR UPDATE
  TO authenticated
  USING (salesperson_id IN (
    SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()
  ));

CREATE OR REPLACE FUNCTION validate_mood_value()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.mood_value < 1 OR NEW.mood_value > 5 THEN
    RAISE EXCEPTION 'mood_value must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_mood_value
  BEFORE INSERT OR UPDATE ON public.mood_entries
  FOR EACH ROW EXECUTE FUNCTION validate_mood_value();
