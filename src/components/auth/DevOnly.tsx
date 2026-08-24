import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Email autorizado a visualizar ferramentas de desenvolvimento (Engine Health HUD, etc.).
 * Para liberar acesso a outra conta, basta cadastrá-la com este e-mail OU
 * definir `salespeople.role = 'dev'` para o registro vinculado.
 */
export const DEV_EMAIL = "dev@promobrindes.com.br";

export function useIsDev(): boolean {
  const { user, salesperson } = useAuth();
  const email = (user?.email ?? salesperson?.email ?? "").toLowerCase();
  return email === DEV_EMAIL || salesperson?.role === "dev";
}

export function DevOnly({ children }: { children: ReactNode }) {
  const isDev = useIsDev();
  if (!isDev) return null;
  return <>{children}</>;
}
