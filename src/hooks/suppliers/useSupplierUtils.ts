/**
 * Get price comparison for a product across suppliers.
 */
export function getPriceComparison(
  supplierProducts: Array<{ product_id: string; unit_price: number; suppliers?: { reliability_score?: number | null } | null }> | undefined,
  productId: string
) {
  if (!supplierProducts) return [];
  return supplierProducts
    .filter(sp => sp.product_id === productId)
    .sort((a, b) => a.unit_price - b.unit_price);
}

/**
 * Get the best supplier for a product based on price-to-reliability ratio.
 */
export function getBestSupplier(
  supplierProducts: Array<{ product_id: string; unit_price: number; suppliers?: { reliability_score?: number | null } | null }> | undefined,
  productId: string
) {
  const comparison = getPriceComparison(supplierProducts, productId);
  if (comparison.length === 0) return null;

  return comparison.reduce((best, current) => {
    const currentScore = (1 / current.unit_price) * (current.suppliers?.reliability_score || 0.5);
    const bestScore = (1 / best.unit_price) * (best.suppliers?.reliability_score || 0.5);
    return currentScore > bestScore ? current : best;
  });
}
