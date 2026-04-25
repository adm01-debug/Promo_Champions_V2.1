import { Plug } from "lucide-react";
import { useCallback, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageTransition } from "@/components/transitions/PageTransition";

import { SupabaseConnectionsTab } from "@/components/admin/connections/SupabaseConnectionsTab";
import { Bitrix24Tab } from "@/components/admin/connections/Bitrix24Tab";
import { N8nTab } from "@/components/admin/connections/N8nTab";
import { McpTab } from "@/components/admin/connections/McpTab";
import { WebhooksTab } from "@/components/admin/connections/WebhooksTab";
import { IntegrationsHealthCard } from "@/components/admin/connections/IntegrationsHealthCard";
import { ConnectionsOverviewTable } from "@/components/admin/connections/ConnectionsOverviewTable";
import { SmokeTestChecklist } from "@/components/admin/connections/SmokeTestChecklist";
import { AutoTestIntervalCard } from "@/components/admin/connections/AutoTestIntervalCard";
import { FailureWindowCard } from "@/components/admin/connections/FailureWindowCard";
import { AutoTestJobStatusCard } from "@/components/admin/connections/AutoTestJobStatusCard";
import { CredentialsSourceFilterProvider } from "@/components/admin/connections/CredentialsSourceFilterContext";
import { CredentialsSourceFilter } from "@/components/admin/connections/CredentialsSourceFilter";
import { GlobalRefreshFromDbButton } from "@/components/admin/connections/GlobalRefreshFromDbButton";

function AdminConexoesContent() {
  const [, setRefreshTick] = useState(0);
  const handleGlobalRefreshed = useCallback(() => setRefreshTick((n) => n + 1), []);

  return (
    <CredentialsSourceFilterProvider>
      <Helmet>
        <title>Conexões | Promo Champions</title>
        <meta name="description" content="Hub central de integrações: bancos, Bitrix24, n8n, MCP e webhooks." />
      </Helmet>
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Plug className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold gradient-text">Conexões</h1>
              <p className="text-muted-foreground mt-1">
                Hub central de integrações externas e credenciais do sistema.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CredentialsSourceFilter />
            <GlobalRefreshFromDbButton onRefreshed={handleGlobalRefreshed} />
          </div>
        </div>

        <IntegrationsHealthCard />

        <ConnectionsOverviewTable />

        <div className="grid gap-4 md:grid-cols-3">
          <AutoTestIntervalCard />
          <FailureWindowCard />
          <AutoTestJobStatusCard />
        </div>

        <SmokeTestChecklist />

        <Tabs defaultValue="database" className="space-y-4">
          <TabsList>
            <TabsTrigger value="database">Bancos de Dados</TabsTrigger>
            <TabsTrigger value="bitrix24">Bitrix24</TabsTrigger>
            <TabsTrigger value="n8n">n8n</TabsTrigger>
            <TabsTrigger value="mcp">MCP (Claude)</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>
          <TabsContent value="database"><SupabaseConnectionsTab /></TabsContent>
          <TabsContent value="bitrix24"><Bitrix24Tab /></TabsContent>
          <TabsContent value="n8n"><N8nTab /></TabsContent>
          <TabsContent value="mcp"><McpTab /></TabsContent>
          <TabsContent value="webhooks"><WebhooksTab /></TabsContent>
        </Tabs>
      </div>
    </CredentialsSourceFilterProvider>
  );
}

export default function AdminConexoesPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <PageTransition>
        <AdminConexoesContent />
      </PageTransition>
    </ProtectedRoute>
  );
}
