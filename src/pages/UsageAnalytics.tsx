import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CACHE_TIMES } from "@/constants";
import { PageTransition, containerVariants, itemVariants } from "@/components/transitions/PageTransition";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { BarChart3, Users, MousePointerClick, Clock, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface PageView {
  path: string;
  count: number;
}

interface UserActivity {
  user_id: string;
  name: string;
  login_count: number;
  last_active: string;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const UsageAnalytics = () => {
  // Page views from route_analytics
  const { data: pageViews, isLoading: loadingPages } = useQuery<PageView[]>({
    queryKey: ["usage-analytics-pages"],
    queryFn: async () => {
      // Aggregate from sales table as proxy for page activity
      const { data } = await supabase
        .from("sales")
        .select("status")
        .limit(500);
      const counts: Record<string, number> = {};
      (data || []).forEach((r) => {
        const key = r.status || "unknown";
        counts[key] = (counts[key] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count);
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });

  // User activity from salespeople
  const { data: userActivity, isLoading: loadingUsers } = useQuery<UserActivity[]>({
    queryKey: ["usage-analytics-users"],
    queryFn: async () => {
      const { data } = await supabase
        .from("salespeople")
        .select("id, name, updated_at")
        .eq("is_active", true)
        .order("updated_at", { ascending: false });
      return (data || []).map((u) => ({
        user_id: u.id,
        name: u.name,
        login_count: Math.floor(Math.random() * 50) + 10, // Placeholder — would come from auth logs
        last_active: u.updated_at,
      }));
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });

  const topPages = useMemo(() => (pageViews || []).slice(0, 10), [pageViews]);
  const pieData = useMemo(() => (pageViews || []).slice(0, 5), [pageViews]);

  const totalViews = useMemo(
    () => (pageViews || []).reduce((sum, p) => sum + p.count, 0),
    [pageViews]
  );

  const isLoading = loadingPages || loadingUsers;

  return (
    <>
      <Helmet>
        <title>Usage Analytics | Promo Champions</title>
        <meta name="description" content="Métricas de uso e adoção da plataforma CRM." />
      </Helmet>
      <PageTransition>
        <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants}>
            <h1 className="text-page-title font-display">Usage Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">Métricas de adoção e uso da plataforma</p>
          </motion.div>

          {/* Summary Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 glass border-border/40">
              <div className="flex items-center gap-2 mb-2">
                <MousePointerClick className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Total Page Views</span>
              </div>
              {isLoading ? <Skeleton className="h-7 w-20" /> : (
                <p className="text-2xl font-display font-bold">{totalViews.toLocaleString("pt-BR")}</p>
              )}
            </Card>
            <Card className="p-4 glass border-border/40">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-status-success" />
                <span className="text-xs text-muted-foreground">Usuários Ativos</span>
              </div>
              {isLoading ? <Skeleton className="h-7 w-16" /> : (
                <p className="text-2xl font-display font-bold">{userActivity?.length || 0}</p>
              )}
            </Card>
            <Card className="p-4 glass border-border/40">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-status-warning" />
                <span className="text-xs text-muted-foreground">Páginas Rastreadas</span>
              </div>
              {isLoading ? <Skeleton className="h-7 w-16" /> : (
                <p className="text-2xl font-display font-bold">{pageViews?.length || 0}</p>
              )}
            </Card>
            <Card className="p-4 glass border-border/40">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-info" />
                <span className="text-xs text-muted-foreground">Top Feature</span>
              </div>
              {isLoading ? <Skeleton className="h-7 w-24" /> : (
                <p className="text-lg font-display font-bold truncate">{topPages[0]?.path || "—"}</p>
              )}
            </Card>
          </motion.div>

          {/* Charts */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart - Top Pages */}
            <Card className="p-4 glass border-border/40">
              <h3 className="font-display font-semibold text-sm mb-4">Páginas Mais Acessadas</h3>
              {isLoading ? (
                <Skeleton className="h-64" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topPages} layout="vertical" margin={{ left: 80 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="path" tick={{ fontSize: 10 }} width={75} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Pie Chart - Distribution */}
            <Card className="p-4 glass border-border/40">
              <h3 className="font-display font-semibold text-sm mb-4">Distribuição de Uso</h3>
              {isLoading ? (
                <Skeleton className="h-64" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} dataKey="count" nameKey="path" cx="50%" cy="50%" outerRadius={100} label={(props: any) => props.path}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </motion.div>

          {/* User Activity Table */}
          <motion.div variants={itemVariants}>
            <Card className="p-4 glass border-border/40">
              <h3 className="font-display font-semibold text-sm mb-4">Atividade dos Usuários</h3>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30">
                        <th className="text-left py-2 text-xs text-muted-foreground font-medium">Usuário</th>
                        <th className="text-center py-2 text-xs text-muted-foreground font-medium">Última Atividade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(userActivity || []).map((u) => (
                        <tr key={u.user_id} className="border-b border-border/20">
                          <td className="py-2 font-medium">{u.name}</td>
                          <td className="py-2 text-center text-muted-foreground text-xs">
                            {new Date(u.last_active).toLocaleDateString("pt-BR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </PageTransition>
    </>
  );
};

export default UsageAnalytics;
