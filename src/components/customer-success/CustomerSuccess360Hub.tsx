import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Heart, AlertTriangle, TrendingUp, DollarSign, Ticket, Calendar, Activity, Sparkles, Smile, Briefcase, Download, Filter, Search, Info, PieChart as PieIcon } from "lucide-react";
import { format, subDays, startOfMonth, parseISO, isWithinInterval, startOfDay, endOfDay, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, Cell, PieChart, Pie } from "recharts";
import { useState, useMemo } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Papa from "papaparse";
import { useCustomerSuccess360 } from "@/hooks/customer-success/useCustomerSuccess360";
import { formatBRL, daysUntil, renewalSemaphore, RENEWAL_STATUS_LABEL, TICKET_STATUS_LABEL, ONBOARDING_STATUS_LABEL, EXPANSION_TYPE_LABEL } from "./cs360Helpers";
import { HelpdeskConnectorPanel } from "./HelpdeskConnectorPanel";
import { SurveyTriggerDialog } from "./SurveyTriggerDialog";
import { useToast } from "@/hooks/use-toast";

const fadeIn = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

const SEMA_BG: Record<string, string> = {
  green: "bg-success/15 text-success border-success/30",
  yellow: "bg-warning/15 text-warning border-warning/30",
  orange: "bg-warning/20 text-warning border-warning/40",
  red: "bg-destructive/15 text-destructive border-destructive/30",
  gray: "bg-muted text-muted-foreground border-border",
};

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(var(--info))",
  "hsl(var(--accent))"
];

export function CustomerSuccess360Hub() {
  const { data, isLoading } = useCustomerSuccess360();
  const { toast } = useToast();
  const [period, setPeriod] = useState("30");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [orderModalStatus, setOrderModalStatus] = useState<string | null>(null);
  const [orderSearch, setOrderSearch] = useState("");

  const s = data?.summary;
  const accounts = data?.accounts ?? [];
  const tickets = data?.tickets ?? [];
  const renewals = data?.renewals ?? [];
  const usage = data?.usage ?? [];
  const onboarding = data?.onboarding ?? [];
  const expansion = data?.expansion ?? [];
  const surveys = data?.surveys ?? [];
  const qbrs = data?.qbrs ?? [];
  const orders = data?.orders ?? [];

  // Data Filtering by Period
  const filteredData = useMemo(() => {
    if (!data) return null;
    const now = new Date();
    let start: Date;
    let end = now;

    if (period === "custom") {
      start = startDate ? parseISO(startDate) : subDays(now, 30);
      end = endDate ? parseISO(endDate) : now;
    } else if (period === "0") {
      start = new Date(0);
    } else {
      start = subDays(now, parseInt(period));
    }

    const filterByDate = (item: any, dateField: string = "created_at") => {
      const date = parseISO(item[dateField]);
      return isWithinInterval(date, { start: startOfDay(start), end: endOfDay(end) });
    };

    return {
      tickets: tickets.filter(t => filterByDate(t)),
      expansion: expansion.filter(e => filterByDate(e)),
      surveys: surveys.filter(s => s.responded_at ? filterByDate(s, "responded_at") : false),
      renewals: renewals.filter(r => filterByDate(r, "renewal_date")),
      orders: orders.filter(o => filterByDate(o)),
    };
  }, [data, period, startDate, endDate, tickets, expansion, surveys, renewals, orders]);

  // Evolution Data (LTV & Ticket Médio)
  const evolutionData = useMemo(() => {
    const months: Record<string, { ltv: number; count: number }> = {};
    renewals.forEach(r => {
      const month = format(parseISO(r.renewal_date), "MMM yy", { locale: ptBR });
      if (!months[month]) months[month] = { ltv: 0, count: 0 };
      months[month].ltv += Number(r.contract_value);
      months[month].count += 1;
    });

    return Object.entries(months).map(([name, val]) => ({
      name,
      ltv: val.ltv,
      ticket: val.ltv / (val.count || 1)
    })).sort((a, b) => {
      const dateA = parseISO(`01 ${a.name.replace(" ", " 20")}`);
      const dateB = parseISO(`01 ${b.name.replace(" ", " 20")}`);
      return dateA.getTime() - dateB.getTime();
    }).slice(-12);
  }, [renewals]);

  // Cohort Analysis (True First Purchase based on account creation)
  const cohortData = useMemo(() => {
    const cohorts: Record<string, { month: string; retained: number; churned: number; revenue: number }> = {};
    
    accounts.forEach(a => {
      const createdAt = (a as any).created_at;
      if (!createdAt) return;
      const month = format(startOfMonth(parseISO(createdAt)), "MMM yy", { locale: ptBR });
      if (!cohorts[month]) cohorts[month] = { month, retained: 0, churned: 0, revenue: 0 };
      
      // Retention simulation: Health > 50 is retained
      if (a.health_v2 >= 50) cohorts[month].retained += 1;
      else cohorts[month].churned += 1;
      
      cohorts[month].revenue += a.annual_revenue || 0;
    });

    return Object.values(cohorts).sort((a, b) => {
      const dateA = parseISO(`01 ${a.month.replace(" ", " 20")}`);
      const dateB = parseISO(`01 ${b.month.replace(" ", " 20")}`);
      return dateA.getTime() - dateB.getTime();
    }).slice(-6);
  }, [accounts]);

  const ordersByStatus = useMemo(() => {
    const statusMap: Record<string, { count: number; value: number; color: string; status: string; key: string }> = {
      delivered: { status: "Pago/Entregue", count: 0, value: 0, color: "text-success", key: "delivered" },
      pending: { status: "Pendente", count: 0, value: 0, color: "text-warning", key: "pending" },
      cancelled: { status: "Cancelado", count: 0, value: 0, color: "text-destructive", key: "cancelled" },
    };

    const targetOrders = filteredData?.orders || [];
    targetOrders.forEach(o => {
      const s = o.status === "paid" || o.status === "delivered" ? "delivered" : o.status === "cancelled" ? "cancelled" : "pending";
      if (statusMap[s]) {
        statusMap[s].count += 1;
        statusMap[s].value += Number(o.total || 0);
      }
    });

    return Object.values(statusMap);
  }, [filteredData?.orders]);

  const cancellationStats = useMemo(() => {
    const reasons: Record<string, number> = {};
    orders.filter(o => o.status === "cancelled").forEach(o => {
      const reason = o.cancellation_reason || "Não informado";
      reasons[reason] = (reasons[reason] || 0) + 1;
    });

    return Object.entries(reasons)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [orders]);

  const handleDateChange = (type: "start" | "end", value: string) => {
    if (type === "start") {
      if (endDate && value && isAfter(parseISO(value), parseISO(endDate))) {
        toast({
          title: "Data inválida",
          description: "A data inicial não pode ser posterior à data final.",
          variant: "destructive",
        });
        return;
      }
      setStartDate(value);
    } else {
      if (startDate && value && isAfter(parseISO(startDate), parseISO(value))) {
        toast({
          title: "Data inválida",
          description: "A data final não pode ser anterior à data inicial.",
          variant: "destructive",
        });
        return;
      }
      setEndDate(value);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Customer Success 360 - Relatório", 10, 10);
    // Simplified export logic
    (doc as any).autoTable({
      head: [["KPI", "Valor"]],
      body: [
        ["Health Médio", `${s?.avg_health_v2}/100`],
        ["Tickets Abertos", s?.open_tickets],
        ["Receita em Risco", formatBRL(s?.renewals_at_risk_value || 0)],
      ],
      startY: 20
    });
    doc.save(`cs360-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const exportCSV = () => {
    const csv = Papa.unparse(accounts.map(a => ({
      Nome: a.name,
      Tier: a.tier,
      Health: a.health_v2,
      Receita: a.annual_revenue,
      Tickets: a.open_tickets
    })));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `cs360-accounts-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const accountById = new Map(accounts.map((a) => [a.id, a]));

  return (
    <div className="p-6 space-y-6">
      <Helmet>
        <title>Customer Success 360 | Promo Champions</title>
        <meta name="description" content="Health Score, renovações, tickets, adoção, onboarding, expansion e QBR em uma visão única." />
      </Helmet>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div {...fadeIn}>
          <h1 className="text-3xl font-display font-bold gradient-text">Customer Success 360</h1>
          <p className="text-muted-foreground mt-1">Health, retenção, expansão e adoção em uma visão consolidada</p>
        </motion.div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
                <SelectItem value="0">Tudo</SelectItem>
              </SelectContent>
            </Select>

            {period === "custom" && (
              <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-300">
                <Input
                  type="date"
                  className="w-[130px] h-9"
                  value={startDate}
                  onChange={(e) => handleDateChange("start", e.target.value)}
                />
                <span className="text-muted-foreground text-xs">até</span>
                <Input
                  type="date"
                  className="w-[130px] h-9"
                  value={endDate}
                  onChange={(e) => handleDateChange("end", e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportPDF} className="h-9">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={exportCSV} className="h-9">
              <Activity className="h-4 w-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>
      </div>

      {s && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPI title="Health Médio" value={`${s.avg_health_v2}/100`} sub={`${s.total_accounts} contas`} icon={<Heart className="h-4 w-4 text-primary" />} />
          <KPI title="Tickets Abertos" value={s.open_tickets.toString()} sub={`${s.urgent_tickets} urgentes`} icon={<Ticket className="h-4 w-4 text-warning" />} accent={s.urgent_tickets > 0 ? "warning" : undefined} />
          <KPI title="Renovações 90d" value={s.renewals_90d.toString()} sub={`${s.renewals_30d} em 30d • ${s.renewals_at_risk} em risco`} icon={<Calendar className="h-4 w-4 text-info" />} />
          <KPI title="Receita em Risco" value={formatBRL(s.renewals_at_risk_value)} sub="Renovações at_risk" icon={<AlertTriangle className="h-4 w-4 text-destructive" />} accent={s.renewals_at_risk_value > 0 ? "destructive" : undefined} />
          <KPI title="CSAT Médio" value={s.avg_csat ? `${s.avg_csat}/5` : "—"} sub={`CES ${s.avg_ces || "—"}`} icon={<Smile className="h-4 w-4 text-success" />} />
          <KPI title="Onboarding Ativo" value={s.onboarding_active.toString()} sub={`${s.onboarding_stalled} travados`} icon={<Activity className="h-4 w-4 text-primary" />} />
          <KPI title="Expansion Pipeline" value={formatBRL(s.expansion_pipeline_value)} sub={`${s.expansion_opportunities} oportunidades`} icon={<TrendingUp className="h-4 w-4 text-success" />} />
          <KPI title="QBRs em 30d" value={s.upcoming_qbrs_30d.toString()} sub="Agendamento ativo" icon={<Briefcase className="h-4 w-4 text-info" />} />
        </div>
      )}

      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="cohorts">Coortes</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="health">Health v2</TabsTrigger>
          <TabsTrigger value="renewals">Renovações</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="usage">Adoção</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="expansion">Expansion</TabsTrigger>
          <TabsTrigger value="surveys">CSAT/CES</TabsTrigger>
          <TabsTrigger value="qbr">QBR</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Evolução do LTV (Receita Acumulada)</CardTitle></CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(val) => `R$${val / 1000}k`} />
                    <Tooltip formatter={(val: any) => [formatBRL(Number(val)), "LTV"]} />
                    <Bar dataKey="ltv" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Ticket Médio por Período</CardTitle></CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(val) => `R$${val}`} />
                    <Tooltip formatter={(val: any) => [formatBRL(Number(val)), "Ticket Médio"]} />
                    <Line type="monotone" dataKey="ticket" stroke="hsl(var(--success))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cohorts" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Análise de Coortes (Retenção por Mês de Renovação)</CardTitle></CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cohortData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="month" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="retained" name="Retidos (Health > 40)" stackId="a" fill="hsl(var(--success))" />
                  <Bar dataKey="churned" name="Risco/Churn" stackId="a" fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Pedidos por Status</CardTitle>
              <CardDescription>Resumo financeiro de pedidos filtrados pelo período selecionado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-4 text-left font-medium">Status</th>
                      <th className="p-4 text-center font-medium">Qtd. Pedidos</th>
                      <th className="p-4 text-right font-medium">Volume Total</th>
                      <th className="p-4 text-center font-medium">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersByStatus.map((row, i) => (
                      <tr key={i} className="border-b transition-colors hover:bg-muted/30">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${row.color.replace("text-", "bg-")}`} />
                            <span className={`font-semibold ${row.color}`}>{row.status}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">{row.count}</td>
                        <td className="p-4 text-right font-mono font-medium">{formatBRL(row.value)}</td>
                        <td className="p-4 text-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-3"
                            onClick={() => setOrderModalStatus(row.key)}
                          >
                            Ver Detalhes
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {ordersByStatus.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                          Nenhum pedido encontrado no período.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <Dialog open={!!orderModalStatus} onOpenChange={(open) => {
          if (!open) {
            setOrderModalStatus(null);
            setOrderSearch("");
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
            <div className="p-6 pb-2">
              <DialogHeader>
                <DialogTitle>Detalhes dos Pedidos: {ordersByStatus.find(s => s.key === orderModalStatus)?.status}</DialogTitle>
                <DialogDescription>
                  Lista completa de pedidos com este status no período selecionado.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-6">
              {orderModalStatus === "cancelled" && cancellationStats.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start bg-muted/30 p-4 rounded-xl border border-border/50">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <PieIcon className="h-4 w-4 text-destructive" />
                      Motivos de Cancelamento
                    </h4>
                    <div className="space-y-1">
                      {cancellationStats.slice(0, 5).map((stat, i) => (
                        <div key={i} className="flex justify-between text-xs items-center">
                          <span className="text-muted-foreground truncate max-w-[180px]">{stat.name}</span>
                          <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-bold">
                            {stat.value}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="h-[140px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={cancellationStats}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={50}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {cancellationStats.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                          itemStyle={{ fontSize: "12px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente ou número do pedido..."
                  className="pl-10"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>

              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left">Pedido</th>
                      <th className="p-3 text-left">Cliente</th>
                      <th className="p-3 text-left">Data</th>
                      <th className="p-3 text-right">Valor</th>
                      <th className="p-3 text-left">Informações Extras</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(filteredData?.orders || [])
                      .filter(o => {
                        const s = o.status === "paid" || o.status === "delivered" ? "delivered" : o.status === "cancelled" ? "cancelled" : "pending";
                        if (s !== orderModalStatus) return false;
                        
                        if (!orderSearch) return true;
                        
                        const search = orderSearch.toLowerCase();
                        const orderNum = o.order_number?.toString().toLowerCase() || "";
                        const accountName = accountById.get((o as any).account_id)?.name.toLowerCase() || "";
                        
                        return orderNum.includes(search) || accountName.includes(search);
                      })
                      .map((o) => (
                        <tr key={o.id} className="border-b transition-colors hover:bg-muted/10">
                          <td className="p-3 font-medium">#{o.order_number}</td>
                          <td className="p-3">{accountById.get(o.account_id)?.name ?? "—"}</td>
                          <td className="p-3 text-muted-foreground">{format(parseISO(o.created_at), "dd/MM/yyyy HH:mm")}</td>
                          <td className="p-3 text-right font-mono font-medium">{formatBRL(o.total)}</td>
                          <td className="p-3">
                            {o.cancellation_reason && (
                              <Badge variant="outline" className="text-destructive font-normal border-destructive/20 bg-destructive/5">
                                Motivo: {o.cancellation_reason}
                              </Badge>
                            )}
                            {!o.cancellation_reason && o.status === "pending" && (
                              <span className="text-xs text-muted-foreground italic">Aguardando pagamento</span>
                            )}
                            {!o.cancellation_reason && o.status !== "pending" && (
                              <span className="text-xs text-muted-foreground italic">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    {(filteredData?.orders || [])
                      .filter(o => {
                        const s = o.status === "paid" || o.status === "delivered" ? "delivered" : o.status === "cancelled" ? "cancelled" : "pending";
                        if (s !== orderModalStatus) return false;
                        const search = orderSearch.toLowerCase();
                        const orderNum = o.order_number?.toString().toLowerCase() || "";
                        const accountName = accountById.get(o.account_id)?.name.toLowerCase() || "";
                        return orderNum.includes(search) || accountName.includes(search);
                      }).length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground italic">
                            Nenhum pedido encontrado.
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Top contas em risco</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {accounts.filter((a) => a.health_v2 < 50).slice(0, 10).map((a) => (
                <div key={a.id} className="flex items-center justify-between border border-border/40 rounded-lg p-3">
                  <div>
                    <div className="font-semibold">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.tier} • {a.open_tickets} tickets • Renovação: {a.next_renewal ?? "—"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-destructive">{a.health_v2}</div>
                    <Progress value={a.health_v2} className="h-1.5 w-24" />
                  </div>
                </div>
              ))}
              {accounts.filter((a) => a.health_v2 < 50).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhuma conta crítica no momento 🎉</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Health Score v2 — todas as contas</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {accounts.slice(0, 30).map((a) => (
                <div key={a.id} className="border border-border/40 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{a.name}</span>
                      <Badge variant="outline" className="text-xs">{a.tier}</Badge>
                    </div>
                    <span className="text-lg font-bold">{a.health_v2}</span>
                  </div>
                  <Progress value={a.health_v2} className="h-1.5" />
                  <div className="text-xs text-muted-foreground">
                    Tickets abertos: {a.open_tickets} • Adoção: {a.adoption_score ?? "—"} • Renovação: {a.next_renewal ?? "—"}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="renewals" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Pipeline de renovação</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {renewals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma renovação cadastrada ainda.</p>
              ) : renewals.map((r) => {
                const d = daysUntil(r.renewal_date);
                const sema = renewalSemaphore(d);
                return (
                  <div key={r.id} className={`border rounded-lg p-3 flex items-center justify-between ${SEMA_BG[sema]}`}>
                    <div>
                      <div className="font-semibold">{accountById.get(r.account_id)?.name ?? "—"}</div>
                      <div className="text-xs opacity-80">{r.renewal_date} • {d !== null ? `${d}d` : "—"} • {RENEWAL_STATUS_LABEL[r.status]}</div>
                    </div>
                    <div className="font-bold">{formatBRL(Number(r.contract_value))}</div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Tickets abertos</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {tickets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum ticket aberto.</p>
              ) : tickets.map((t) => (
                <div key={t.id} className="border border-border/40 rounded-lg p-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{t.subject}</div>
                    <div className="text-xs text-muted-foreground">{accountById.get(t.account_id)?.name ?? "—"} • {new Date(t.created_at).toLocaleDateString("pt-BR")}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={t.priority === "urgent" ? "destructive" : "outline"} className="text-xs">{t.priority}</Badge>
                    <Badge variant="secondary" className="text-xs">{TICKET_STATUS_LABEL[t.status]}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Adoção de produto</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {usage.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma métrica de uso disponível.</p>
              ) : usage.slice(0, 30).map((u) => (
                <div key={u.account_id} className="border border-border/40 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{accountById.get(u.account_id)?.name ?? "—"}</span>
                    <span className="text-sm font-bold">{u.adoption_score}/100</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">DAU {u.dau} • WAU {u.wau} • MAU {u.mau} • Último login: {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString("pt-BR") : "—"}</div>
                  <Progress value={u.adoption_score} className="h-1.5 mt-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Jornadas de onboarding</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {onboarding.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma jornada cadastrada.</p>
              ) : onboarding.map((o) => {
                const pct = o.total_steps > 0 ? Math.round((o.current_step / o.total_steps) * 100) : 0;
                return (
                  <div key={o.id} className="border border-border/40 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{accountById.get(o.account_id)?.name ?? "—"}</span>
                      <Badge variant={o.status === "stalled" ? "destructive" : "secondary"} className="text-xs">{ONBOARDING_STATUS_LABEL[o.status]}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Passo {o.current_step} de {o.total_steps}</div>
                    <Progress value={pct} className="h-1.5 mt-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expansion" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" />Oportunidades de expansão</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {expansion.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma oportunidade identificada ainda.</p>
              ) : expansion.map((e) => (
                <div key={e.id} className="border border-border/40 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{accountById.get(e.account_id)?.name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{EXPANSION_TYPE_LABEL[e.type]} • Confiança: {e.confidence_score}%</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-success">{formatBRL(Number(e.estimated_value))}</div>
                    <Badge variant="outline" className="text-xs mt-1">{e.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surveys" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Respostas CSAT / CES</CardTitle>
              {accounts[0] && (
                <SurveyTriggerDialog accountId={accounts[0].id} accountName={accounts[0].name} />
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {surveys.filter((sv) => sv.responded_at).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma resposta de CSAT/CES ainda.</p>
              ) : surveys.filter((sv) => sv.responded_at).slice(0, 30).map((sv) => (
                <div key={sv.id} className="border border-border/40 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{sv.account_id ? accountById.get(sv.account_id)?.name ?? "—" : "—"}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs uppercase">{sv.survey_type}</Badge>
                      <span className="font-bold">{sv.score}</span>
                    </div>
                  </div>
                  {sv.comment && <p className="text-xs text-muted-foreground mt-1">"{sv.comment}"</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qbr" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Agenda de QBR</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {qbrs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum QBR agendado ainda.</p>
              ) : qbrs.map((q) => (
                <div key={q.id} className="border border-border/40 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{accountById.get(q.account_id)?.name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">Frequência: {q.frequency} • Último: {q.last_qbr_at ?? "—"}</div>
                  </div>
                  <Badge variant="outline">{q.next_qbr_at ?? "Não agendado"}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4">
          <HelpdeskConnectorPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KPI({ title, value, sub, icon, accent }: { title: string; value: string; sub: string; icon: React.ReactNode; accent?: "destructive" | "warning" }) {
  const valueClass = accent === "destructive" ? "text-destructive" : accent === "warning" ? "text-warning" : "";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}
