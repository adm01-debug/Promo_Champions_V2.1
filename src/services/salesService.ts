import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Sale, CreateSaleInput } from "@/types/sales";
import { SALE_STATUS_LABELS } from "@/constants";

export const salesService = {
  async getSales(searchTerm?: string): Promise<Sale[]> {
    let query = supabase
      .from("sales")
      .select(`
        *,
        client:clients(name),
        product:products(id, name, price, sku)
      `)
      .order("created_at", { ascending: false })
      .limit(100);

    if (searchTerm) {
      query = query.or(`client_name.ilike.%${searchTerm}%,product_name.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((sale: any) => ({
      id: sale.id.substring(0, 8).toUpperCase(),
      fullId: sale.id,
      cliente: sale.client?.name || sale.client_name,
      produto: sale.product?.name || sale.product_name,
      valor: Number(sale.amount || 0),
      status: sale.status,
      statusLabel: SALE_STATUS_LABELS[sale.status] || sale.status,
      data: format(new Date(sale.created_at), "dd/MM/yyyy", { locale: ptBR }),
      created_at: sale.created_at,
      client_id: sale.client_id,
      product_id: sale.product_id,
      salesperson_id: sale.salesperson_id,
      sku: sale.sku || sale.product?.sku,
      ai_prediction_score: sale.ai_prediction_score,
      ai_prediction_reasoning: sale.ai_prediction_reasoning,
      whatsapp_status: sale.whatsapp_status,
      whatsapp_last_interaction: sale.whatsapp_last_interaction,
    }));
  },

  async createSale(input: CreateSaleInput) {
    const { data, error } = await supabase
      .from("sales")
      .insert([input])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
