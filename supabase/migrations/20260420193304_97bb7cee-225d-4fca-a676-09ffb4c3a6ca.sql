-- Add columns for marking insights as applied
ALTER TABLE public.win_loss_insights
  ADD COLUMN IF NOT EXISTS applied_at timestamptz,
  ADD COLUMN IF NOT EXISTS applied_by uuid;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_wla_analyzed_at ON public.win_loss_analyses (analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_wla_outcome_segment ON public.win_loss_analyses (outcome, segment);
CREATE INDEX IF NOT EXISTS idx_wla_competitor ON public.win_loss_analyses (competitor);
CREATE INDEX IF NOT EXISTS idx_wli_created_at ON public.win_loss_insights (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wlp_pattern_type ON public.win_loss_patterns (pattern_type, frequency DESC);