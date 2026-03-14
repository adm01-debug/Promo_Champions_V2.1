import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const DashboardHeader = () => {
  const { salesperson } = useAuth();
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const firstName = salesperson?.name?.split(" ")[0] || "Usuário";

  return (
    <div className="space-y-0.5">
      <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground">
        {getGreeting()}, {firstName} 👋
      </h1>
      <p className="text-sm text-muted-foreground capitalize">{today}</p>
    </div>
  );
};
