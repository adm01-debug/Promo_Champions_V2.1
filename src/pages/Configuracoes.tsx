import { Helmet } from "react-helmet-async";
import { RoleManagement } from "@/components/settings/RoleManagement";
import { SoundSettingsTabs } from "@/components/settings/SoundSettingsTabs";
import { AccessDeniedLogs } from "@/components/settings/AccessDeniedLogs";
import { SecurityAlertSettings } from "@/components/settings/SecurityAlertSettings";
import { SecurityAlertHistory } from "@/components/settings/SecurityAlertHistory";
import { CircuitBreakerDashboard } from "@/components/debug/CircuitBreakerDashboard";
import { PortfolioSettings } from "@/components/settings/PortfolioSettings";
import { PermissionMatrix } from "@/components/settings/PermissionMatrix";
import { IPWhitelistManager } from "@/components/security/IPWhitelistManager";
import { GeoBlockingManager } from "@/components/security/GeoBlockingManager";
import { PasswordResetApproval } from "@/components/security/PasswordResetApproval";
import { AIAssistantSettings } from "@/components/settings/AIAssistantSettings";
import { ThemeCustomizer } from "@/components/settings/ThemeCustomizer";
import { ApiIntegrationSettings } from "@/components/settings/ApiIntegrationSettings";
import { CustomFieldsManager } from "@/components/settings/CustomFieldsManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Shield, Volume2, FileWarning, Activity, Briefcase, Key, Globe, MapPin, KeyRound, Bot, Palette, Plug, Settings2 } from "lucide-react";
import { useUserRoles } from "@/hooks/useUserRoles";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function Configuracoes() {
  const { isAdmin } = useUserRoles();

  return (
    <Helmet>
      <title>Configurações | Promo Champions</title>
      <meta name="description" content="Preferências e configurações do sistema" />
    </Helmet>
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
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList className="inline-flex w-max">
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="sounds" className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Sons
            </TabsTrigger>
            <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Assistente IA
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Portfólio
            </TabsTrigger>
            <TabsTrigger value="skins" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Skins
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="api-integration" className="flex items-center gap-2">
                  <Plug className="h-4 w-4" />
                  API & Integrações
                </TabsTrigger>
                <TabsTrigger value="custom-fields" className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  Campos Adicionais
                </TabsTrigger>
                <TabsTrigger value="permissions" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Permissões
                </TabsTrigger>
                <TabsTrigger value="ip-whitelist" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  IP Whitelist
                </TabsTrigger>
                <TabsTrigger value="geo-blocking" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Geo Blocking
                </TabsTrigger>
                <TabsTrigger value="password-reset" className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  Reset Senha
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
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <TabsContent value="roles" className="mt-6">
          <RoleManagement />
        </TabsContent>

        <TabsContent value="sounds" className="mt-6">
          <SoundSettingsTabs />
        </TabsContent>

        <TabsContent value="ai-assistant" className="mt-6">
          <AIAssistantSettings />
        </TabsContent>

        <TabsContent value="portfolio" className="mt-6">
          <PortfolioSettings />
        </TabsContent>

        <TabsContent value="skins" className="mt-6">
          <ThemeCustomizer />
        </TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="api-integration" className="mt-6">
              <ApiIntegrationSettings />
            </TabsContent>

            <TabsContent value="custom-fields" className="mt-6">
              <CustomFieldsManager />
            </TabsContent>

            <TabsContent value="permissions" className="mt-6">
              <PermissionMatrix />
            </TabsContent>

            <TabsContent value="ip-whitelist" className="mt-6">
              <IPWhitelistManager />
            </TabsContent>

            <TabsContent value="geo-blocking" className="mt-6">
              <GeoBlockingManager />
            </TabsContent>

            <TabsContent value="password-reset" className="mt-6">
              <PasswordResetApproval />
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
