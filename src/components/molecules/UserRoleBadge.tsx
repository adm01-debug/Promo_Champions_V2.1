import React, { memo } from "react";
import { useUserRoles, AppRole } from "@/hooks/useUserRoles";
import { Badge } from "@/components/ui/badge";
import { Crown, ShieldCheck, User, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const roleConfig: Record<AppRole, { label: string; icon: React.ElementType; color: string; description: string }> = {
  admin: { 
    label: "Admin", 
    icon: Crown, 
    color: "bg-warning/20 text-warning border-warning/30",
    description: "Acesso total ao sistema"
  },
  manager: { 
    label: "Gerente", 
    icon: ShieldCheck, 
    color: "bg-info/20 text-info border-info/30",
    description: "Gerenciamento de equipe e relatórios"
  },
  salesperson: { 
    label: "Vendedor", 
    icon: User, 
    color: "bg-muted text-muted-foreground border-border",
    description: "Acesso às próprias vendas e atividades"
  },
};

export const UserRoleBadge = memo(function UserRoleBadge() {
  const { currentUserRole, isLoadingCurrentRole } = useUserRoles();

  if (isLoadingCurrentRole) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  if (!currentUserRole) {
    return null;
  }

  const config = roleConfig[currentUserRole.role];
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className={`${config.color} cursor-help`}>
          <Icon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{config.description}</p>
      </TooltipContent>
    </Tooltip>
  );
});

UserRoleBadge.displayName = "UserRoleBadge";
