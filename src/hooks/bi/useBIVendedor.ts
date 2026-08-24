import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { biService } from "@/services/biService";
import { BIVendedorData } from "@/types/bi";

export function useBIVendedor() {
  const { salesperson } = useAuth();
  
  return useQuery({
    queryKey: ["bi-vendedor", salesperson?.id],
    queryFn: () => {
      if (!salesperson?.id) throw new Error("Vendedor não encontrado");
      return biService.getVendedorData({
        id: salesperson.id,
        commission_rate: salesperson.commission_rate
      });
    },
    enabled: !!salesperson?.id,
    staleTime: 60000,
    refetchInterval: 60000
  });
}

export type { BIVendedorData };
