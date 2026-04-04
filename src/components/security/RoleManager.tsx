import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  Shield, 
  Lock, 
  Plus, 
  Edit, 
  Trash2,
  X,
  Eye,
  AlertTriangle
} from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: Permission[];
  isSystem?: boolean;
}

interface RoleManagerProps {
  roles: Role[];
  onCreateRole?: () => void;
  onEditRole?: (role: Role) => void;
  onDeleteRole?: (roleId: string) => void;
}

export const RoleManager: FC<RoleManagerProps> = ({
  roles,
  onCreateRole,
  onEditRole,
  onDeleteRole
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Gerenciador de Funções</h3>
            <p className="text-sm text-muted-foreground">Configure permissões por função</p>
          </div>
        </div>
        <Button onClick={onCreateRole}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Função
        </Button>
      </div>

      <div className="space-y-3">
        {roles.map((role) => (
          <div 
            key={role.id} 
            className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-muted">
                {role.isSystem ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{role.name}</h4>
                  {role.isSystem && (
                    <Badge variant="secondary" className="text-xs">Sistema</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{role.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {role.userCount} usuário(s) • {role.permissions.filter(p => p.enabled).length} permissões
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => onEditRole?.(role)}>
                <Edit className="h-4 w-4" />
              </Button>
              {!role.isSystem && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive"
                  onClick={() => onDeleteRole?.(role.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

interface PermissionGridProps {
  permissions: {
    category: string;
    items: Permission[];
  }[];
  onToggle?: (permissionId: string, enabled: boolean) => void;
  readOnly?: boolean;
}

export const PermissionGrid: FC<PermissionGridProps> = ({
  permissions,
  onToggle,
  readOnly
}) => {
  return (
    <div className="space-y-6">
      {permissions.map((category) => (
        <div key={category.category}>
          <h4 className="font-medium mb-3">{category.category}</h4>
          <div className="space-y-2">
            {category.items.map((permission) => (
              <div 
                key={permission.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{permission.name}</p>
                  <p className="text-sm text-muted-foreground">{permission.description}</p>
                </div>
                <Switch
                  checked={permission.enabled}
                  onCheckedChange={(enabled) => onToggle?.(permission.id, enabled)}
                  disabled={readOnly}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

interface AccessControlProps {
  resourceType: string;
  resourceName: string;
  currentAccess: {
    userId: string;
    userName: string;
    level: 'view' | 'edit' | 'admin';
  }[];
  onAddUser?: () => void;
  onRemoveUser?: (userId: string) => void;
  onChangeLevel?: (userId: string, level: string) => void;
}

export const AccessControl: FC<AccessControlProps> = ({
  resourceType,
  resourceName,
  currentAccess,
  onAddUser,
  onRemoveUser,
  onChangeLevel
}) => {
  const levelLabels = {
    view: { label: 'Visualizar', icon: Eye },
    edit: { label: 'Editar', icon: Edit },
    admin: { label: 'Administrador', icon: Shield }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-semibold">Controle de Acesso</h4>
          <p className="text-sm text-muted-foreground">
            {resourceType}: {resourceName}
          </p>
        </div>
        <Button size="sm" onClick={onAddUser}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

      <div className="space-y-2">
        {currentAccess.map((access) => {
          const level = levelLabels[access.level];
          
          return (
            <div key={access.userId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {access.userName.charAt(0)}
                </div>
                <span className="font-medium">{access.userName}</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="p-2 rounded border bg-background text-sm"
                  value={access.level}
                  onChange={(e) => onChangeLevel?.(access.userId, e.target.value)}
                >
                  <option value="view">Visualizar</option>
                  <option value="edit">Editar</option>
                  <option value="admin">Administrador</option>
                </select>
                <Button 
                  variant="ghost" 
                  size="icon" aria-label="Fechar"
                  onClick={() => onRemoveUser?.(access.userId)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

interface SecurityAlertProps {
  alerts: {
    id: string;
    type: 'warning' | 'critical' | 'info';
    title: string;
    description: string;
    timestamp: string;
  }[];
  onDismiss?: (id: string) => void;
  onAction?: (id: string) => void;
}

export const SecurityAlerts: FC<SecurityAlertProps> = ({
  alerts,
  onDismiss,
  onAction
}) => {
  const typeStyles = {
    warning: 'border-warning bg-warning/10',
    critical: 'border-destructive bg-destructive/10',
    info: 'border-info bg-info/10'
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Card key={alert.id} className={`p-4 border-l-4 ${typeStyles[alert.type]}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className={`h-5 w-5 ${
                alert.type === 'critical' ? 'text-destructive' : 
                alert.type === 'warning' ? 'text-warning' : 'text-info'
              }`} />
              <div>
                <h4 className="font-medium">{alert.title}</h4>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
                <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => onAction?.(alert.id)}>
                Resolver
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDismiss?.(alert.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
