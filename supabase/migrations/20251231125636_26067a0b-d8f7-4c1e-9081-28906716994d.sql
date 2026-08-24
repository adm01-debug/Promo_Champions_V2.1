-- Create permissions table
CREATE TABLE public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  resource text NOT NULL,
  action text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(resource, action)
);

-- Create role_permissions junction table
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- Enable RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for permissions (readable by authenticated, manageable by admin)
CREATE POLICY "Authenticated users can read permissions"
ON public.permissions FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage permissions"
ON public.permissions FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for role_permissions
CREATE POLICY "Authenticated users can read role_permissions"
ON public.role_permissions FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage role_permissions"
ON public.role_permissions FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to get user permissions based on their role
CREATE OR REPLACE FUNCTION public.get_user_permissions()
RETURNS TABLE(permission_name text, resource text, action text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.name, p.resource, p.action
  FROM permissions p
  INNER JOIN role_permissions rp ON p.id = rp.permission_id
  INNER JOIN user_roles ur ON rp.role = ur.role
  WHERE ur.user_id = auth.uid()
$$;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.has_permission(_resource text, _action text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM permissions p
    INNER JOIN role_permissions rp ON p.id = rp.permission_id
    INNER JOIN user_roles ur ON rp.role = ur.role
    WHERE ur.user_id = auth.uid()
      AND p.resource = _resource
      AND p.action = _action
  )
$$;

-- Seed default permissions
INSERT INTO public.permissions (name, description, resource, action) VALUES
-- Dashboard
('view_dashboard', 'Visualizar dashboard principal', 'dashboard', 'view'),
('view_analytics', 'Visualizar analytics avançados', 'analytics', 'view'),

-- Vendas
('view_sales', 'Visualizar vendas', 'sales', 'view'),
('create_sales', 'Criar vendas', 'sales', 'create'),
('edit_sales', 'Editar vendas', 'sales', 'update'),
('delete_sales', 'Deletar vendas', 'sales', 'delete'),

-- Clientes
('view_clients', 'Visualizar clientes', 'clients', 'view'),
('create_clients', 'Criar clientes', 'clients', 'create'),
('edit_clients', 'Editar clientes', 'clients', 'update'),
('delete_clients', 'Deletar clientes', 'clients', 'delete'),

-- Produtos
('view_products', 'Visualizar produtos', 'products', 'view'),
('create_products', 'Criar produtos', 'products', 'create'),
('edit_products', 'Editar produtos', 'products', 'update'),
('delete_products', 'Deletar produtos', 'products', 'delete'),

-- Equipe
('view_team', 'Visualizar equipe', 'team', 'view'),
('manage_team', 'Gerenciar equipe', 'team', 'manage'),

-- Metas
('view_goals', 'Visualizar metas', 'goals', 'view'),
('edit_goals', 'Editar metas', 'goals', 'update'),

-- Relatórios
('view_reports', 'Visualizar relatórios', 'reports', 'view'),
('export_reports', 'Exportar relatórios', 'reports', 'export'),

-- Configurações
('view_settings', 'Visualizar configurações', 'settings', 'view'),
('edit_settings', 'Editar configurações', 'settings', 'update'),

-- Roles
('view_roles', 'Visualizar roles', 'roles', 'view'),
('manage_roles', 'Gerenciar roles', 'roles', 'manage'),

-- Auditoria
('view_audit', 'Visualizar logs de auditoria', 'audit', 'view'),

-- Playbooks
('view_playbooks', 'Visualizar playbooks', 'playbooks', 'view'),
('manage_playbooks', 'Gerenciar playbooks', 'playbooks', 'manage'),

-- Cadências
('view_cadences', 'Visualizar cadências', 'cadences', 'view'),
('manage_cadences', 'Gerenciar cadências', 'cadences', 'manage');

-- Assign permissions to roles
-- Admin gets all permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin'::app_role, id FROM public.permissions;

-- Manager gets most permissions except role management and audit
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager'::app_role, id FROM public.permissions
WHERE name NOT IN ('manage_roles', 'view_audit', 'delete_sales', 'delete_clients', 'delete_products');

-- Salesperson gets limited permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'salesperson'::app_role, id FROM public.permissions
WHERE name IN (
  'view_dashboard', 
  'view_sales', 'create_sales', 'edit_sales',
  'view_clients', 
  'view_products',
  'view_goals',
  'view_playbooks',
  'view_cadences',
  'view_settings'
);