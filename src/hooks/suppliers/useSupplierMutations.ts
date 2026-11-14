import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Supplier } from './types';

export function useSupplierMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createSupplier = useMutation({
    mutationFn: async (supplier: {
      name: string;
      contact_name?: string;
      email?: string;
      phone?: string;
      cnpj?: string;
      category?: string;
      payment_terms?: string;
      lead_time_days?: number;
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
      toast({
        title: 'Fornecedor criado',
        description: 'Fornecedor adicionado com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: error => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
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
      toast({ title: 'Fornecedor atualizado' });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: error => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const deleteSupplier = useMutation({
    mutationFn: async (id: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('suppliers')
        .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id ?? null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Fornecedor removido' });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: error => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const addSupplierProduct = useMutation({
    mutationFn: async (data: {
      supplier_id: string;
      product_id: string;
      unit_price: number;
      min_order_quantity?: number;
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
      toast({ title: 'Produto vinculado ao fornecedor' });
      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
    },
    onError: error => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const updateSupplierProduct = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      unit_price: number;
      min_order_quantity: number | null;
      is_preferred: boolean;
    }) => {
      const { data, error } = await supabase
        .from('supplier_products')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Sem permissão para editar este produto do fornecedor.');
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Produto do fornecedor atualizado' });
      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
      queryClient.invalidateQueries({ queryKey: ['price-history'] });
    },
    onError: error => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const deleteSupplierProduct = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('supplier_products')
        .delete()
        .eq('id', id)
        .select('id');
      if (error) throw error;
      // RLS bloqueia em silêncio (0 linhas): sem isso o toast de sucesso mentiria.
      if (!data || data.length === 0) {
        throw new Error('Sem permissão para excluir ou produto já removido.');
      }
    },
    onSuccess: () => {
      toast({ title: 'Produto removido do fornecedor' });
      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
      queryClient.invalidateQueries({ queryKey: ['price-history'] });
    },
    onError: error => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const createRiskAssessment = useMutation({
    mutationFn: async (assessment: {
      supplier_id: string;
      financial_risk?: number;
      delivery_risk?: number;
      quality_risk?: number;
      recommendations?: string;
    }) => {
      const overallRisk =
        ((assessment.financial_risk || 0.5) +
          (assessment.delivery_risk || 0.5) +
          (assessment.quality_risk || 0.5)) /
        3;

      let riskLevel = 'low';
      if (overallRisk >= 0.75) riskLevel = 'critical';
      else if (overallRisk >= 0.5) riskLevel = 'high';
      else if (overallRisk >= 0.25) riskLevel = 'medium';

      const { data, error } = await supabase
        .from('supplier_risk_assessments')
        .insert([
          {
            supplier_id: assessment.supplier_id,
            financial_risk: assessment.financial_risk,
            delivery_risk: assessment.delivery_risk,
            quality_risk: assessment.quality_risk,
            overall_risk: overallRisk,
            risk_level: riskLevel,
            recommendations: assessment.recommendations,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Avaliação de risco criada' });
      queryClient.invalidateQueries({ queryKey: ['supplier-risk-assessments'] });
    },
    onError: error => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  return {
    createSupplier: createSupplier.mutate,
    updateSupplier: updateSupplier.mutate,
    deleteSupplier: deleteSupplier.mutate,
    addSupplierProduct: addSupplierProduct.mutate,
    updateSupplierProduct: updateSupplierProduct.mutate,
    deleteSupplierProduct: deleteSupplierProduct.mutate,
    createRiskAssessment: createRiskAssessment.mutate,
    isCreating: createSupplier.isPending,
    isUpdating: updateSupplier.isPending,
    isDeleting: deleteSupplier.isPending,
    isUpdatingSupplierProduct: updateSupplierProduct.isPending,
    isDeletingSupplierProduct: deleteSupplierProduct.isPending,
  };
}
