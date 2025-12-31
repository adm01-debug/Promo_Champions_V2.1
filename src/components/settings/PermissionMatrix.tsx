import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles, AppRole } from "@/hooks/useUserRoles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, Check, X } from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

interface RolePermission {
  id: string;
  role: AppRole;
  permission_id: string;
}

const roleLabels: Record<AppRole, string> = {
  admin: "Admin",
  manager: "Manager",
  salesperson: "Vendedor",
};

const roleColors: Record<AppRole, string> = {
  admin: "bg-destructive text-destructive-foreground",
  manager: "bg-primary text-primary-foreground",
  salesperson: "bg-secondary text-secondary-foreground",
};

export function PermissionMatrix() {
  const { isAdmin } = useUserRoles();
  const queryClient = useQueryClient();

  const { data: permissions, isLoading: loadingPermissions } = useQuery({
    queryKey: ["all-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .order("resource", { ascending: true });
      
      if (error) throw error;
      return data as Permission[];
    },
  });

  const { data: rolePermissions, isLoading: loadingRolePermissions } = useQuery({
    queryKey: ["all-role-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*");
      
      if (error) throw error;
      return data as RolePermission[];
    },
  });

  const togglePermissionMutation = useMutation({
    mutationFn: async ({ role, permissionId, hasPermission }: { role: AppRole; permissionId: string; hasPermission: boolean }) => {
      if (hasPermission) {
        // Remove permission
        const { error } = await supabase
          .from("role_permissions")
          .delete()
          .eq("role", role)
          .eq("permission_id", permissionId);
        
        if (error) throw error;
      } else {
        // Add permission
        const { error } = await supabase
          .from("role_permissions")
          .insert({ role, permission_id: permissionId });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-role-permissions"] });
      queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
      toast.success("Permissão atualizada");
    },
    onError: (error) => {
      console.error("Error toggling permission:", error);
      toast.error("Erro ao atualizar permissão");
    },
  });

  const hasRolePermission = (role: AppRole, permissionId: string): boolean => {
    return rolePermissions?.some(
      (rp) => rp.role === role && rp.permission_id === permissionId
    ) ?? false;
  };

  const groupedPermissions = permissions?.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>) ?? {};

  if (loadingPermissions || loadingRolePermissions) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const roles: AppRole[] = ["admin", "manager", "salesperson"];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Matriz de Permissões</CardTitle>
        </div>
        <CardDescription>
          Gerencie as permissões de cada role no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Recurso / Ação</th>
                {roles.map((role) => (
                  <th key={role} className="text-center py-3 px-4">
                    <Badge className={roleColors[role]}>{roleLabels[role]}</Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedPermissions).map(([resource, perms]) => (
                <>
                  <tr key={resource} className="bg-muted/50">
                    <td colSpan={4} className="py-2 px-4 font-semibold capitalize">
                      {resource}
                    </td>
                  </tr>
                  {perms.map((perm) => (
                    <tr key={perm.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-medium capitalize">{perm.action}</span>
                          <p className="text-xs text-muted-foreground">{perm.description}</p>
                        </div>
                      </td>
                      {roles.map((role) => {
                        const hasPerm = hasRolePermission(role, perm.id);
                        const isDisabled = !isAdmin || (role === "admin" && perm.name === "manage_roles");
                        
                        return (
                          <td key={role} className="text-center py-3 px-4">
                            {isAdmin ? (
                              <Checkbox
                                checked={hasPerm}
                                disabled={isDisabled}
                                onCheckedChange={() => {
                                  if (!isDisabled) {
                                    togglePermissionMutation.mutate({
                                      role,
                                      permissionId: perm.id,
                                      hasPermission: hasPerm,
                                    });
                                  }
                                }}
                              />
                            ) : (
                              hasPerm ? (
                                <Check className="h-4 w-4 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground mx-auto" />
                              )
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
