import { lazy, Suspense, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Phone, Handshake, Building2, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/transitions/PageTransition";

const BIVendedor = lazy(() => import("./BIVendedor"));
const BISDR = lazy(() => import("./BISDR"));
const BICloser = lazy(() => import("./BICloser"));
const BIGestor = lazy(() => import("./BIGestor"));

const TabFallback = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
    </div>
    <Skeleton className="h-64 rounded-xl" />
  </div>
);

type BITab = "vendedor" | "sdr" | "closer" | "gestor";

const tabConfig: { id: BITab; label: string; icon: React.ElementType; requiresAdmin: boolean }[] = [
  { id: "vendedor", label: "Vendedor", icon: BarChart3, requiresAdmin: false },
  { id: "sdr", label: "SDR", icon: Phone, requiresAdmin: false },
  { id: "closer", label: "Closer", icon: Handshake, requiresAdmin: false },
  { id: "gestor", label: "Gestão", icon: Building2, requiresAdmin: true },
];

const BI = () => {
  const { salesperson } = useAuth();
  const { currentUserRole } = useUserRoles();
  
  const isAdminOrManager = currentUserRole?.role === 'admin' || currentUserRole?.role === 'manager';
  
  // Auto-select tab based on user role
  const getDefaultTab = (): BITab => {
    const name = salesperson?.name?.toLowerCase() || '';
    if (name.includes('sdr')) return 'sdr';
    if (name.includes('closer')) return 'closer';
    if (isAdminOrManager) return 'gestor';
    return 'vendedor';
  };

  const [activeTab, setActiveTab] = useState<BITab>(getDefaultTab());

  const visibleTabs = tabConfig.filter(t => !t.requiresAdmin || isAdminOrManager);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="max-w-[1600px] mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Business Intelligence</h1>
              <p className="text-sm text-muted-foreground">Análises detalhadas por perspectiva</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BITab)}>
            <TabsList className="mb-6 h-10 bg-muted/50">
              {visibleTabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="gap-1.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="vendedor">
              <Suspense fallback={<TabFallback />}>
                <BIVendedor />
              </Suspense>
            </TabsContent>
            <TabsContent value="sdr">
              <Suspense fallback={<TabFallback />}>
                <BISDR />
              </Suspense>
            </TabsContent>
            <TabsContent value="closer">
              <Suspense fallback={<TabFallback />}>
                <BICloser />
              </Suspense>
            </TabsContent>
            {isAdminOrManager && (
              <TabsContent value="gestor">
                <Suspense fallback={<TabFallback />}>
                  <BIGestor />
                </Suspense>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
};

export default BI;
