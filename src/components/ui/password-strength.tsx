import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Check, X, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  regex: RegExp;
  met: boolean;
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const requirements = useMemo((): PasswordRequirement[] => [
    { label: "Mínimo 8 caracteres", regex: /.{8,}/, met: /.{8,}/.test(password) },
    { label: "Letra maiúscula", regex: /[A-Z]/, met: /[A-Z]/.test(password) },
    { label: "Letra minúscula", regex: /[a-z]/, met: /[a-z]/.test(password) },
    { label: "Número", regex: /[0-9]/, met: /[0-9]/.test(password) },
    { label: "Caractere especial", regex: /[^A-Za-z0-9]/, met: /[^A-Za-z0-9]/.test(password) },
  ], [password]);

  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };
    
    const metCount = requirements.filter(r => r.met).length;
    
    if (metCount <= 1) {
      return { score: 20, label: "Muito fraca", color: "bg-destructive" };
    } else if (metCount === 2) {
      return { score: 40, label: "Fraca", color: "bg-orange-500" };
    } else if (metCount === 3) {
      return { score: 60, label: "Média", color: "bg-amber-500" };
    } else if (metCount === 4) {
      return { score: 80, label: "Forte", color: "bg-emerald-500" };
    } else {
      return { score: 100, label: "Muito forte", color: "bg-emerald-600" };
    }
  }, [password, requirements]);

  const getIcon = () => {
    if (strength.score <= 40) {
      return <ShieldAlert className="h-5 w-5 text-destructive" />;
    } else if (strength.score <= 60) {
      return <Shield className="h-5 w-5 text-amber-500" />;
    } else {
      return <ShieldCheck className="h-5 w-5 text-emerald-500" />;
    }
  };

  if (!password) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="text-sm font-medium">Força da Senha</span>
          </div>
          <span className={cn(
            "text-sm font-semibold",
            strength.score <= 40 && "text-destructive",
            strength.score > 40 && strength.score <= 60 && "text-amber-500",
            strength.score > 60 && "text-emerald-500"
          )}>
            {strength.label}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out rounded-full",
              strength.color
            )}
            style={{ width: `${strength.score}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="grid grid-cols-2 gap-2">
        {requirements.map((req, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-2 text-xs p-2 rounded-lg transition-colors",
              req.met 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                : "bg-muted/50 text-muted-foreground"
            )}
          >
            {req.met ? (
              <Check className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 shrink-0" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
