-- ==========================================
-- 1. TABELA DE PREFERÊNCIAS DO VENDEDOR (Nome da IA)
-- ==========================================
CREATE TABLE public.salesperson_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL UNIQUE REFERENCES public.salespeople(id) ON DELETE CASCADE,
  ai_assistant_name TEXT NOT NULL DEFAULT 'Coach IA',
  ai_assistant_avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trigger para updated_at
CREATE TRIGGER update_salesperson_preferences_updated_at
  BEFORE UPDATE ON public.salesperson_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS para preferências (apenas próprio vendedor)
ALTER TABLE public.salesperson_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
  ON public.salesperson_preferences FOR SELECT
  USING (salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can insert own preferences"
  ON public.salesperson_preferences FOR INSERT
  WITH CHECK (salesperson_id = get_current_salesperson_id());

CREATE POLICY "Users can update own preferences"
  ON public.salesperson_preferences FOR UPDATE
  USING (salesperson_id = get_current_salesperson_id());

-- ==========================================
-- 2. CORRIGIR RLS PARA COMPARTIMENTAÇÃO DE DADOS
-- ==========================================

-- === SALES ===
DROP POLICY IF EXISTS "Authenticated users can read sales" ON public.sales;
CREATE POLICY "Users can read own sales or admins all"
  ON public.sales FOR SELECT
  USING (
    salesperson_id = get_current_salesperson_id() 
    OR is_admin_or_manager(auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can insert sales" ON public.sales;
CREATE POLICY "Users can insert own sales"
  ON public.sales FOR INSERT
  WITH CHECK (
    salesperson_id = get_current_salesperson_id() 
    OR is_admin_or_manager(auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can update sales" ON public.sales;
CREATE POLICY "Users can update own sales"
  ON public.sales FOR UPDATE
  USING (
    salesperson_id = get_current_salesperson_id() 
    OR is_admin_or_manager(auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can delete sales" ON public.sales;
CREATE POLICY "Users can delete own sales"
  ON public.sales FOR DELETE
  USING (
    salesperson_id = get_current_salesperson_id() 
    OR is_admin_or_manager(auth.uid())
  );

-- === ACTIVITIES ===
DROP POLICY IF EXISTS "Authenticated users can read activities" ON public.activities;
CREATE POLICY "Users can read own activities or admins all"
  ON public.activities FOR SELECT
  USING (
    salesperson_id = get_current_salesperson_id() 
    OR is_admin_or_manager(auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can insert activities" ON public.activities;
CREATE POLICY "Users can insert own activities"
  ON public.activities FOR INSERT
  WITH CHECK (
    salesperson_id = get_current_salesperson_id() 
    OR is_admin_or_manager(auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can update activities" ON public.activities;
CREATE POLICY "Users can update own activities"
  ON public.activities FOR UPDATE
  USING (
    salesperson_id = get_current_salesperson_id() 
    OR is_admin_or_manager(auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can delete activities" ON public.activities;
CREATE POLICY "Users can delete own activities"
  ON public.activities FOR DELETE
  USING (
    salesperson_id = get_current_salesperson_id() 
    OR is_admin_or_manager(auth.uid())
  );

-- === SALES_GOALS ===
DROP POLICY IF EXISTS "Authenticated users can read sales_goals" ON public.sales_goals;
CREATE POLICY "Users can read own goals or admins all"
  ON public.sales_goals FOR SELECT
  USING (
    salesperson_id = get_current_salesperson_id() 
    OR is_admin_or_manager(auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can insert sales_goals" ON public.sales_goals;
CREATE POLICY "Admins can insert goals"
  ON public.sales_goals FOR INSERT
  WITH CHECK (is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can update sales_goals" ON public.sales_goals;
CREATE POLICY "Admins can update goals"
  ON public.sales_goals FOR UPDATE
  USING (is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can delete sales_goals" ON public.sales_goals;
CREATE POLICY "Admins can delete goals"
  ON public.sales_goals FOR DELETE
  USING (is_admin_or_manager(auth.uid()));

-- === DEAL_OUTCOMES ===
DROP POLICY IF EXISTS "Authenticated users can read deal_outcomes" ON public.deal_outcomes;
CREATE POLICY "Users can read own outcomes or admins all"
  ON public.deal_outcomes FOR SELECT
  USING (
    salesperson_id = get_current_salesperson_id() 
    OR is_admin_or_manager(auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can insert deal_outcomes" ON public.deal_outcomes;
CREATE POLICY "Users can insert own outcomes"
  ON public.deal_outcomes FOR INSERT
  WITH CHECK (
    salesperson_id = get_current_salesperson_id() 
    OR is_admin_or_manager(auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can update deal_outcomes" ON public.deal_outcomes;
CREATE POLICY "Users can update own outcomes"
  ON public.deal_outcomes FOR UPDATE
  USING (
    salesperson_id = get_current_salesperson_id() 
    OR is_admin_or_manager(auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can delete deal_outcomes" ON public.deal_outcomes;
CREATE POLICY "Users can delete own outcomes"
  ON public.deal_outcomes FOR DELETE
  USING (
    salesperson_id = get_current_salesperson_id() 
    OR is_admin_or_manager(auth.uid())
  );

-- === LEAD_SCORES (relacionado a sales, então também precisa filtrar) ===
DROP POLICY IF EXISTS "Authenticated users can read lead_scores" ON public.lead_scores;
CREATE POLICY "Users can read own lead scores or admins all"
  ON public.lead_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sales s 
      WHERE s.id = lead_scores.sale_id 
      AND (s.salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Authenticated users can insert lead_scores" ON public.lead_scores;
CREATE POLICY "Users can insert lead scores for own sales"
  ON public.lead_scores FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sales s 
      WHERE s.id = lead_scores.sale_id 
      AND (s.salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Authenticated users can update lead_scores" ON public.lead_scores;
CREATE POLICY "Users can update own lead scores"
  ON public.lead_scores FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.sales s 
      WHERE s.id = lead_scores.sale_id 
      AND (s.salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Authenticated users can delete lead_scores" ON public.lead_scores;
CREATE POLICY "Users can delete own lead scores"
  ON public.lead_scores FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.sales s 
      WHERE s.id = lead_scores.sale_id 
      AND (s.salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid()))
    )
  );

-- === TASKS ===
DROP POLICY IF EXISTS "Authenticated users can read tasks" ON public.tasks;
CREATE POLICY "Users can read own tasks or admins all"
  ON public.tasks FOR SELECT
  USING (
    salesperson_id = get_current_salesperson_id() 
    OR is_admin_or_manager(auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can insert tasks" ON public.tasks;
CREATE POLICY "Users can insert own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (
    salesperson_id = get_current_salesperson_id() 
    OR is_admin_or_manager(auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can update tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (
    salesperson_id = get_current_salesperson_id() 
    OR is_admin_or_manager(auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can delete tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  USING (
    salesperson_id = get_current_salesperson_id() 
    OR is_admin_or_manager(auth.uid())
  );