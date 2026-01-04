-- Additional Tables for New Features

-- Call Tracking
CREATE TABLE IF NOT EXISTS call_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  duration INTEGER NOT NULL, -- seconds
  outcome TEXT CHECK (outcome IN ('answered', 'no_answer', 'voicemail', 'busy')),
  recording_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_call_tracking_user ON call_tracking(user_id);
CREATE INDEX idx_call_tracking_client ON call_tracking(client_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = false;

-- Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  deal_updates BOOLEAN DEFAULT true,
  task_reminders BOOLEAN DEFAULT true,
  team_mentions BOOLEAN DEFAULT true,
  daily_digest BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Daily Challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('calls', 'meetings', 'demos', 'proposals')),
  target INTEGER NOT NULL,
  progress INTEGER DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, challenge_type, date)
);

CREATE INDEX idx_daily_challenges_user_date ON daily_challenges(user_id, date);

-- User Roles
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'sales', 'viewer')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id)
);

-- Experiments (A/B Testing)
CREATE TABLE IF NOT EXISTS experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS experiment_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 50,
  config JSONB
);

CREATE TABLE IF NOT EXISTS experiment_assignments (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES experiment_variants(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (user_id, experiment_id)
);

-- Cadences
CREATE TABLE IF NOT EXISTS cadences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cadence_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cadence_id UUID NOT NULL REFERENCES cadences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_type TEXT NOT NULL CHECK (step_type IN ('email', 'call', 'linkedin', 'task')),
  delay_days INTEGER NOT NULL,
  template TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cadence_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cadence_id UUID NOT NULL REFERENCES cadences(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'stopped')),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- RLS Policies for new tables
ALTER TABLE call_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadences ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadence_enrollments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own call tracking"
  ON call_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notification preferences"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own challenges"
  ON daily_challenges FOR SELECT
  USING (auth.uid() = user_id);
