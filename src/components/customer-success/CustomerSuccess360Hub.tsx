import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Tabs } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo, useEffect } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Papa from "papaparse";
import { format, subDays, startOfMonth, parseISO, isWithinInterval, startOfDay, endOfDay, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useCustomerSuccess360 } from "@/hooks/customer-success/useCustomerSuccess360";
import { formatBRL } from "./cs360Helpers";
import { useToast } from "@/hooks/use-toast";

import { CS360Summary } from "./CS360Summary";
import { CS360Filters } from "./CS360Filters";
import { CS360Tabs } from "./CS360Tabs";
import { CS360OrdersDialog } from "./CS360OrdersDialog";

const fadeIn = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

export function CustomerSuccess360Hub() {
  const { data, isLoading, isError, error } = useCustomerSuccess360();
  const { toast } = useToast();
  
  const STORAGE_KEY = "cs360_state";

  const [period, setPeriod] = useState(() => localStorage.getItem(`${STORAGE_KEY}_period`) || "30");
  const [startDate, setStartDate] = useState(() => localStorage.getItem(`${STORAGE_KEY}_startDate`) || "");
  const [endDate, setEndDate] = useState(() => localStorage.getItem(`${STORAGE_KEY}_endDate`) || "");
  const [orderModalStatus, setOrderModalStatus] = useState<string | null>(() => localStorage.getItem(`${STORAGE_KEY}_modalStatus`) || null);
  const [orderSearch, setOrderSearch] = useState(() => localStorage.getItem(`${STORAGE_KEY}_orderSearch`) || "");
  const [orderPage, setOrderPage] = useState(() => Number(localStorage.getItem(`${STORAGE_KEY}_orderPage`)) || 1);
  const [orderSortField, setOrderSortField] = useState<string>(() => localStorage.getItem(`${STORAGE_KEY}_sortField`) || "created_at");
  const [orderSortOrder, setOrderSortOrder] = useState<"asc" | "desc">(() => (localStorage.getItem(`${STORAGE_KEY}_sortOrder`) as "asc" | "desc") || "desc");
  const orderItemsPerPage = 10;

  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_period`, period); }, [period]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_startDate`, startDate); }, [startDate]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_endDate`, endDate); }, [endDate]);
  useEffect(() => { 
    if (orderModalStatus) localStorage.setItem(`${STORAGE_KEY}_modalStatus`, orderModalStatus);
    else localStorage.removeItem(`${STORAGE_KEY}_modalStatus`);
  }, [orderModalStatus]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_orderSearch`, orderSearch); }, [orderSearch]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_orderPage`, orderPage.toString()); }, [orderPage]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_sortField`, orderSortField); }, [orderSortField]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_sortOrder`, orderSortOrder); }, [orderSortOrder]);

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

  const accountById = useMemo(() => {
    const map = new Map<string, any>();
    accounts.forEach(a => map.set(a.id, a));
    return map;
  }, [accounts]);

  const filteredData = useMemo(() => {
    if (!data) return null;
    const now = new Date();
    let start: Date;
    let end = now;

    if (period === "custom") {
      start = startDate ? parseISO(startDate) : subDays(now, 30);
      end = endDate ? parseISO(endDate) : now;
      if (isAfter(start, end)) [start, end] = [end, start];
    } else if (period === "0") {
      start = new Date(0);
    } else {
      start = subDays(now, parseInt(period));
    }

    const filterByDate = (item: any, dateField: string = "created_at") => {
      try {
        const dateStr = item[dateField];
        if (!dateStr) return true;
        const date = parseISO(dateStr);
        return isWithinInterval(date, { start: startOfDay(start), end: endOfDay(end) });
      } catch (e) {
        return true;
      }
    };

    return {
      tickets: tickets.filter(t => filterByDate(t)),
      expansion: expansion.filter(e => filterByDate(e)),
      surveys: surveys.filter(s => s.responded_at ? filterByDate(s, "responded_at") : false),
      renewals: renewals.filter(r => filterByDate(r, "renewal_date")),
      orders: orders.filter(o => filterByDate(o)),
    };
  }, [data, period, startDate, endDate, tickets, expansion, surveys, renewals, orders]);

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

  const cohortData = useMemo(() => {
    const cohorts: Record<string, { month: string; retained: number; churned: number; revenue: number }> = {};
    const firstOrderMap = new Map<string, string>();

    orders.forEach(o => {
      const accId = (o as any).account_id || o.user_id;
      const currentFirst = firstOrderMap.get(accId);
      if (!currentFirst || isAfter(parseISO(currentFirst), parseISO(o.created_at))) {
        firstOrderMap.set(accId, o.created_at);
      }
    });
    
    accounts.forEach(a => {
      const firstDate = firstOrderMap.get(a.id) || (a as any).created_at;
      if (!firstDate) return;
      
      const month = format(startOfMonth(parseISO(firstDate)), "MMM yy", { locale: ptBR });
      if (!cohorts[month]) cohorts[month] = { month, retained: 0, churned: 0, revenue: 0 };
      
      if (a.health_v2 >= 50) cohorts[month].retained += 1;
      else cohorts[month].churned += 1;
      
      cohorts[month].revenue += a.annual_revenue || 0;
    });

    return Object.values(cohorts).sort((a, b) => {
      const dateA = parseISO(`01 ${a.month.replace(" ", " 20")}`);
      const dateB = parseISO(`01 ${b.month.replace(" ", " 20")}`);
      return dateA.getTime() - dateB.getTime();
    }).slice(-12);
  }, [accounts, orders]);

  const ordersByStatus = useMemo(() => {
    const statusMap: Record<string, { count: number; value: number; color: string; status: string; key: string }> = {
      delivered: { status: "Pago/Entregue", count: 0, value: 0, color: "text-success", key: "delivered" },
      pending: { status: "Pendente", count: 0, value: 0, color: "text-warning", key: "pending" },
      cancelled: { status: "Cancelado", count: 0, value: 0, color: "text-destructive", key: "cancelled" },
    };

    (filteredData?.orders || []).forEach(o => {
      const s = o.status === "paid" || o.status === "delivered" ? "delivered" : o.status === "cancelled" ? "cancelled" : "pending";
      statusMap[s].count += 1;
      statusMap[s].value += Number(o.total);
    });

    return Object.values(statusMap);
  }, [filteredData?.orders]);

  const filteredModalOrders = useMemo(() => {
    if (!orderModalStatus) return [];
    
    return (filteredData?.orders || []).filter(o => {
      const s = o.status === "paid" || o.status === "delivered" ? "delivered" : o.status === "cancelled" ? "cancelled" : "pending";
      if (s !== orderModalStatus) return false;
      
      if (!orderSearch) return true;
      const search = orderSearch.toLowerCase();
      const orderNum = o.order_number?.toString().toLowerCase() || "";
      const accountName = accountById.get((o as any).account_id)?.name.toLowerCase() || "";
      return orderNum.includes(search) || accountName.includes(search);
    });
  }, [filteredData?.orders, orderModalStatus, orderSearch, accountById]);

  const sortedAndPaginatedOrders = useMemo(() => {
    const sorted = [...filteredModalOrders].sort((a, b) => {
      let valA: any = a[orderSortField as keyof typeof a];
      let valB: any = b[orderSortField as keyof typeof b];

      if (orderSortField === "account_name") {
        valA = accountById.get((a as any).account_id)?.name || "";
        valB = accountById.get((b as any).account_id)?.name || "";
      }

      if (valA < valB) return orderSortOrder === "asc" ? -1 : 1;
      if (valA > valB) return orderSortOrder === "asc" ? 1 : -1;
      return 0;
    });

    const start = (orderPage - 1) * orderItemsPerPage;
    return sorted.slice(start, start + orderItemsPerPage);
  }, [filteredModalOrders, orderSortField, orderSortOrder, orderPage, accountById]);

  const totalPages = Math.ceil(filteredModalOrders.length / orderItemsPerPage);

  const toggleSort = (field: string) => {
    if (orderSortField === field) setOrderSortOrder(orderSortOrder === "asc" ? "desc" : "asc");
    else { setOrderSortField(field); setOrderSortOrder("asc"); }
  };

  const handleDateChange = (type: "start" | "end", value: string) => {
    if (!value) {
      if (type === "start") setStartDate("");
      else setEndDate("");
      return;
    }

    const selectedDate = parseISO(value);
    if (type === "start") {
      if (endDate && isAfter(selectedDate, endOfDay(parseISO(endDate)))) {
        toast({ title: "Intervalo inválido", description: "A data inicial não pode ser posterior à data final.", variant: "destructive" });
        return;
      }
      setStartDate(value);
    } else {
      if (startDate && isAfter(startOfDay(parseISO(startDate)), selectedDate)) {
        toast({ title: "Intervalo inválido", description: "A data final não pode ser anterior à data inicial.", variant: "destructive" });
        return;
      }
      setEndDate(value);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF() as any;
    doc.text("Relatório Customer Success 360", 14, 15);
    const tableData = accounts.map(a => [a.name, a.tier, a.health_v2, a.annual_revenue, a.next_renewal]);
    doc.autoTable({ head: [["Conta", "Tier", "Health", "ARR", "Renovação"]], body: tableData, startY: 20 });
    doc.save(`cs360-report-${format(new Date(), "ddMMyy")}.pdf`);
  };

  const exportCSV = () => {
    const csv = Papa.unparse(accounts);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `cs360-data-${format(new Date(), "ddMMyy")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isError) return <div className="p-8 text-center text-destructive">Erro ao carregar dados: {(error as Error).message}</div>;

  return (
    <motion.div {...fadeIn} className="space-y-6 container mx-auto p-4 md:p-6 lg:p-8">
      <Helmet><title>CS 360 Hub | Promo Champions</title></Helmet>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black font-display uppercase tracking-tight italic">Customer Success 360</h1>
          <p className="text-muted-foreground mt-1 text-sm">Health, retenção, expansão e adoção em uma visão consolidada</p>
        </div>

        <CS360Filters 
          period={period} 
          setPeriod={setPeriod} 
          startDate={startDate} 
          endDate={endDate} 
          handleDateChange={handleDateChange}
          resetFilters={() => { setPeriod("30"); setStartDate(""); setEndDate(""); }}
          exportPDF={exportPDF}
          exportCSV={exportCSV}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
      ) : s && (
        <CS360Summary s={s} />
      )}

      <Tabs defaultValue="overview" className="w-full">
        <CS360Tabs 
          accounts={accounts}
          renewals={renewals}
          tickets={tickets}
          usage={usage}
          onboarding={onboarding}
          expansion={expansion}
          surveys={surveys}
          qbrs={qbrs}
          accountById={accountById}
          evolutionData={evolutionData}
          cohortData={cohortData}
          ordersByStatus={ordersByStatus}
          onStatusClick={setOrderModalStatus}
        />
      </Tabs>

      <CS360OrdersDialog 
        open={!!orderModalStatus} 
        onOpenChange={(open) => !open && setOrderModalStatus(null)}
        statusName={ordersByStatus.find(s => s.key === orderModalStatus)?.status || ""}
        orderSearch={orderSearch}
        setOrderSearch={setOrderSearch}
        orders={filteredModalOrders}
        accountById={accountById}
        orderSortField={orderSortField}
        orderSortOrder={orderSortOrder}
        toggleSort={toggleSort}
        sortedAndPaginatedOrders={sortedAndPaginatedOrders}
        orderPage={orderPage}
        setOrderPage={setOrderPage}
        totalPages={totalPages}
        ordersByStatus={ordersByStatus}
        orderModalStatus={orderModalStatus}
      />
    </motion.div>
  );
}
