/**
 * @module useSuppliers
 * Re-exports from modular suppliers/ directory.
 * Maintains backward-compatible useSuppliers() composite hook.
 * @see src/hooks/suppliers/
 */
import { useSupplierList, useSupplierProducts, useRiskAssessments } from './suppliers/useSupplierQueries';
import { useSupplierMutations } from './suppliers/useSupplierMutations';
import { getPriceComparison, getBestSupplier } from './suppliers/useSupplierUtils';

export type { Supplier } from './suppliers/types';

export function useSuppliers() {
  const { data: suppliers, isLoading: suppliersLoading } = useSupplierList();
  const { data: supplierProducts, isLoading: productsLoading } = useSupplierProducts();
  const { data: riskAssessments, isLoading: assessmentsLoading } = useRiskAssessments();
  const mutations = useSupplierMutations();

  return {
    suppliers,
    suppliersLoading,
    supplierProducts,
    productsLoading,
    riskAssessments,
    assessmentsLoading,
    ...mutations,
    getPriceComparison: (productId: string) => getPriceComparison(supplierProducts, productId),
    getBestSupplier: (productId: string) => getBestSupplier(supplierProducts, productId),
  };
}
