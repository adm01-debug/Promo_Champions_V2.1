import { supabase } from "@/integrations/supabase/client";
import { CommercialGoal } from "@/types";

export const goalsService = {
  async getGoals(salespersonId?: string): Promise<CommercialGoal[]> {
    let query = supabase
      .from('sales_goals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (salespersonId) {
      query = query.eq('salesperson_id', salespersonId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as CommercialGoal[];
  }
};
