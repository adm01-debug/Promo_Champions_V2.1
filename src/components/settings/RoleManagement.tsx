import { useState } from "react";
import { useUserRoles, AppRole } from "@/hooks/useUserRoles";
import { useSalespeople } from "@/hooks/useSalespeople";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, ShieldCheck, User, Crown, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const roleConfig: Record<AppRole, { label: string; icon: React.ElementType; color: string }> = {
  admin: { label: "Admin", icon: Crown, color: "bg-warning/20 text-warning border-warning/30" },
  manager: { label: "Gerente", icon: ShieldCheck, color: "bg-info/20 text-info border-info/30" },
  salesperson: { label: "Vendedor", icon: User, color: "bg-muted text-muted-foreground border-border" },
};

export function RoleManagement() {
  const { allUserRoles, isLoadingAllRoles, updateRole, isUpdatingRole, canManageRoles } = useUserRoles();
  const { data: salespeople, isLoading: isLoadingSalespeople } = useSalespeople();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  if (!canManageRoles) {
    return (
      <Card className="glass border-border/40">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Você não tem permissão para gerenciar roles.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingAllRoles || isLoadingSalespeople) {
    return (
      <Card className="glass border-border/40">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
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

  const handleRoleChange = (userId: string, newRole: AppRole) => {
    setUpdatingUserId(userId);
    updateRole(
      { userId, newRole },
      {
        onSettled: () => setUpdatingUserId(null),
      }
    );
  };

  // Map salespeople to their roles
  const usersWithRoles = salespeople?.map((sp) => {
    const userRole = allUserRoles?.find((r) => r.user_id === sp.auth_user_id);
    return {
      id: sp.id,
      name: sp.name,
      email: sp.email,
      avatar_url: sp.avatar_url,
      auth_user_id: sp.auth_user_id,
      appRole: (userRole?.role || "salesperson") as AppRole,
      roleId: userRole?.id,
    };
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h4 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Operational Access Control</h4>
        <p className="text-sm text-muted-foreground italic font-medium">Assign roles to manage tactical permissions across the command unit.</p>
      </div>
      
      <div className="bg-muted/10 border border-border/10 rounded-xl overflow-hidden">

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role Atual</TableHead>
              <TableHead>Alterar Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersWithRoles.map((user) => {
              const config = roleConfig[user.appRole];
              const Icon = config.icon;
              const isUpdating = updatingUserId === user.auth_user_id;

              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={config.color}>
                      <Icon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.auth_user_id ? (
                      <Select
                        value={user.appRole}
                        onValueChange={(value) => handleRoleChange(user.auth_user_id!, value as AppRole)}
                        disabled={isUpdating || isUpdatingRole}
                      >
                        <SelectTrigger className="w-[140px]">
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <SelectValue />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Crown className="h-4 w-4 text-warning" />
                              Admin
                            </div>
                          </SelectItem>
                          <SelectItem value="manager">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-info" />
                              Gerente
                            </div>
                          </SelectItem>
                          <SelectItem value="salesperson">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Vendedor
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm text-muted-foreground">Sem conta vinculada</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {usersWithRoles.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum usuário encontrado.
          </div>
        )}

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2">Permissões por Role:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li><Crown className="h-4 w-4 inline mr-2 text-warning" /><strong>Admin:</strong> Acesso total, gerenciamento de roles, exclusão de dados</li>
            <li><ShieldCheck className="h-4 w-4 inline mr-2 text-info" /><strong>Gerente:</strong> Visualizar relatórios, editar metas, gerenciar equipe</li>
            <li><User className="h-4 w-4 inline mr-2" /><strong>Vendedor:</strong> Acesso às próprias vendas, atividades e metas</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
