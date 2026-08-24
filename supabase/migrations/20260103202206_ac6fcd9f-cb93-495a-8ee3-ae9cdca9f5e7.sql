-- Add voice preferences to salesperson_preferences table
ALTER TABLE public.salesperson_preferences 
ADD COLUMN IF NOT EXISTS response_mode TEXT NOT NULL DEFAULT 'text' CHECK (response_mode IN ('text', 'audio', 'both')),
ADD COLUMN IF NOT EXISTS voice_id TEXT DEFAULT 'CwhRBWXzGAHq8TQ4Fs17',
ADD COLUMN IF NOT EXISTS voice_name TEXT DEFAULT 'Roger';

COMMENT ON COLUMN public.salesperson_preferences.response_mode IS 'How the AI should respond: text only, audio only, or both';
COMMENT ON COLUMN public.salesperson_preferences.voice_id IS 'ElevenLabs voice ID for TTS';
COMMENT ON COLUMN public.salesperson_preferences.voice_name IS 'Human-readable name of the selected voice';