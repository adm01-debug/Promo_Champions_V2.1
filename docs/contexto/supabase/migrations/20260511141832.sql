-- Create SDR performance alert settings table
CREATE TABLE IF NOT EXISTS public.sdr_performance_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rejection_rate_threshold DECIMAL DEFAULT 30, -- 30% threshold
    outcome_mix_alert_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sdr_performance_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own performance settings"
    ON public.sdr_performance_settings
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create alert history if not exists (already partially exists based on code)
-- But ensuring we have a robust structure for these new types of alerts
CREATE TABLE IF NOT EXISTS public.sdr_alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    triggered_by TEXT NOT NULL,
    alert_type TEXT DEFAULT 'performance',
    sdrs_notified INTEGER DEFAULT 0,
    threshold_used DECIMAL,
    actual_value DECIMAL,
    sdr_details JSONB,
    admin_emails TEXT[]
);

-- Enable RLS
ALTER TABLE public.sdr_alert_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Everyone can view alert history"
    ON public.sdr_alert_history
    FOR SELECT
    USING (true);
