import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SaleRecord {
  id: string;
  client_name: string;
  product_name: string;
  amount: number;
  status: string;
  category: string;
  source: string | null;
  created_at: string;
  salespeople?: { name: string } | null;
}

interface MetricRecord {
  id: string;
  date: string;
  revenue: number;
  total_sales: number;
  new_clients: number;
  avg_ticket: number;
  conversion_rate: number;
  revenue_goal: number;
}

interface CategoryRecord {
  id: string;
  date: string;
  category: string;
  percentage: number;
}

interface ReportData {
  sales: SaleRecord[];
  metrics: MetricRecord[];
  categories: CategoryRecord[];
}

const fetchReportData = async (startDate: Date, endDate: Date): Promise<ReportData> => {
  const start = format(startDate, "yyyy-MM-dd");
  const end = format(endDate, "yyyy-MM-dd");

  const [salesResult, metricsResult, categoriesResult] = await Promise.all([
    supabase
      .from("sales")
      .select("*, salespeople:salespeople!salesperson_id(name)")
      .gte("created_at", start)
      .lte("created_at", end)
      .order("created_at", { ascending: false }),
    supabase
      .from("daily_metrics")
      .select("*")
      .gte("date", start)
      .lte("date", end),
    supabase
      .from("category_metrics")
      .select("*")
      .gte("date", start)
      .lte("date", end),
  ]);

  return {
    sales: salesResult.data || [],
    metrics: metricsResult.data || [],
    categories: categoriesResult.data || [],
  };
};

const generateCSV = (data: Record<string, unknown>[], columns: { key: string; label: string }[]): string => {
  const header = columns.map((c) => c.label).join(",");
  const rows = data.map((item) =>
    columns
      .map((c) => {
        const value = item[c.key];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? "";
      })
      .join(",")
  );
  return [header, ...rows].join("\n");
};

const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadSalesReport = async (period: string = "30d") => {
  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
  const startDate = subDays(new Date(), days);
  const endDate = new Date();

  const { sales } = await fetchReportData(startDate, endDate);

  const columns = [
    { key: "client_name", label: "Cliente" },
    { key: "product_name", label: "Produto" },
    { key: "amount", label: "Valor" },
    { key: "status", label: "Status" },
    { key: "category", label: "Categoria" },
    { key: "source", label: "Origem" },
    { key: "created_at", label: "Data" },
  ];

  const formattedSales = sales.map((s) => ({
    ...s,
    created_at: format(new Date(s.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    amount: Number(s.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
  }));

  const csv = generateCSV(formattedSales, columns);
  const filename = `relatorio-vendas-${format(new Date(), "yyyy-MM-dd")}.csv`;
  downloadFile(csv, filename, "text/csv;charset=utf-8");
};

export const downloadClientsReport = async () => {
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("total_value", { ascending: false });

  const columns = [
    { key: "name", label: "Nome" },
    { key: "email", label: "E-mail" },
    { key: "phone", label: "Telefone" },
    { key: "company", label: "Empresa" },
    { key: "total_value", label: "Valor Total" },
    { key: "created_at", label: "Data Cadastro" },
  ];

  const formattedClients = (clients || []).map((c) => ({
    ...c,
    created_at: format(new Date(c.created_at), "dd/MM/yyyy", { locale: ptBR }),
    total_value: Number(c.total_value).toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
  }));

  const csv = generateCSV(formattedClients, columns);
  const filename = `relatorio-clientes-${format(new Date(), "yyyy-MM-dd")}.csv`;
  downloadFile(csv, filename, "text/csv;charset=utf-8");
};

export const downloadProductsReport = async () => {
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("sales_count", { ascending: false });

  const columns = [
    { key: "name", label: "Nome" },
    { key: "category", label: "Categoria" },
    { key: "price", label: "Preço" },
    { key: "sales_count", label: "Vendas" },
    { key: "rating", label: "Avaliação" },
    { key: "status", label: "Status" },
  ];

  const formattedProducts = (products || []).map((p) => ({
    ...p,
    price: Number(p.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
    rating: Number(p.rating).toFixed(1),
  }));

  const csv = generateCSV(formattedProducts, columns);
  const filename = `relatorio-produtos-${format(new Date(), "yyyy-MM-dd")}.csv`;
  downloadFile(csv, filename, "text/csv;charset=utf-8");
};
