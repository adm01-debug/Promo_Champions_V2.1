import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Star, Flame } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CustomFieldsDisplay } from "@/components/salespeople/CustomFieldsDisplay";

interface VendedorHeaderProps {
  salesperson: { id: string; name: string; email: string | null; avatar_url: string | null; commission_rate: number };
  goalProgress: number;
  salespersonId?: string;
}

export const VendedorHeader = memo(function VendedorHeader({ salesperson, goalProgress, salespersonId }: VendedorHeaderProps) {
  return (
    <div className="opacity-0 animate-fade-in-up">
      <Link to="/vendedores" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Voltar para Ranking</span>
      </Link>
      <div className="glass rounded-2xl p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24 ring-4 ring-primary/30 shadow-xl">
              <AvatarImage src={salesperson.avatar_url || undefined} alt={salesperson.name} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl font-bold">
                {salesperson.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            {goalProgress >= 100 && (
              <div className="absolute -top-1 -right-1 p-1.5 bg-success rounded-full shadow-lg">
                <Star className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-black">{salesperson.name}</h1>
            <p className="text-muted-foreground">{salesperson.email}</p>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                {salesperson.commission_rate}% comissão
              </span>
              {goalProgress >= 100 && (
                <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full font-medium flex items-center gap-1">
                  <Flame className="h-3 w-3" /> Meta batida!
                </span>
              )}
            </div>
            <CustomFieldsDisplay salespersonId={salespersonId} className="mt-2" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm text-muted-foreground">Progresso da Meta</span>
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" aria-label={`Progresso: ${goalProgress.toFixed(0)}%`}>
                <circle cx="64" cy="64" r="56" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle cx="64" cy="64" r="56" fill="none"
                  stroke={goalProgress >= 100 ? "hsl(var(--success))" : "url(#gradient)"}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${Math.min(goalProgress, 100) * 3.52} 352`} />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn("text-2xl font-black", goalProgress >= 100 ? "text-success" : "gradient-text")}>
                  {goalProgress.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
