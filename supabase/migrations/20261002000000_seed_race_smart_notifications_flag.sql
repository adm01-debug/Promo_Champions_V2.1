-- Seed da flag 'race_smart_notifications' (kill-switch global das notificações
-- contextuais da Arena). O hook useRaceSmartNotifications lê esta flag via
-- useFeatureGate: ausente => ligada; is_enabled=false => mata a feature.
-- Idempotente: upsert pela constraint UNIQUE(key).

INSERT INTO public.feature_flags (key, description, is_enabled, rollout_percentage)
VALUES ('race_smart_notifications', 'Kill-switch das notificações contextuais da Arena (rival ultrapassou, perto do pódio, última hora)', true, 100)
ON CONFLICT (key) DO NOTHING;
