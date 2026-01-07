import { FC, ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
  isValid?: boolean;
}

interface WizardProps {
  steps: Step[];
  onComplete: () => void;
  onCancel?: () => void;
  className?: string;
}

export const Wizard: FC<WizardProps> = ({
  steps,
  onComplete,
  onCancel,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentStep = steps[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (!isFirst) setCurrentIndex(currentIndex - 1);
  };

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2",
                i < currentIndex 
                  ? "bg-primary text-primary-foreground border-primary"
                  : i === currentIndex 
                    ? "border-primary text-primary"
                    : "border-muted text-muted-foreground"
              )}>
                {i < currentIndex ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  "w-12 h-0.5 mx-2",
                  i < currentIndex ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
        <CardTitle>{currentStep?.title}</CardTitle>
        {currentStep?.description && (
          <p className="text-muted-foreground text-sm">{currentStep.description}</p>
        )}
      </CardHeader>
      <CardContent>
        {currentStep?.content}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleBack} 
            disabled={isFirst}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <Button 
            onClick={handleNext}
            disabled={currentStep?.isValid === false}
          >
            {isLast ? 'Concluir' : 'Próximo'}
            {!isLast && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

interface OnboardingStep {
  title: string;
  description: string;
  image?: string;
  icon?: ReactNode;
}

interface OnboardingCarouselProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  className?: string;
}

export const OnboardingCarousel: FC<OnboardingCarouselProps> = ({
  steps,
  onComplete,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentStep = steps[currentIndex];
  const isLast = currentIndex === steps.length - 1;

  return (
    <div className={cn("text-center max-w-md mx-auto", className)}>
      <div className="mb-8">
        {currentStep?.image ? (
          <img 
            src={currentStep.image} 
            alt={currentStep.title}
            className="w-48 h-48 mx-auto object-contain"
          />
        ) : currentStep?.icon ? (
          <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {currentStep.icon}
          </div>
        ) : null}
      </div>
      
      <h2 className="text-xl font-bold mb-2">{currentStep?.title}</h2>
      <p className="text-muted-foreground mb-8">{currentStep?.description}</p>
      
      <div className="flex justify-center gap-2 mb-8">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              i === currentIndex ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>
      
      <Button className="w-full" onClick={isLast ? onComplete : () => setCurrentIndex(currentIndex + 1)}>
        {isLast ? 'Começar' : 'Próximo'}
      </Button>
      
      {!isLast && (
        <button 
          onClick={onComplete}
          className="text-sm text-muted-foreground mt-4 hover:text-foreground"
        >
          Pular introdução
        </button>
      )}
    </div>
  );
};
