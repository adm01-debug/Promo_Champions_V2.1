import { useQuery } from "@tanstack/react-query";
import { biService } from "@/services/biService";
import { BIGestorData } from "@/types/bi";

export function useBIGestor() {
  return useQuery({
    queryKey: ["bi-gestor"],
    queryFn: () => biService.getGestorData(),
    staleTime: 60000,
    refetchInterval: 60000
  });
}

export type { BIGestorData };
