-- role_permissions_frontend_sync.sql — GERADO por scripts/generate-role-permissions-seed.mjs
-- Fonte única: src/config/role-permissions.json. NÃO editar à mão;
-- rode `node scripts/generate-role-permissions-seed.mjs --write`.
-- Idempotente: ON CONFLICT em todos os inserts.

-- Permissões declaradas pelo frontend (vocabulário resource:action)
INSERT INTO public.permissions (name, description, resource, action)
VALUES ('activities:read', 'Permissão activities:read (fonte: role-permissions.json)', 'activities', 'read')
ON CONFLICT (resource, action) DO NOTHING;
INSERT INTO public.permissions (name, description, resource, action)
VALUES ('activities:write', 'Permissão activities:write (fonte: role-permissions.json)', 'activities', 'write')
ON CONFLICT (resource, action) DO NOTHING;
INSERT INTO public.permissions (name, description, resource, action)
VALUES ('clients:delete', 'Permissão clients:delete (fonte: role-permissions.json)', 'clients', 'delete')
ON CONFLICT (resource, action) DO NOTHING;
INSERT INTO public.permissions (name, description, resource, action)
VALUES ('clients:read', 'Permissão clients:read (fonte: role-permissions.json)', 'clients', 'read')
ON CONFLICT (resource, action) DO NOTHING;
INSERT INTO public.permissions (name, description, resource, action)
VALUES ('clients:write', 'Permissão clients:write (fonte: role-permissions.json)', 'clients', 'write')
ON CONFLICT (resource, action) DO NOTHING;
INSERT INTO public.permissions (name, description, resource, action)
VALUES ('deals:delete', 'Permissão deals:delete (fonte: role-permissions.json)', 'deals', 'delete')
ON CONFLICT (resource, action) DO NOTHING;
INSERT INTO public.permissions (name, description, resource, action)
VALUES ('deals:read', 'Permissão deals:read (fonte: role-permissions.json)', 'deals', 'read')
ON CONFLICT (resource, action) DO NOTHING;
INSERT INTO public.permissions (name, description, resource, action)
VALUES ('deals:write', 'Permissão deals:write (fonte: role-permissions.json)', 'deals', 'write')
ON CONFLICT (resource, action) DO NOTHING;
INSERT INTO public.permissions (name, description, resource, action)
VALUES ('reports:read', 'Permissão reports:read (fonte: role-permissions.json)', 'reports', 'read')
ON CONFLICT (resource, action) DO NOTHING;
INSERT INTO public.permissions (name, description, resource, action)
VALUES ('users:read', 'Permissão users:read (fonte: role-permissions.json)', 'users', 'read')
ON CONFLICT (resource, action) DO NOTHING;

-- Concessões por papel (admin usa curinga "*" = tudo)
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager'::app_role, id FROM public.permissions
WHERE resource = 'activities' AND action = 'read'
ON CONFLICT (role, permission_id) DO NOTHING;
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager'::app_role, id FROM public.permissions
WHERE resource = 'activities' AND action = 'write'
ON CONFLICT (role, permission_id) DO NOTHING;
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager'::app_role, id FROM public.permissions
WHERE resource = 'clients' AND action = 'delete'
ON CONFLICT (role, permission_id) DO NOTHING;
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager'::app_role, id FROM public.permissions
WHERE resource = 'clients' AND action = 'read'
ON CONFLICT (role, permission_id) DO NOTHING;
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager'::app_role, id FROM public.permissions
WHERE resource = 'clients' AND action = 'write'
ON CONFLICT (role, permission_id) DO NOTHING;
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager'::app_role, id FROM public.permissions
WHERE resource = 'deals' AND action = 'delete'
ON CONFLICT (role, permission_id) DO NOTHING;
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager'::app_role, id FROM public.permissions
WHERE resource = 'deals' AND action = 'read'
ON CONFLICT (role, permission_id) DO NOTHING;
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager'::app_role, id FROM public.permissions
WHERE resource = 'deals' AND action = 'write'
ON CONFLICT (role, permission_id) DO NOTHING;
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager'::app_role, id FROM public.permissions
WHERE resource = 'reports' AND action = 'read'
ON CONFLICT (role, permission_id) DO NOTHING;
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager'::app_role, id FROM public.permissions
WHERE resource = 'users' AND action = 'read'
ON CONFLICT (role, permission_id) DO NOTHING;
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'salesperson'::app_role, id FROM public.permissions
WHERE resource = 'activities' AND action = 'read'
ON CONFLICT (role, permission_id) DO NOTHING;
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'salesperson'::app_role, id FROM public.permissions
WHERE resource = 'activities' AND action = 'write'
ON CONFLICT (role, permission_id) DO NOTHING;
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'salesperson'::app_role, id FROM public.permissions
WHERE resource = 'clients' AND action = 'read'
ON CONFLICT (role, permission_id) DO NOTHING;
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'salesperson'::app_role, id FROM public.permissions
WHERE resource = 'clients' AND action = 'write'
ON CONFLICT (role, permission_id) DO NOTHING;
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'salesperson'::app_role, id FROM public.permissions
WHERE resource = 'deals' AND action = 'read'
ON CONFLICT (role, permission_id) DO NOTHING;
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'salesperson'::app_role, id FROM public.permissions
WHERE resource = 'deals' AND action = 'write'
ON CONFLICT (role, permission_id) DO NOTHING;
