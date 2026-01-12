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

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
          {getGreeting()}, {salesperson?.name?.split(" ")[0] || "Usuário"}! 👋
        </h1>
        <p className="text-muted-foreground capitalize">{today}</p>
      </div>
    </div>
  );
};
