import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TooltipTourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TooltipTourProps {
  steps: TooltipTourStep[];
  onComplete: () => void;
  onSkip?: () => void;
}

export const TooltipTour: FC<TooltipTourProps> = ({ steps, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[100] bg-black/50" />

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="bg-card border rounded-lg shadow-xl p-4 max-w-sm">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-primary/10">
                  <Lightbulb className="h-4 w-4 text-primary" />
                </div>
                <h4 className="font-semibold">{step.title}</h4>
              </div>
              {onSkip && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={onSkip}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Content */}
            <p className="text-sm text-muted-foreground mb-4">
              {step.content}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition-colors",
                      i === currentStep ? "bg-primary" : "bg-muted"
                    )}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button variant="ghost" size="sm" onClick={handlePrev}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                <Button size="sm" onClick={handleNext}>
                  {isLastStep ? "Entendi!" : (
                    <>
                      Próximo
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

// Hook para usar o tour
export const useTour = (tourKey: string) => {
  const [isActive, setIsActive] = useState(false);
  const storageKey = `tour_completed_${tourKey}`;

  const startTour = () => {
    setIsActive(true);
  };

  const completeTour = () => {
    setIsActive(false);
    localStorage.setItem(storageKey, 'true');
  };

  const skipTour = () => {
    setIsActive(false);
    localStorage.setItem(storageKey, 'skipped');
  };

  const hasCompleted = () => {
    return localStorage.getItem(storageKey) !== null;
  };

  return { isActive, startTour, completeTour, skipTour, hasCompleted };
};
