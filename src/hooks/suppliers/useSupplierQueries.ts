import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Supplier } from './types';

export function useSupplierList() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Supplier[];
    },
  });
}

export function useSupplierProducts() {
  return useQuery({
    queryKey: ['supplier-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_products')
        .select(`*, suppliers (id, name, reliability_score, lead_time_days), products (id, name, price)`)
        .order('unit_price', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useRiskAssessments() {
  return useQuery({
    queryKey: ['supplier-risk-assessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_risk_assessments')
        .select(`*, suppliers (name)`)
        .order('assessment_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
