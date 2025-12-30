// Melhoria 84 - usePermissions Hook
export const usePermissions = () => {
  const { data: permissions } = useQuery({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_user_permissions');
      return data;
    },
  });

  const hasPermission = (resource: string, action: string): boolean => {
    if (!permissions) return false;
    return permissions[resource]?.includes(action) ?? false;
  };

  return { permissions, hasPermission };
};

export const useHasPermission = () => {
  const { hasPermission } = usePermissions();
  return hasPermission;
};
