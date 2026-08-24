ALTER TABLE public.call_recordings
  ADD COLUMN IF NOT EXISTS transcript text,
  ADD COLUMN IF NOT EXISTS transcript_language text DEFAULT 'pt',
  ADD COLUMN IF NOT EXISTS transcribed_at timestamptz,
  ADD COLUMN IF NOT EXISTS transcription_error text;

CREATE OR REPLACE FUNCTION public.update_call_recording_transcript(
  _id uuid,
  _transcript text,
  _language text DEFAULT 'pt',
  _error text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _owner uuid;
  _caller_sp uuid;
  _is_admin boolean;
BEGIN
  SELECT salesperson_id INTO _owner FROM public.call_recordings WHERE id = _id;
  IF _owner IS NULL THEN
    RAISE EXCEPTION 'Recording not found';
  END IF;

  SELECT public.get_current_salesperson_id() INTO _caller_sp;
  SELECT public.has_role(auth.uid(), 'admin') INTO _is_admin;

  IF _caller_sp IS DISTINCT FROM _owner AND NOT COALESCE(_is_admin, false) THEN
    RAISE EXCEPTION 'Not authorized to update this recording';
  END IF;

  IF _error IS NOT NULL THEN
    UPDATE public.call_recordings
       SET status = 'failed',
           transcription_error = _error,
           updated_at = now()
     WHERE id = _id;
  ELSE
    UPDATE public.call_recordings
       SET transcript = _transcript,
           transcript_language = COALESCE(_language, 'pt'),
           transcribed_at = now(),
           transcription_error = NULL,
           status = 'transcribed',
           updated_at = now()
     WHERE id = _id;
  END IF;
END;
$$;