CREATE OR REPLACE FUNCTION public.send_notification(
    p_user_id uuid,
    p_type text,
    p_title text,
    p_message text DEFAULT NULL,
    p_category text DEFAULT 'general',
    p_priority text DEFAULT 'medium',
    p_action_url text DEFAULT NULL,
    p_action_label text DEFAULT NULL,
    p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE v_id uuid;
BEGIN
  -- Allow if:
  -- 1. It is the user themselves (auth.uid() = p_user_id)
  -- 2. It is an admin or manager
  -- 3. It is the system / service role (auth.uid() is NULL when using service key)
  
  IF auth.uid() IS NOT NULL THEN
    IF auth.uid() != p_user_id AND NOT is_admin_or_manager(auth.uid()) THEN
      RAISE EXCEPTION 'Not authorized to send notification to other users';
    END IF;
  END IF;

  INSERT INTO public.notifications (
    user_id, type, title, message, category, 
    priority, action_url, action_label, metadata
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_category, 
    p_priority, p_action_url, p_action_label, p_metadata
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;
