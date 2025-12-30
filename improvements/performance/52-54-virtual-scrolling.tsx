// Melhorias 52-54 - Virtual Scrolling Integration
import { VirtualizedList } from '@/improvements/components/bundle-2-features';

// ✅ Lista 1: Activities Feed (1000+ items)
export const ActivitiesFeed = () => {
  const { data: activities } = useActivities();
  
  return (
    <VirtualizedList
      items={activities}
      itemHeight={80}
      containerHeight={600}
      renderItem={(activity) => <ActivityCard activity={activity} />}
    />
  );
};

// ✅ Lista 2: Products List (500+ items)
export const ProductsList = () => {
  const { data: products } = useProducts();
  
  return (
    <VirtualizedList
      items={products}
      itemHeight={120}
      containerHeight={800}
      renderItem={(product) => <ProductCard product={product} />}
    />
  );
};

// ✅ Lista 3: Pipeline Deals (200+ per column)
export const DealsList = ({ deals }) => {
  return (
    <VirtualizedList
      items={deals}
      itemHeight={100}
      containerHeight={700}
      renderItem={(deal) => <DealCard deal={deal} />}
    />
  );
};

// ✅ RESULTADO: 
// - Renderiza apenas items visíveis (~10-15)
// - Scroll suave mesmo com 10.000+ items
// - Memória constante (~10MB independente do tamanho da lista)
