import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Supplier {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  cnpj: string | null;
  category: string | null;
  payment_terms: string | null;
  lead_time_days: number | null;
  reliability_score: number | null;
  is_active: boolean | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface SupplierProduct {
  id: string;
  supplier_id: string;
  product_id: string;
  unit_price: number;
  min_order_quantity: number;
  currency: string;
  last_price_update: string;
  is_preferred: boolean;
  suppliers?: Supplier;
  products?: {
    id: string;
    name: string;
    price: number;
  };
}

interface RiskAssessment {
  id: string;
  supplier_id: string;
  assessment_date: string;
  financial_risk: number;
  delivery_risk: number;
  quality_risk: number;
  overall_risk: number;
  risk_level: string;
  factors: Record<string, unknown>;
  recommendations: string | null;
}

export function useSuppliers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all suppliers
  const { data: suppliers, isLoading: suppliersLoading } = useQuery({
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

  // Get supplier products with price comparison
  const { data: supplierProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['supplier-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_products')
        .select(`
          *,
          suppliers (id, name, reliability_score, lead_time_days),
          products (id, name, price)
        `)
        .order('unit_price', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Get risk assessments
  const { data: riskAssessments, isLoading: assessmentsLoading } = useQuery({
    queryKey: ['supplier-risk-assessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_risk_assessments')
        .select(`
          *,
          suppliers (name)
        `)
        .order('assessment_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create supplier
  const createSupplier = useMutation({
    mutationFn: async (supplier: { name: string; contact_name?: string; email?: string; phone?: string; cnpj?: string; category?: string; payment_terms?: string; lead_time_days?: number }) => {
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

  // Update supplier
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

  // Delete supplier
  const deleteSupplier = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

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

  // Add supplier product (price)
  const addSupplierProduct = useMutation({
    mutationFn: async (data: { supplier_id: string; product_id: string; unit_price: number; min_order_quantity?: number }) => {
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

  // Create risk assessment
  const createRiskAssessment = useMutation({
    mutationFn: async (assessment: { supplier_id: string; financial_risk?: number; delivery_risk?: number; quality_risk?: number; recommendations?: string }) => {
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

  // Get price comparison for a product
  const getPriceComparison = (productId: string) => {
    if (!supplierProducts) return [];
    
    return supplierProducts
      .filter(sp => sp.product_id === productId)
      .sort((a, b) => a.unit_price - b.unit_price);
  };

  // Get best supplier for a product
  const getBestSupplier = (productId: string) => {
    const comparison = getPriceComparison(productId);
    if (comparison.length === 0) return null;

    // Prefer suppliers with best price-to-reliability ratio
    return comparison.reduce((best, current) => {
      const currentScore = (1 / current.unit_price) * (current.suppliers?.reliability_score || 0.5);
      const bestScore = (1 / best.unit_price) * (best.suppliers?.reliability_score || 0.5);
      return currentScore > bestScore ? current : best;
    });
  };

  return {
    // Data
    suppliers,
    suppliersLoading,
    supplierProducts,
    productsLoading,
    riskAssessments,
    assessmentsLoading,
    
    // Mutations
    createSupplier: createSupplier.mutate,
    updateSupplier: updateSupplier.mutate,
    deleteSupplier: deleteSupplier.mutate,
    addSupplierProduct: addSupplierProduct.mutate,
    createRiskAssessment: createRiskAssessment.mutate,
    
    // Loading states
    isCreating: createSupplier.isPending,
    isUpdating: updateSupplier.isPending,
    isDeleting: deleteSupplier.isPending,
    
    // Utility functions
    getPriceComparison,
    getBestSupplier,
  };
}
