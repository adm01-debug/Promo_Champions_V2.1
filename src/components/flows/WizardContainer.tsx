import { FC, ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { StepIndicator } from './StepIndicator';
import { cn } from '@/lib/utils';

interface WizardStep {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
  isValid?: boolean;
}

interface WizardContainerProps {
  steps: WizardStep[];
  onComplete: () => void;
  onCancel?: () => void;
  title?: string;
  completeLabel?: string;
  className?: string;
}

export const WizardContainer: FC<WizardContainerProps> = ({
  steps,
  onComplete,
  onCancel,
  title,
  completeLabel = "Concluir",
  className
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];
  const canProceed = currentStepData.isValid !== false;

  const goNext = () => {
    if (isLastStep) {
      onComplete();
    } else if (canProceed) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const goBack = () => {
    if (!isFirstStep) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (index: number) => {
    setDirection(index > currentStep ? 1 : -1);
    setCurrentStep(index);
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -100 : 100, opacity: 0 })
  };

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {onCancel && (
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <StepIndicator
          steps={steps.map(s => ({ id: s.id, title: s.title }))}
          currentStep={currentStep}
          onStepClick={goToStep}
        />
      </CardHeader>

      <CardContent className="min-h-[300px] relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.2 }}
            className="w-full"
          >
            <div className="space-y-2 mb-6">
              <h3 className="text-lg font-medium">{currentStepData.title}</h3>
              {currentStepData.description && (
                <p className="text-sm text-muted-foreground">
                  {currentStepData.description}
                </p>
              )}
            </div>
            {currentStepData.content}
          </motion.div>
        </AnimatePresence>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <Button
          variant="outline"
          onClick={goBack}
          disabled={isFirstStep}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>

        <div className="text-sm text-muted-foreground">
          {currentStep + 1} de {steps.length}
        </div>

        <Button
          onClick={goNext}
          disabled={!canProceed}
          className="gap-2"
        >
          {isLastStep ? completeLabel : "Próximo"}
          {!isLastStep && <ChevronRight className="h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  );
};
