import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TourStep {
  target: string; // data-tour attribute value
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

const tourSteps: TourStep[] = [
  {
    target: "stats",
    title: "Seus KPIs em destaque",
    description: "Acompanhe faturamento, vendas, clientes e conversão em tempo real. O card de faturamento é destacado como métrica principal.",
    position: "bottom",
  },
  {
    target: "goals",
    title: "Meta do Mês",
    description: "Visualize seu progresso em relação à meta mensal com micro-copy motivacional e barra animada.",
    position: "left",
  },
  {
    target: "gamification",
    title: "Gamificação & Desafios",
    description: "Complete desafios diários e semanais para ganhar XP, subir de nível e competir no ranking!",
    position: "top",
  },
];

const TOUR_DISMISSED_KEY = "product-tour-completed";

export function ProductTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const dismissed = localStorage.getItem(TOUR_DISMISSED_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const updateTargetRect = useCallback(() => {
    const step = tourSteps[currentStep];
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isVisible) return;
    updateTargetRect();
    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, true);
    return () => {
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
    };
  }, [isVisible, updateTargetRect]);

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem(TOUR_DISMISSED_KEY, "true");
  };

  const next = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      dismiss();
    }
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  if (!isVisible || !targetRect) return null;

  const step = tourSteps[currentStep];
  const pos = step.position || "bottom";

  // Calculate tooltip position
  const tooltipStyle: React.CSSProperties = {};
  const padding = 16;
  if (pos === "bottom") {
    tooltipStyle.top = targetRect.bottom + padding;
    tooltipStyle.left = targetRect.left + targetRect.width / 2;
    tooltipStyle.transform = "translateX(-50%)";
  } else if (pos === "top") {
    tooltipStyle.bottom = window.innerHeight - targetRect.top + padding;
    tooltipStyle.left = targetRect.left + targetRect.width / 2;
    tooltipStyle.transform = "translateX(-50%)";
  } else if (pos === "left") {
    tooltipStyle.top = targetRect.top + targetRect.height / 2;
    tooltipStyle.right = window.innerWidth - targetRect.left + padding;
    tooltipStyle.transform = "translateY(-50%)";
  } else {
    tooltipStyle.top = targetRect.top + targetRect.height / 2;
    tooltipStyle.left = targetRect.right + padding;
    tooltipStyle.transform = "translateY(-50%)";
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay with cutout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9990] pointer-events-auto"
            onClick={dismiss}
            style={{
              background: `radial-gradient(ellipse ${targetRect.width + 40}px ${targetRect.height + 40}px at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent 50%, rgba(0,0,0,0.6) 51%)`,
            }}
          />

          {/* Highlight border */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed z-[9991] pointer-events-none rounded-xl border-2 border-primary/60 shadow-lg shadow-primary/20"
            style={{
              top: targetRect.top - 6,
              left: targetRect.left - 6,
              width: targetRect.width + 12,
              height: targetRect.height + 12,
            }}
          />

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, y: pos === "bottom" ? -10 : pos === "top" ? 10 : 0, x: pos === "right" ? -10 : pos === "left" ? 10 : 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0 }}
            className="fixed z-[9992] w-72 bg-card border border-border rounded-xl shadow-2xl p-4 pointer-events-auto"
            style={tooltipStyle}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold">{step.title}</h3>
              </div>
              <button onClick={dismiss} className="p-0.5 hover:bg-muted rounded">
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{step.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                {currentStep + 1} / {tourSteps.length}
              </span>
              <div className="flex gap-1.5">
                {currentStep > 0 && (
                  <Button variant="ghost" size="sm" onClick={prev} className="h-7 px-2 text-xs">
                    <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
                    Anterior
                  </Button>
                )}
                <Button size="sm" onClick={next} className="h-7 px-3 text-xs">
                  {currentStep < tourSteps.length - 1 ? (
                    <>Próximo <ChevronRight className="h-3.5 w-3.5 ml-0.5" /></>
                  ) : (
                    "Concluir"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
