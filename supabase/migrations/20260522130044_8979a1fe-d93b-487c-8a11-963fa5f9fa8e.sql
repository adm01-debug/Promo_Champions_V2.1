
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adm01@promobrindes.com.br') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      'adm01@promobrindes.com.br',
      crypt('Juca301225@', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Administrador"}',
      now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), new_user_id, new_user_id::text,
      format('{"sub":"%s","email":"%s"}', new_user_id, 'adm01@promobrindes.com.br')::jsonb,
      'email', now(), now(), now()
    );

    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'admin'::public.app_role)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
