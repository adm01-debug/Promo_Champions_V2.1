import { motion } from "framer-motion";
import { Check, Moon, Sun, Monitor, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useCustomTheme, AccentColor, ThemeMode } from "@/hooks/useCustomTheme";
import { cn } from "@/lib/utils";

const ACCENT_COLOR_LABELS: Record<AccentColor, string> = {
  purple: "Roxo",
  blue: "Azul",
  green: "Verde",
  orange: "Laranja",
  pink: "Rosa",
  cyan: "Ciano",
  amber: "Âmbar",
  rose: "Rosé",
};

const ACCENT_COLOR_CLASSES: Record<AccentColor, string> = {
  purple: "bg-purple-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
  cyan: "bg-cyan-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
};

const MODE_OPTIONS: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Claro", icon: <Sun className="h-4 w-4" /> },
  { value: "dark", label: "Escuro", icon: <Moon className="h-4 w-4" /> },
  { value: "system", label: "Sistema", icon: <Monitor className="h-4 w-4" /> },
];

export function ThemeCustomizer() {
  const {
    config,
    accentColors,
    setAccentColor,
    setMode,
    setReducedMotion,
    setHighContrast,
    resetToDefaults,
  } = useCustomTheme();

  return (
    <div className="bg-gradient-to-br from-card/80 to-card/40 border border-border/20 shadow-2xl backdrop-blur-md rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-border/10">
        <h3 className="font-display font-black text-lg uppercase tracking-tighter italic flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" />
          Appearance Module
        </h3>
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">
          Customize system interface and aesthetics
        </p>
      </div>
      <div className="p-6 space-y-6">

        {/* Theme Mode */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Modo do Tema</Label>
          <div className="flex gap-2">
            {MODE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={config.mode === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setMode(option.value)}
                className="flex-1 gap-2"
              >
                {option.icon}
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Cor de Destaque</Label>
          <div className="grid grid-cols-4 gap-3">
            {accentColors.map((color) => (
              <motion.button
                key={color}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAccentColor(color)}
                className={cn(
                  "relative h-12 rounded-lg transition-all",
                  ACCENT_COLOR_CLASSES[color],
                  config.accentColor === color && "ring-2 ring-offset-2 ring-offset-background ring-foreground"
                )}
                title={ACCENT_COLOR_LABELS[color]}
              >
                {config.accentColor === color && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Check className="h-5 w-5 text-primary-foreground drop-shadow-md" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Selecionado: {ACCENT_COLOR_LABELS[config.accentColor]}
          </p>
        </div>

        {/* Accessibility Options */}
        <div className="space-y-4 pt-4 border-t border-border">
          <Label className="text-sm font-medium">Acessibilidade</Label>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduced-motion" className="text-sm">
                Reduzir Movimento
              </Label>
              <p className="text-xs text-muted-foreground">
                Desativa animações e transições
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={config.reducedMotion}
              onCheckedChange={setReducedMotion}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast" className="text-sm">
                Alto Contraste
              </Label>
              <p className="text-xs text-muted-foreground">
                Aumenta o contraste para melhor legibilidade
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={config.highContrast}
              onCheckedChange={setHighContrast}
            />
          </div>
        </div>

        {/* Reset */}
        <div className="pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="w-full"
          >
            Restaurar Padrões
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
