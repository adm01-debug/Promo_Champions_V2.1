import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Supplier } from './types';

export function useSupplierMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createSupplier = useMutation({
    mutationFn: async (supplier: {
      name: string; contact_name?: string; email?: string;
      phone?: string; cnpj?: string; category?: string;
      payment_terms?: string; lead_time_days?: number;
    }) => {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([supplier])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Fornecedor criado", description: "Fornecedor adicionado com sucesso." });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const updateSupplier = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Supplier> & { id: string }) => {
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Fornecedor atualizado" });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const deleteSupplier = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Fornecedor removido" });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const addSupplierProduct = useMutation({
    mutationFn: async (data: {
      supplier_id: string; product_id: string;
      unit_price: number; min_order_quantity?: number;
    }) => {
      const { data: result, error } = await supabase
        .from('supplier_products')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({ title: "Produto vinculado ao fornecedor" });
      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const createRiskAssessment = useMutation({
    mutationFn: async (assessment: {
      supplier_id: string; financial_risk?: number;
      delivery_risk?: number; quality_risk?: number;
      recommendations?: string;
    }) => {
      const overallRisk = (
        (assessment.financial_risk || 0.5) +
        (assessment.delivery_risk || 0.5) +
        (assessment.quality_risk || 0.5)
      ) / 3;

      let riskLevel = 'low';
      if (overallRisk >= 0.75) riskLevel = 'critical';
      else if (overallRisk >= 0.5) riskLevel = 'high';
      else if (overallRisk >= 0.25) riskLevel = 'medium';

      const { data, error } = await supabase
        .from('supplier_risk_assessments')
        .insert([{
          supplier_id: assessment.supplier_id,
          financial_risk: assessment.financial_risk,
          delivery_risk: assessment.delivery_risk,
          quality_risk: assessment.quality_risk,
          overall_risk: overallRisk,
          risk_level: riskLevel,
          recommendations: assessment.recommendations,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Avaliação de risco criada" });
      queryClient.invalidateQueries({ queryKey: ['supplier-risk-assessments'] });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  return {
    createSupplier: createSupplier.mutate,
    updateSupplier: updateSupplier.mutate,
    deleteSupplier: deleteSupplier.mutate,
    addSupplierProduct: addSupplierProduct.mutate,
    createRiskAssessment: createRiskAssessment.mutate,
    isCreating: createSupplier.isPending,
    isUpdating: updateSupplier.isPending,
    isDeleting: deleteSupplier.isPending,
  };
}
