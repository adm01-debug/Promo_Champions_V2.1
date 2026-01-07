import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Sparkles, Target, BarChart3, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TourStep {
  id: string;
  target?: string; // CSS selector
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  position?: "top" | "bottom" | "left" | "right" | "center";
  highlight?: boolean;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao Sales Arena! 🎉",
    description: "Vamos fazer um tour rápido pelas principais funcionalidades. Isso levará menos de 1 minuto.",
    icon: Sparkles,
    position: "center",
  },
  {
    id: "dashboard",
    target: "[data-tour='stats']",
    title: "Seus Números",
    description: "Aqui você acompanha faturamento, vendas, clientes e conversão em tempo real.",
    icon: BarChart3,
    position: "bottom",
    highlight: true,
  },
  {
    id: "goals",
    target: "[data-tour='goals']",
    title: "Metas e Progresso",
    description: "Visualize seu progresso em relação às metas. A barra se preenche conforme você vende!",
    icon: Target,
    position: "left",
    highlight: true,
  },
  {
    id: "gamification",
    target: "[data-tour='gamification']",
    title: "Gamificação",
    description: "Complete desafios, ganhe XP e suba no ranking. Vendas viram conquistas!",
    icon: Trophy,
    position: "top",
    highlight: true,
  },
  {
    id: "shortcuts",
    title: "Atalhos Rápidos ⌘K",
    description: "Pressione Cmd+K (ou Ctrl+K) a qualquer momento para acessar a navegação rápida.",
    icon: Zap,
    position: "center",
  },
];

interface InteractiveTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function InteractiveTour({ isOpen, onComplete, onSkip }: InteractiveTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = tourSteps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === tourSteps.length - 1;
  const isCentered = step.position === "center" || !step.target;

  // Find and highlight target element
  useEffect(() => {
    if (step.target) {
      const target = document.querySelector(step.target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [step.target]);

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  }, [isLast, onComplete]);

  const handlePrev = useCallback(() => {
    if (!isFirst) {
      setCurrentStep(prev => prev - 1);
    }
  }, [isFirst]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight" || e.key === "Enter") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "Escape") {
        onSkip();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onSkip]);

  if (!isOpen) return null;

  const getTooltipPosition = () => {
    if (!targetRect || isCentered) {
      return { 
        top: "50%", 
        left: "50%", 
        transform: "translate(-50%, -50%)" 
      };
    }

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    switch (step.position) {
      case "bottom":
        return {
          top: targetRect.bottom + padding,
          left: targetRect.left + targetRect.width / 2,
          transform: "translateX(-50%)",
        };
      case "top":
        return {
          top: targetRect.top - tooltipHeight - padding,
          left: targetRect.left + targetRect.width / 2,
          transform: "translateX(-50%)",
        };
      case "left":
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.left - tooltipWidth - padding,
          transform: "translateY(-50%)",
        };
      case "right":
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.right + padding,
          transform: "translateY(-50%)",
        };
      default:
        return {
          top: targetRect.bottom + padding,
          left: targetRect.left + targetRect.width / 2,
          transform: "translateX(-50%)",
        };
    }
  };

  const Icon = step.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

        {/* Spotlight on target */}
        {targetRect && step.highlight && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute pointer-events-none border-2 border-primary rounded-xl ring-4 ring-primary/20"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
              }}
            />
            {/* Pulse effect */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute pointer-events-none border-2 border-primary rounded-xl"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
              }}
            />
          </>
        )}

        {/* Tooltip */}
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            "fixed z-[101] w-80 bg-card border border-border rounded-2xl shadow-2xl p-6",
            isCentered && "max-w-md w-[90vw]"
          )}
          style={getTooltipPosition() as React.CSSProperties}
        >
          {/* Skip button */}
          <button
            onClick={onSkip}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Pular tour"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">
              {currentStep + 1} de {tourSteps.length}
            </span>
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
          <p className="text-sm text-muted-foreground mb-6">{step.description}</p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {tourSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === currentStep
                    ? "w-6 bg-primary"
                    : index < currentStep
                      ? "w-1.5 bg-primary/50"
                      : "w-1.5 bg-muted"
                )}
                aria-label={`Ir para passo ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={isFirst}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1"
            >
              {isLast ? "Começar!" : "Próximo"}
              {!isLast && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}