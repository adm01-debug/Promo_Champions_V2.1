// Melhorias 55-59 - General Performance Optimizations

// ✅ 55. Debounce em Searches
import { useDebounce } from '@/improvements/hooks/security-performance-bundle';

export const SearchInput = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  
  const { data } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: () => searchAPI(debouncedSearch),
    enabled: debouncedSearch.length > 2,
  });
  
  return <input onChange={(e) => setSearch(e.target.value)} />;
};

// ✅ 56. Throttle em Scroll Events
import { useThrottle } from '@/improvements/hooks/security-performance-bundle';

export const InfiniteScroll = () => {
  const handleScroll = useThrottle((e) => {
    // Check if near bottom
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
      loadMore();
    }
  }, 200);
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
};

// ✅ 57. Memoization de Componentes
export const DealCard = React.memo(({ deal }) => {
  return <Card>{deal.title}</Card>;
}, (prevProps, nextProps) => {
  return prevProps.deal.id === nextProps.deal.id &&
         prevProps.deal.updated_at === nextProps.deal.updated_at;
});

// ✅ 58. useMemo em Cálculos
export const SalesDashboard = ({ deals }) => {
  const totalRevenue = useMemo(() => {
    return deals.reduce((sum, deal) => sum + deal.value, 0);
  }, [deals]);
  
  const avgDealValue = useMemo(() => {
    return deals.length > 0 ? totalRevenue / deals.length : 0;
  }, [deals, totalRevenue]);
  
  return <div>{totalRevenue} / {avgDealValue}</div>;
};

// ✅ 59. useCallback em Handlers
export const Parent = () => {
  const handleClick = useCallback((id) => {
    updateDeal(id);
  }, []); // Não recria a função
  
  return deals.map(deal => (
    <DealCard key={deal.id} deal={deal} onClick={handleClick} />
  ));
};
