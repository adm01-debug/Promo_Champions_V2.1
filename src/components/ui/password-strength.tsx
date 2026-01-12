import { useMemo, useState, useEffect } from "react";
import { Check, X, Shield, ShieldAlert, ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
  className?: string;
  onStrengthChange?: (isStrong: boolean) => void;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

// SHA-1 hash function for HIBP API
async function sha1(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// Check if password has been leaked using Have I Been Pwned API (k-anonymity)
async function checkLeakedPassword(password: string): Promise<{ leaked: boolean; count: number }> {
  try {
    const hash = await sha1(password);
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' }
    });

    if (!response.ok) {
      if (import.meta.env.DEV) {
        console.error('HIBP API error:', response.status);
      }
      return { leaked: false, count: 0 };
    }

    const text = await response.text();
    const lines = text.split('\n');

    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(':');
      if (hashSuffix.trim() === suffix) {
        const count = parseInt(countStr.trim(), 10);
        return { leaked: count > 0, count };
      }
    }

    return { leaked: false, count: 0 };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error checking leaked password:', error);
    }
    return { leaked: false, count: 0 };
  }
}

export function PasswordStrength({ password, className, onStrengthChange }: PasswordStrengthProps) {
  const [leakCheck, setLeakCheck] = useState<{ checking: boolean; leaked: boolean; count: number }>({
    checking: false,
    leaked: false,
    count: 0
  });

  // Debounced leak check
  useEffect(() => {
    if (!password || password.length < 8) {
      setLeakCheck({ checking: false, leaked: false, count: 0 });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLeakCheck(prev => ({ ...prev, checking: true }));
      const result = await checkLeakedPassword(password);
      setLeakCheck({ checking: false, leaked: result.leaked, count: result.count });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [password]);

  const requirements = useMemo((): PasswordRequirement[] => [
    { label: "Mínimo 8 caracteres", met: password.length >= 8 },
    { label: "Letra maiúscula (A-Z)", met: /[A-Z]/.test(password) },
    { label: "Letra minúscula (a-z)", met: /[a-z]/.test(password) },
    { label: "Número (0-9)", met: /[0-9]/.test(password) },
    { label: "Caractere especial (!@#$%)", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password) },
  ], [password]);

  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };
    
    const metCount = requirements.filter(r => r.met).length;
    
    // Penalize leaked passwords heavily
    if (leakCheck.leaked) {
      return { score: 10, label: "Comprometida!", color: "bg-destructive" };
    }
    
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
  }, [password, requirements, leakCheck.leaked]);

  // Notify parent about strength
  useEffect(() => {
    if (onStrengthChange) {
      const isStrong = requirements.every(r => r.met) && !leakCheck.leaked && !leakCheck.checking;
      onStrengthChange(isStrong);
    }
  }, [requirements, leakCheck, onStrengthChange]);

  const getIcon = () => {
    if (leakCheck.leaked) {
      return <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />;
    }
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
          <div className="flex items-center gap-2">
            {leakCheck.checking && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <span className={cn(
              "text-sm font-semibold",
              leakCheck.leaked && "text-destructive",
              !leakCheck.leaked && strength.score <= 40 && "text-destructive",
              !leakCheck.leaked && strength.score > 40 && strength.score <= 60 && "text-amber-500",
              !leakCheck.leaked && strength.score > 60 && "text-emerald-500"
            )}>
              {strength.label}
            </span>
          </div>
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

      {/* Leaked Password Warning */}
      {leakCheck.leaked && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 animate-fade-in">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-destructive">
              Senha comprometida!
            </p>
            <p className="text-xs text-destructive/80">
              Esta senha aparece em {leakCheck.count.toLocaleString('pt-BR')} vazamentos de dados. 
              Escolha uma senha diferente para sua segurança.
            </p>
          </div>
        </div>
      )}

      {/* Requirements Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {requirements.map((req, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-2 text-xs p-2 rounded-lg transition-all duration-300",
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
        
        {/* Leak Check Status */}
        <div
          className={cn(
            "flex items-center gap-2 text-xs p-2 rounded-lg transition-all duration-300 sm:col-span-2",
            leakCheck.checking && "bg-muted/50 text-muted-foreground",
            !leakCheck.checking && !leakCheck.leaked && password.length >= 8 && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            leakCheck.leaked && "bg-destructive/10 text-destructive"
          )}
        >
          {leakCheck.checking ? (
            <>
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
              <span>Verificando vazamentos...</span>
            </>
          ) : leakCheck.leaked ? (
            <>
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>Senha encontrada em vazamentos</span>
            </>
          ) : password.length >= 8 ? (
            <>
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>Sem vazamentos conhecidos</span>
            </>
          ) : (
            <>
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span>Verificação após 8 caracteres</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
