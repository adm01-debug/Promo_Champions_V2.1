import { supabase } from '@/integrations/supabase/client';

export type Permission = 
  | 'clients.view'
  | 'clients.create'
  | 'clients.edit'
  | 'clients.delete'
  | 'deals.view'
  | 'deals.create'
  | 'deals.edit'
  | 'deals.delete'
  | 'admin.access';

export async function hasPermission(permission: Permission): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Admin tem todas as permissões
  if (user.user_metadata?.role === 'admin') return true;

  // Verificar permissão específica
  const { data } = await supabase
    .from('user_permissions')
    .select('permission')
    .eq('user_id', user.id)
    .eq('permission', permission)
    .single();

  return !!data;
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [hasAccess, setHasAccess] = React.useState(false);

  React.useEffect(() => {
    hasPermission(permission).then(setHasAccess);
  }, [permission]);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
