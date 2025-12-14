import { RoleManagement } from "@/components/settings/RoleManagement";
import { SoundSettings } from "@/components/settings/SoundSettings";
import { AccessDeniedLogs } from "@/components/settings/AccessDeniedLogs";
import { SecurityAlertSettings } from "@/components/settings/SecurityAlertSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Shield, Volume2, FileWarning } from "lucide-react";
import { useUserRoles } from "@/hooks/useUserRoles";

export default function Configuracoes() {
  const { isAdmin } = useUserRoles();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold gradient-text">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
        </div>
      </div>

      <Tabs defaultValue="roles" className="w-full">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'} max-w-xl`}>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles e Permissões
          </TabsTrigger>
          <TabsTrigger value="sounds" className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Sons
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <FileWarning className="h-4 w-4" />
              Auditoria
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="roles" className="mt-6">
          <RoleManagement />
        </TabsContent>

        <TabsContent value="sounds" className="mt-6">
          <SoundSettings />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="audit" className="mt-6 space-y-6">
            <SecurityAlertSettings />
            <AccessDeniedLogs />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

