
CREATE TABLE public.feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INTEGER NOT NULL DEFAULT 100 CHECK (rollout_percentage BETWEEN 0 AND 100),
  allowed_roles TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view feature flags"
ON public.feature_flags FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can manage feature flags"
ON public.feature_flags FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_feature_flags_updated_at
BEFORE UPDATE ON public.feature_flags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.feature_flags (key, description, is_enabled, rollout_percentage) VALUES
  ('ai_copilot', 'AI Copilot FAB button', true, 100),
  ('gamification_v2', 'New gamification system with combos', true, 100),
  ('dark_mode', 'Dark mode toggle', true, 100),
  ('advanced_analytics', 'Advanced BI analytics dashboards', true, 80),
  ('voice_commands', 'Voice commands in assistant', false, 0),
  ('pwa_push_notifications', 'PWA push notification support', true, 50);
