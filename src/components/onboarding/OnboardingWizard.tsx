import { FC, useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: ReactNode;
  illustration?: string;
  action?: {
    label: string;
    onClick: () => void | Promise<void>;
  };
  skipable?: boolean;
}

interface OnboardingWizardProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  onSkip?: () => void;
  initialStep?: number;
}

export const OnboardingWizard: FC<OnboardingWizardProps> = ({
  steps,
  onComplete,
  onSkip,
  initialStep = 0
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async () => {
    if (step.action) {
      setLoading(true);
      try {
        await step.action.onClick();
      } finally {
        setLoading(false);
      }
    }

    if (isLast) {
      onComplete();
    } else {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0
    })
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Passo {currentStep + 1} de {steps.length}
            </span>
            {onSkip && (
              <Button variant="ghost" size="sm" onClick={onSkip}>
                Pular introdução
              </Button>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step content */}
        <div className="bg-card border rounded-xl shadow-lg overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="p-8"
            >
              {step.illustration && (
                <div className="flex justify-center mb-6">
                  <img 
                    src={step.illustration} 
                    alt="" 
                    className="h-48 object-contain"
                  />
                </div>
              )}

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {step.description}
                </p>
              </div>

              <div className="mb-8">
                {step.content}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between p-4 border-t bg-muted/30">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={isFirst}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            {/* Step indicators */}
            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentStep ? 1 : -1);
                    setCurrentStep(index);
                  }}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    index === currentStep
                      ? 'bg-primary w-6'
                      : index < currentStep
                        ? 'bg-primary/50'
                        : 'bg-muted-foreground/30'
                  )}
                  aria-label={`Ir para passo ${index + 1}`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                'Processando...'
              ) : isLast ? (
                'Concluir'
              ) : step.action ? (
                step.action.label
              ) : (
                <>
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Spotlight tour component
interface SpotlightStep {
  target: string; // CSS selector
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface SpotlightTourProps {
  steps: SpotlightStep[];
  onComplete: () => void;
  onSkip?: () => void;
}

export const SpotlightTour: FC<SpotlightTourProps> = ({
  steps,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  useEffect(() => {
    const target = document.querySelector(step.target);
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [step.target]);

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  if (!targetRect) return null;

  const tooltipPosition = {
    top: { top: targetRect.top - 120, left: targetRect.left + targetRect.width / 2 },
    bottom: { top: targetRect.bottom + 16, left: targetRect.left + targetRect.width / 2 },
    left: { top: targetRect.top + targetRect.height / 2, left: targetRect.left - 280 },
    right: { top: targetRect.top + targetRect.height / 2, left: targetRect.right + 16 }
  }[step.position || 'bottom'];

  return (
    <>
      {/* Overlay with spotlight */}
      <div className="fixed inset-0 z-50">
        <svg className="w-full h-full">
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="8"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      </div>

      {/* Highlight border */}
      <div
        className="fixed z-50 pointer-events-none border-2 border-primary rounded-lg ring-4 ring-primary/20"
        style={{
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8
        }}
      />

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed z-50 w-64 bg-card border rounded-lg shadow-lg p-4"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: step.position === 'left' || step.position === 'right' 
            ? 'translateY(-50%)' 
            : 'translateX(-50%)'
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">
            {currentStep + 1} de {steps.length}
          </span>
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Pular
            </button>
          )}
        </div>

        <h3 className="font-semibold mb-1">{step.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

        <div className="flex justify-end gap-2">
          {currentStep > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep(prev => prev - 1)}
            >
              Anterior
            </Button>
          )}
          <Button size="sm" onClick={handleNext}>
            {isLast ? 'Concluir' : 'Próximo'}
          </Button>
        </div>
      </motion.div>
    </>
  );
};
