/**
 * Get price comparison for a product across suppliers.
 */
export function getPriceComparison<T extends { product_id: string | null; unit_price: number }>(
  supplierProducts: T[] | undefined,
  productId: string
): T[] {
  if (!supplierProducts) return [];
  return supplierProducts
    .filter((sp): sp is T & { product_id: string } => sp.product_id === productId)
    .sort((a, b) => a.unit_price - b.unit_price);
}

/**
 * Get the best supplier for a product based on price-to-reliability ratio.
 */
export function getBestSupplier<T extends { product_id: string | null; unit_price: number; suppliers?: { reliability_score?: number | null } | null }>(
  supplierProducts: T[] | undefined,
  productId: string
): T | null {
  const comparison = getPriceComparison(supplierProducts, productId);
  if (comparison.length === 0) return null;

  return comparison.reduce((best, current) => {
    const currentScore = (1 / current.unit_price) * (current.suppliers?.reliability_score || 0.5);
    const bestScore = (1 / best.unit_price) * (best.suppliers?.reliability_score || 0.5);
    return currentScore > bestScore ? current : best;
  });
}
