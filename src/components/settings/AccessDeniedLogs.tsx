import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ShieldX, FileWarning, Search, CalendarIcon, X, TrendingUp, Bell, Loader2 } from "lucide-react";
import { format, startOfDay, endOfDay, subDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { AccessDeniedLogsTable } from "./AccessDeniedLogsTable";

export function AccessDeniedLogs() {
  const { isAdmin, isLoadingCurrentRole } = useUserRoles();
  const [searchEmail, setSearchEmail] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(subDays(new Date(), 7));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [isTestingAlert, setIsTestingAlert] = useState(false);

  const handleTestAlert = async () => {
    setIsTestingAlert(true);
    try {
      const { data, error } = await supabase.functions.invoke("access-denied-alerts");
      if (error) throw error;
      if (data?.spikesDetected && data.spikesDetected.length > 0) {
        toast({ title: "Alerta enviado!", description: `${data.spikesDetected.length} pico(s) detectado(s). Email enviado para admins.` });
      } else {
        toast({ title: "Nenhum pico detectado", description: data?.message || "Não há picos de acesso negado no momento." });
      }
    } catch (error: unknown) {
      console.error("Error testing alert:", error);
      toast({ title: "Erro ao testar alerta", description: error instanceof Error ? error.message : "Não foi possível executar o teste.", variant: "destructive" });
    } finally {
      setIsTestingAlert(false);
    }
  };

  const { data: logs, isLoading } = useQuery({
    queryKey: ["access-denied-logs", searchEmail, dateFrom?.toISOString(), dateTo?.toISOString()],
    queryFn: async () => {
      let query = supabase.from("access_denied_logs").select("*").order("created_at", { ascending: false }).limit(100);
      if (dateFrom) query = query.gte("created_at", startOfDay(dateFrom).toISOString());
      if (dateTo) query = query.lte("created_at", endOfDay(dateTo).toISOString());
      if (searchEmail.trim()) query = query.ilike("user_email", `%${searchEmail.trim()}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const chartData = useMemo(() => {
    if (!logs || logs.length === 0) return [];
    const countsByDay: Record<string, number> = {};
    logs.forEach(log => { const day = format(parseISO(log.created_at), "yyyy-MM-dd"); countsByDay[day] = (countsByDay[day] || 0) + 1; });
    return Object.entries(countsByDay).map(([date, count]) => ({ date, displayDate: format(parseISO(date), "dd/MM", { locale: ptBR }), count })).sort((a, b) => a.date.localeCompare(b.date));
  }, [logs]);

  const chartConfig = { count: { label: "Tentativas", color: "hsl(var(--warning))" } };

  if (isLoadingCurrentRole) return <Card><CardHeader><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-64" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>;

  if (!isAdmin) return (
    <Card className="border-destructive/20">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4"><ShieldX className="h-8 w-8 text-destructive" /></div>
        <h3 className="font-semibold text-lg mb-2">Acesso Restrito</h3>
        <p className="text-muted-foreground max-w-md">Apenas administradores podem visualizar os logs de auditoria de segurança.</p>
      </CardContent>
    </Card>
  );

  if (isLoading) return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><FileWarning className="h-5 w-5 text-warning" />Logs de Acesso Negado</CardTitle></CardHeader>
      <CardContent><div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div></CardContent>
    </Card>
  );

  const clearFilters = () => { setSearchEmail(""); setDateFrom(subDays(new Date(), 7)); setDateTo(new Date()); };
  const hasActiveFilters = searchEmail.trim() !== "" || dateFrom?.toDateString() !== subDays(new Date(), 7).toDateString() || dateTo?.toDateString() !== new Date().toDateString();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><FileWarning className="h-5 w-5 text-warning" />Logs de Acesso Negado</CardTitle>
            <CardDescription>Registro de tentativas de acesso a páginas restritas (últimos 100 registros)</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleTestAlert} disabled={isTestingAlert} className="gap-2">
            {isTestingAlert ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}Testar Alerta
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 p-4 rounded-lg bg-muted/30 border">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por email..." value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} className="pl-9" />
            </div>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[160px] justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />{dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Data inicial"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} locale={ptBR} initialFocus /></PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[160px] justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />{dateTo ? format(dateTo, "dd/MM/yyyy") : "Data final"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={dateTo} onSelect={setDateTo} locale={ptBR} initialFocus /></PopoverContent>
          </Popover>
          {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground"><X className="h-4 w-4 mr-1" />Limpar</Button>}
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <Card className="border-border/40">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-warning" />Tentativas por Dia</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                  <Bar dataKey="count" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} name="Tentativas" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        <div className="text-sm text-muted-foreground">{logs?.length || 0} registro(s) encontrado(s)</div>
        <AccessDeniedLogsTable logs={logs || []} />
      </CardContent>
    </Card>
  );
}
