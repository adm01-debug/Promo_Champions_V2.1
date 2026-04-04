import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AppRole } from "@/hooks/useUserRoles";
import { Crown, UserCheck, Users } from "lucide-react";

interface RoleConfig {
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export const roleConfig: Record<AppRole, RoleConfig> = {
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

export const resourceLabels: Record<string, string> = {
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

export const actionLabels: Record<string, string> = {
  view: "Visualizar",
  create: "Criar",
  update: "Editar",
  delete: "Deletar",
  manage: "Gerenciar",
  export: "Exportar",
};

interface PermissionRoleCardsProps {
  roles: AppRole[];
  selectedRole: AppRole;
  onSelectRole: (role: AppRole) => void;
  getPermissionStats: (role: AppRole) => { total: number; granted: number; percentage: number };
}

export const PermissionRoleCards = React.memo(function PermissionRoleCards({
  roles,
  selectedRole,
  onSelectRole,
  getPermissionStats,
}: PermissionRoleCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {roles.map((role) => {
        const stats = getPermissionStats(role);
        const config = roleConfig[role];

        return (
          <Card
            key={role}
            className={`cursor-pointer transition-all ${selectedRole === role ? "ring-2 ring-primary" : ""}`}
            onClick={() => onSelectRole(role)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color}`}>{config.icon}</div>
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
  );
});
