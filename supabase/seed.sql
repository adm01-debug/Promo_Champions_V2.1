-- seed.sql — seed mínimo determinístico do Promo Champions V2.1
-- Executado por `supabase db reset` / `supabase seed` (roda como postgres,
-- bypassa RLS). Determinístico: UUIDs e timestamps fixos para reproduzir
-- o mesmo estado em todo ambiente local/CI.
--
-- Cobre: roles, pipeline padrão + estágios, 1 usuário admin de teste,
-- 1 salesperson vinculado e 3 clients/sales de exemplo.
-- Convenções: docs/SCHEMA_CONVENTIONS.md.

-- ============================================================
-- 1. Usuário admin de teste (auth.users + identidade)
-- ============================================================
-- Login local: admin.seed@promobrindes.test / Password123!
-- (Supabase local aceita esse padrão de seed de auth.users.)

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin.seed@promobrindes.test',
  crypt('Password123!', gen_salt('bf')),
  '2026-01-01 00:00:00+00',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  '2026-01-01 00:00:00+00',
  '2026-01-01 00:00:00+00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-0000000000a1',
  'admin.seed@promobrindes.test',
  '00000000-0000-0000-0000-000000000001',
  '{"sub":"00000000-0000-0000-0000-000000000001","email":"admin.seed@promobrindes.test"}'::jsonb,
  'email',
  '2026-01-01 00:00:00+00',
  '2026-01-01 00:00:00+00',
  '2026-01-01 00:00:00+00'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Papel admin (app_role) + salesperson vinculado
-- ============================================================

INSERT INTO public.user_roles (id, user_id, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'admin',
  '2026-01-01 00:00:00+00',
  '2026-01-01 00:00:00+00'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.salespeople (id, name, email, avatar_url, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000020',
  'Admin Seed',
  'admin.seed@promobrindes.test',
  NULL,
  '2026-01-01 00:00:00+00',
  '2026-01-01 00:00:00+00'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. Pipeline padrão + estágios
-- ============================================================

INSERT INTO public.pipelines (id, name, description, color, icon, is_active, display_order, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000100',
  'Pipeline Comercial',
  'Pipeline padrão de vendas (seed)',
  'bg-blue-500', 'kanban', true, 0,
  '2026-01-01 00:00:00+00', '2026-01-01 00:00:00+00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.pipeline_stages (id, pipeline_id, name, label, color, stage_order, probability, is_final, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000100', 'prospeccao',  'Prospecção',   'bg-slate-500',   1, 10,  false, '2026-01-01 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000120', '00000000-0000-0000-0000-000000000100', 'qualificacao','Qualificação', 'bg-blue-500',    2, 25,  false, '2026-01-01 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000130', '00000000-0000-0000-0000-000000000100', 'proposta',    'Proposta',     'bg-amber-500',   3, 60,  false, '2026-01-01 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000140', '00000000-0000-0000-0000-000000000100', 'ganho',       'Ganho',        'bg-emerald-500', 4, 100, true,  '2026-01-01 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000150', '00000000-0000-0000-0000-000000000100', 'perdido',     'Perdido',      'bg-rose-500',    5, 0,   true,  '2026-01-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. Clients e sales de exemplo
-- ============================================================

INSERT INTO public.clients (id, name, email, phone, company, total_value, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000201', 'Cliente Seed Alfa',   'alfa@cliente-seed.test',   '+5511999000001', 'Alfa Brindes LTDA',   12500.00, '2026-01-01 00:00:00+00', '2026-01-01 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000202', 'Cliente Seed Beta',   'beta@cliente-seed.test',   '+5511999000002', 'Beta Promoções SA',    8300.00, '2026-01-01 00:00:00+00', '2026-01-01 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000203', 'Cliente Seed Gama',   'gama@cliente-seed.test',   '+5511999000003', 'Gama Corporate Gifts', 21000.00, '2026-01-01 00:00:00+00', '2026-01-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sales (id, client_name, product_name, amount, status, category, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000301', 'Cliente Seed Alfa', 'Kit Brindes Corporativo', 12500.00, 'completed', 'service',      '2026-01-10 00:00:00+00', '2026-01-10 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000302', 'Cliente Seed Beta', 'Brindes Evento Anual',     8300.00, 'pending',   'project',      '2026-01-15 00:00:00+00', '2026-01-15 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000303', 'Cliente Seed Gama', 'Contrato Anual Brindes',  21000.00, 'pending',   'subscription', '2026-01-20 00:00:00+00', '2026-01-20 00:00:00+00')
ON CONFLICT (id) DO NOTHING;
