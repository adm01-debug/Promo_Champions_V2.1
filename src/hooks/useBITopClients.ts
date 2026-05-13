import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth } from "date-fns";

export interface TopClientData {
  name: string;
  company: string | null;
  totalValue: number;
  ordersCount: number;
}

export interface SupplierSalesData {
  supplierName: string;
  totalValue: number;
  productsCount: number;
  itemsCount: number;
}

export interface TopCompanyData {
  company: string;
  totalValue: number;
  ordersCount: number;
}

export interface BITopClientsData {
  topClients: TopClientData[];
  supplierSales: SupplierSalesData[];
  topCompanies: TopCompanyData[];
}

export function useBITopClients() {
  return useQuery({
    queryKey: ["bi-top-clients"],
    queryFn: async (): Promise<BITopClientsData> => {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const [salesRes, clientsRes, supplierOrdersRes, supplierOrderItemsRes, suppliersRes] = await Promise.all([
        supabase
          .from("sales")
          .select("client_name, amount, status, created_at")
          .eq("status", "completed")
          .gte("created_at", monthStart.toISOString())
          .lte("created_at", monthEnd.toISOString()),
        supabase
          .from("clients")
          .select("name, company"),
        supabase
          .from("supplier_orders")
          .select("id, supplier_id, total_amount, status"),
        supabase
          .from("supplier_order_items")
          .select("order_id, product_id, quantity"),
        supabase
          .from("suppliers")
          .select("id, name"),
      ]);

      const sales = salesRes.data || [];
      const clients = clientsRes.data || [];
      const supplierOrders = supplierOrdersRes.data || [];
      const supplierOrderItems = supplierOrderItemsRes.data || [];
      const suppliers = suppliersRes.data || [];

      // Build client->company map
      const clientCompanyMap = new Map<string, string | null>();
      clients.forEach(c => clientCompanyMap.set(c.name.toLowerCase(), c.company));

      // Top clients by revenue
      const clientMap = new Map<string, { totalValue: number; ordersCount: number }>();
      sales.forEach(s => {
        const key = s.client_name;
        const existing = clientMap.get(key) || { totalValue: 0, ordersCount: 0 };
        existing.totalValue += Number(s.amount);
        existing.ordersCount += 1;
        clientMap.set(key, existing);
      });

      const topClients: TopClientData[] = Array.from(clientMap.entries())
        .map(([name, data]) => ({
          name,
          company: clientCompanyMap.get(name.toLowerCase()) || null,
          totalValue: data.totalValue,
          ordersCount: data.ordersCount,
        }))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 10);

      // Top companies by revenue
      const companyMap = new Map<string, { totalValue: number; ordersCount: number }>();
      sales.forEach(s => {
        const company = clientCompanyMap.get(s.client_name.toLowerCase()) || "Sem empresa";
        const existing = companyMap.get(company) || { totalValue: 0, ordersCount: 0 };
        existing.totalValue += Number(s.amount);
        existing.ordersCount += 1;
        companyMap.set(company, existing);
      });

      const topCompanies: TopCompanyData[] = Array.from(companyMap.entries())
        .map(([company, data]) => ({
          company,
          totalValue: data.totalValue,
          ordersCount: data.ordersCount,
        }))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 10);

      // Supplier sales
      const supplierMap = new Map<string, string>();
      suppliers.forEach(s => supplierMap.set(s.id, s.name));

      const supplierDataMap = new Map<string, { totalValue: number; productIds: Set<string>; itemsCount: number }>();
      supplierOrders.forEach(order => {
        const supplierId = order.supplier_id || "unknown";
        const existing = supplierDataMap.get(supplierId) || { totalValue: 0, productIds: new Set(), itemsCount: 0 };
        existing.totalValue += Number(order.total_amount);
        
        const orderItems = supplierOrderItems.filter(item => item.order_id === order.id);
        orderItems.forEach(item => {
          if (item.product_id) existing.productIds.add(item.product_id);
          existing.itemsCount += Number(item.quantity || 1);
        });
        
        supplierDataMap.set(supplierId, existing);
      });

      const supplierSales: SupplierSalesData[] = Array.from(supplierDataMap.entries())
        .map(([supplierId, data]) => ({
          supplierName: supplierMap.get(supplierId) || "Sem fornecedor",
          totalValue: data.totalValue,
          productsCount: data.productIds.size,
          itemsCount: data.itemsCount,
        }))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 10);

      return { topClients, supplierSales, topCompanies };
    },
    staleTime: 60000,
    refetchInterval: 60000,
  });
}
