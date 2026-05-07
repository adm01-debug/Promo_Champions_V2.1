import { RoleManagement } from "@/components/settings/RoleManagement";
import { Helmet } from "react-helmet-async";
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
import { PasskeySettings } from "@/components/security/PasskeySettings";
import { AIAssistantSettings } from "@/components/settings/AIAssistantSettings";
import { ThemeCustomizer } from "@/components/settings/ThemeCustomizer";
import { ApiIntegrationSettings } from "@/components/settings/ApiIntegrationSettings";
import { CustomFieldsManager } from "@/components/settings/CustomFieldsManager";
import { FeatureFlagsAdmin } from "@/components/settings/FeatureFlagsAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Shield, Volume2, FileWarning, Activity, Briefcase, Key, Globe, MapPin, KeyRound, Bot, Palette, Plug, Settings2, Fingerprint, Flag } from "lucide-react";
import { PageTransition } from "@/components/transitions/PageTransition";
import { useUserRoles } from "@/hooks/useUserRoles";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function Configuracoes() {
  const { isAdmin } = useUserRoles();

  return (
    <>
      <Helmet>
        <title>Configurações | Promo Champions</title>
        <meta name="description" content="Preferências e configurações do sistema" />
      </Helmet>
    <PageTransition>
    <div className="space-y-8 p-4 lg:p-8">
      {/* Header with High-Tech Command Style */}
      <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-3 rounded-2xl bg-primary/10 ring-1 ring-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
              <Settings className="h-7 w-7 text-primary animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
          </div>
          <div>
            <h1 className="font-display font-black text-3xl uppercase tracking-tighter italic">System Core</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Settings Engine v5.0</span>
              <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
                CENTRAL COMMAND ACCESS GRANTED
              </p>
            </div>
          </div>
        </div>
      </div>


      <Tabs defaultValue="roles" className="w-full">
        <div className="bg-muted/20 border border-border/10 p-1.5 rounded-2xl mb-8 overflow-hidden">
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className="inline-flex w-max gap-2 bg-transparent h-12">

            {/* Personalização */}
            <TabsTrigger value="roles" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-black uppercase tracking-widest px-6 h-full transition-all duration-300">
              <Shield className="h-3.5 w-3.5 mr-2" />Roles
            </TabsTrigger>
            <TabsTrigger value="sounds" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-black uppercase tracking-widest px-6 h-full transition-all duration-300">
              <Volume2 className="h-3.5 w-3.5 mr-2" />Sons
            </TabsTrigger>
            <TabsTrigger value="ai-assistant" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-black uppercase tracking-widest px-6 h-full transition-all duration-300">
              <Bot className="h-3.5 w-3.5 mr-2" />AI Pilot
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-black uppercase tracking-widest px-6 h-full transition-all duration-300">
              <Briefcase className="h-3.5 w-3.5 mr-2" />Portfolio
            </TabsTrigger>
            <TabsTrigger value="skins" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-black uppercase tracking-widest px-6 h-full transition-all duration-300">
              <Palette className="h-3.5 w-3.5 mr-2" />Skins
            </TabsTrigger>
            <TabsTrigger value="passkeys" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-black uppercase tracking-widest px-6 h-full transition-all duration-300">
              <Fingerprint className="h-3.5 w-3.5 mr-2" />Passkeys
            </TabsTrigger>

            {isAdmin && (
              <>
                {/* Visual separator */}
                <div className="h-5 w-px bg-border/60 mx-1 self-center" aria-hidden="true" />
                <TabsTrigger value="api-integration" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-black uppercase tracking-widest px-6 h-full transition-all duration-300">
                  <Plug className="h-3.5 w-3.5 mr-2" />API
                </TabsTrigger>
                <TabsTrigger value="custom-fields" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-black uppercase tracking-widest px-6 h-full transition-all duration-300">
                  <Settings2 className="h-3.5 w-3.5 mr-2" />Fields
                </TabsTrigger>
                <TabsTrigger value="permissions" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-black uppercase tracking-widest px-6 h-full transition-all duration-300">
                  <Key className="h-3.5 w-3.5 mr-2" />Permissions
                </TabsTrigger>

                {/* Visual separator */}
                <div className="h-5 w-px bg-border/60 mx-1 self-center" aria-hidden="true" />
                <TabsTrigger value="ip-whitelist" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-black uppercase tracking-widest px-6 h-full transition-all duration-300">
                  <Globe className="h-3.5 w-3.5 mr-2" />Security IP
                </TabsTrigger>
                <TabsTrigger value="geo-blocking" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-black uppercase tracking-widest px-6 h-full transition-all duration-300">
                  <MapPin className="h-3.5 w-3.5 mr-2" />Geo Block
                </TabsTrigger>
                <TabsTrigger value="password-reset" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-black uppercase tracking-widest px-6 h-full transition-all duration-300">
                  <KeyRound className="h-3.5 w-3.5 mr-2" />Pass Reset
                </TabsTrigger>
                <TabsTrigger value="audit" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-black uppercase tracking-widest px-6 h-full transition-all duration-300">
                  <FileWarning className="h-3.5 w-3.5 mr-2" />Audit Log
                </TabsTrigger>
                <TabsTrigger value="circuits" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-black uppercase tracking-widest px-6 h-full transition-all duration-300">
                  <Activity className="h-3.5 w-3.5 mr-2" />Circuits
                </TabsTrigger>
                <TabsTrigger value="feature-flags" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-black uppercase tracking-widest px-6 h-full transition-all duration-300">
                  <Flag className="h-3.5 w-3.5 mr-2" />Flags
                </TabsTrigger>

              </>
            )}
            </TabsList>
            <ScrollBar orientation="horizontal" className="h-1.5" />
          </ScrollArea>
        </div>


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

        <TabsContent value="passkeys" className="mt-6">
          <PasskeySettings />
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

            <TabsContent value="feature-flags" className="mt-6">
              <FeatureFlagsAdmin />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
    </PageTransition>
    </>
  );
}
