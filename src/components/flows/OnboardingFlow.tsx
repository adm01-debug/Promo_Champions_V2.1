import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Target, Users, Zap, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  icon: typeof Rocket;
  title: string;
  description: string;
  color: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    icon: Rocket,
    title: "Bem-vindo ao Sales Arena!",
    description: "Sua plataforma completa para gestão de vendas e performance.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Target,
    title: "Defina suas Metas",
    description: "Configure metas de vendas e acompanhe seu progresso em tempo real.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Users,
    title: "Gerencie Clientes",
    description: "Organize sua carteira de clientes e nunca perca uma oportunidade.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Zap,
    title: "Tudo Pronto!",
    description: "Você está pronto para começar. Vamos lá!",
    color: "from-orange-500 to-red-500"
  }
];

interface OnboardingFlowProps {
  onComplete: (data: { name: string; goal: string }) => void;
  className?: string;
}

export const OnboardingFlow: FC<OnboardingFlowProps> = ({ onComplete, className }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');

  const currentStep = onboardingSteps[step];
  const isLastStep = step === onboardingSteps.length - 1;
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (isLastStep) {
      onComplete({ name, goal });
    } else {
      setStep(prev => prev + 1);
    }
  };

  const canProceed = step === 0 || (step === 1 && name.trim()) || step >= 2;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm",
      className
    )}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg p-8"
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {onboardingSteps.map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === step ? "w-8 bg-primary" : "w-2 bg-muted"
              )}
              animate={i === step ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-6"
          >
            {/* Icon */}
            <motion.div
              className={cn(
                "mx-auto w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br",
                currentStep.color
              )}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Icon className="h-12 w-12 text-white" />
            </motion.div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{currentStep.title}</h2>
              <p className="text-muted-foreground">{currentStep.description}</p>
            </div>

            {/* Step 1: Name input */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3 max-w-xs mx-auto"
              >
                <Label htmlFor="name">Como podemos te chamar?</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="text-center"
                />
              </motion.div>
            )}

            {/* Step 2: Goal input */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3 max-w-xs mx-auto"
              >
                <Label htmlFor="goal">Qual sua meta mensal? (R$)</Label>
                <Input
                  id="goal"
                  type="number"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Ex: 50000"
                  className="text-center"
                />
              </motion.div>
            )}

            {/* Action button */}
            <Button
              size="lg"
              onClick={handleNext}
              disabled={!canProceed}
              className="gap-2 min-w-[200px]"
            >
              {isLastStep ? (
                <>
                  <Check className="h-5 w-5" />
                  Começar!
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
