import { RoleManagement } from "@/components/settings/RoleManagement";
import { SoundSettingsTabs } from "@/components/settings/SoundSettingsTabs";
import { AccessDeniedLogs } from "@/components/settings/AccessDeniedLogs";
import { SecurityAlertSettings } from "@/components/settings/SecurityAlertSettings";
import { SecurityAlertHistory } from "@/components/settings/SecurityAlertHistory";
import { CircuitBreakerDashboard } from "@/components/debug/CircuitBreakerDashboard";
import { PortfolioSettings } from "@/components/settings/PortfolioSettings";
import { PermissionMatrix } from "@/components/settings/PermissionMatrix";
import { IPWhitelistManager } from "@/components/security/IPWhitelistManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Shield, Volume2, FileWarning, Activity, Briefcase, Key, Globe } from "lucide-react";
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
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-7' : 'grid-cols-3'} max-w-5xl`}>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="sounds" className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Sons
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Portfólio
          </TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="permissions" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Permissões
              </TabsTrigger>
              <TabsTrigger value="ip-whitelist" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                IP Whitelist
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center gap-2">
                <FileWarning className="h-4 w-4" />
                Auditoria
              </TabsTrigger>
              <TabsTrigger value="circuits" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Circuits
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="roles" className="mt-6">
          <RoleManagement />
        </TabsContent>

        <TabsContent value="sounds" className="mt-6">
          <SoundSettingsTabs />
        </TabsContent>

        <TabsContent value="portfolio" className="mt-6">
          <PortfolioSettings />
        </TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="permissions" className="mt-6">
              <PermissionMatrix />
            </TabsContent>

            <TabsContent value="ip-whitelist" className="mt-6">
              <IPWhitelistManager />
            </TabsContent>
            
            <TabsContent value="audit" className="mt-6 space-y-6">
              <SecurityAlertSettings />
              <SecurityAlertHistory />
              <AccessDeniedLogs />
            </TabsContent>
            
            <TabsContent value="circuits" className="mt-6">
              <CircuitBreakerDashboard />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

