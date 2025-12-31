import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles, AppRole } from "@/hooks/useUserRoles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Shield, Check, X, Search, Users, Crown, UserCheck, CheckCircle2, XCircle, ToggleLeft, ToggleRight } from "lucide-react";

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

const roleConfig: Record<AppRole, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  admin: {
    label: "Administrador",
    icon: <Crown className="h-4 w-4" />,
    color: "bg-destructive text-destructive-foreground",
    description: "Acesso total ao sistema",
  },
  manager: {
    label: "Gerente",
    icon: <UserCheck className="h-4 w-4" />,
    color: "bg-primary text-primary-foreground",
    description: "Gerencia equipes e relatórios",
  },
  salesperson: {
    label: "Vendedor",
    icon: <Users className="h-4 w-4" />,
    color: "bg-secondary text-secondary-foreground",
    description: "Acesso às funcionalidades de vendas",
  },
};

const resourceLabels: Record<string, string> = {
  dashboard: "Dashboard",
  analytics: "Analytics",
  sales: "Vendas",
  clients: "Clientes",
  products: "Produtos",
  team: "Equipe",
  goals: "Metas",
  reports: "Relatórios",
  settings: "Configurações",
  roles: "Roles",
  audit: "Auditoria",
  playbooks: "Playbooks",
  cadences: "Cadências",
};

const actionLabels: Record<string, string> = {
  view: "Visualizar",
  create: "Criar",
  update: "Editar",
  delete: "Deletar",
  manage: "Gerenciar",
  export: "Exportar",
};

export function PermissionMatrix() {
  const { isAdmin } = useUserRoles();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>("admin");

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
        const { error } = await supabase
          .from("role_permissions")
          .delete()
          .eq("role", role)
          .eq("permission_id", permissionId);
        
        if (error) throw error;
      } else {
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

  const bulkToggleMutation = useMutation({
    mutationFn: async ({ role, resource, enable }: { role: AppRole; resource: string; enable: boolean }) => {
      const resourcePerms = permissions?.filter(p => p.resource === resource) ?? [];
      
      for (const perm of resourcePerms) {
        const hasPerm = hasRolePermission(role, perm.id);
        if (enable && !hasPerm) {
          const { error } = await supabase
            .from("role_permissions")
            .insert({ role, permission_id: perm.id });
          if (error) throw error;
        } else if (!enable && hasPerm) {
          const { error } = await supabase
            .from("role_permissions")
            .delete()
            .eq("role", role)
            .eq("permission_id", perm.id);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-role-permissions"] });
      queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
      toast.success("Permissões atualizadas");
    },
    onError: (error) => {
      console.error("Error bulk toggling:", error);
      toast.error("Erro ao atualizar permissões");
    },
  });

  const hasRolePermission = (role: AppRole, permissionId: string): boolean => {
    return rolePermissions?.some(
      (rp) => rp.role === role && rp.permission_id === permissionId
    ) ?? false;
  };

  const getPermissionStats = (role: AppRole) => {
    const total = permissions?.length ?? 0;
    const granted = permissions?.filter(p => hasRolePermission(role, p.id)).length ?? 0;
    return { total, granted, percentage: total > 0 ? Math.round((granted / total) * 100) : 0 };
  };

  const getResourcePermissionCount = (role: AppRole, resource: string) => {
    const resourcePerms = permissions?.filter(p => p.resource === resource) ?? [];
    const granted = resourcePerms.filter(p => hasRolePermission(role, p.id)).length;
    return { total: resourcePerms.length, granted };
  };

  const filteredPermissions = permissions?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedPermissions = filteredPermissions?.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>) ?? {};

  if (loadingPermissions || loadingRolePermissions) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const roles: AppRole[] = ["admin", "manager", "salesperson"];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((role) => {
          const stats = getPermissionStats(role);
          const config = roleConfig[role];
          
          return (
            <Card key={role} className={`cursor-pointer transition-all ${selectedRole === role ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedRole(role)}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      {config.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{config.label}</h3>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold">{stats.granted}</span>
                    <span className="text-muted-foreground">/{stats.total}</span>
                    <p className="text-xs text-muted-foreground">{stats.percentage}% ativo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Permissions Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Permissões: {roleConfig[selectedRole].label}</CardTitle>
                <CardDescription>
                  Gerencie as permissões para a role selecionada
                </CardDescription>
              </div>
            </div>
            <Badge className={roleConfig[selectedRole].color}>
              {roleConfig[selectedRole].icon}
              <span className="ml-1">{roleConfig[selectedRole].label}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar permissões..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Permission Groups */}
          <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([resource, perms]) => {
              const { total, granted } = getResourcePermissionCount(selectedRole, resource);
              const allEnabled = granted === total;
              const someEnabled = granted > 0 && granted < total;
              
              return (
                <Card key={resource} className="border">
                  <CardHeader className="py-3 px-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{resourceLabels[resource] || resource}</h4>
                        <Badge variant="outline" className="text-xs">
                          {granted}/{total} ativas
                        </Badge>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => bulkToggleMutation.mutate({ role: selectedRole, resource, enable: true })}
                            disabled={allEnabled || bulkToggleMutation.isPending}
                            className="text-xs"
                          >
                            <ToggleRight className="h-3 w-3 mr-1" />
                            Ativar Todas
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => bulkToggleMutation.mutate({ role: selectedRole, resource, enable: false })}
                            disabled={granted === 0 || bulkToggleMutation.isPending}
                            className="text-xs"
                          >
                            <ToggleLeft className="h-3 w-3 mr-1" />
                            Desativar Todas
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {perms.map((perm) => {
                        const hasPerm = hasRolePermission(selectedRole, perm.id);
                        const isDisabled = !isAdmin || (selectedRole === "admin" && perm.name === "manage_roles");
                        
                        return (
                          <div
                            key={perm.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                              hasPerm ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-background border-border'
                            }`}
                          >
                            {isAdmin ? (
                              <Checkbox
                                id={perm.id}
                                checked={hasPerm}
                                disabled={isDisabled || togglePermissionMutation.isPending}
                                onCheckedChange={() => {
                                  if (!isDisabled) {
                                    togglePermissionMutation.mutate({
                                      role: selectedRole,
                                      permissionId: perm.id,
                                      hasPermission: hasPerm,
                                    });
                                  }
                                }}
                              />
                            ) : (
                              hasPerm ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                              )
                            )}
                            <label htmlFor={perm.id} className="flex-1 cursor-pointer">
                              <span className="font-medium text-sm">{actionLabels[perm.action] || perm.action}</span>
                              <p className="text-xs text-muted-foreground line-clamp-1">{perm.description}</p>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Matrix View Tab */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Visão Comparativa
          </CardTitle>
          <CardDescription>Compare permissões entre todas as roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Permissão</th>
                  {roles.map((role) => (
                    <th key={role} className="text-center py-3 px-4">
                      <Badge className={roleConfig[role].color}>
                        {roleConfig[role].icon}
                        <span className="ml-1">{roleConfig[role].label}</span>
                      </Badge>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <>
                    <tr key={`header-${resource}`} className="bg-muted/50">
                      <td colSpan={4} className="py-2 px-4 font-semibold">
                        {resourceLabels[resource] || resource}
                      </td>
                    </tr>
                    {perms.map((perm) => (
                      <tr key={perm.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="py-2 px-4">
                          <span className="font-medium">{actionLabels[perm.action] || perm.action}</span>
                        </td>
                        {roles.map((role) => {
                          const hasPerm = hasRolePermission(role, perm.id);
                          return (
                            <td key={role} className="text-center py-2 px-4">
                              {hasPerm ? (
                                <Check className="h-4 w-4 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground mx-auto" />
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
    </div>
  );
}
