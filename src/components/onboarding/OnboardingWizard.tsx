import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  Target, 
  Users, 
  Trophy, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  tips: string[];
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao SalesPro! 🚀',
    subtitle: 'Seu CRM Gamificado',
    description: 'Transforme suas vendas em uma experiência envolvente. Ganhe XP, complete desafios e suba no ranking!',
    icon: Rocket,
    color: 'from-primary to-primary-glow',
    tips: [
      'Acompanhe seu progresso em tempo real',
      'Ganhe XP a cada atividade concluída',
      'Compete com sua equipe no ranking'
    ]
  },
  {
    id: 'goals',
    title: 'Defina suas Metas',
    subtitle: 'Foco no resultado',
    description: 'Configure suas metas mensais e acompanhe seu progresso diariamente.',
    icon: Target,
    color: 'from-warning to-orange-400',
    tips: [
      'Metas claras aumentam sua produtividade',
      'Receba alertas quando estiver perto de bater a meta',
      'Visualize seu progresso no dashboard'
    ]
  },
  {
    id: 'clients',
    title: 'Gerencie seus Clientes',
    subtitle: 'Relacionamentos que vendem',
    description: 'Organize sua carteira de clientes e nunca perca uma oportunidade.',
    icon: Users,
    color: 'from-secondary to-teal-400',
    tips: [
      'Importe seus clientes facilmente',
      'Acompanhe o histórico de interações',
      'Receba lembretes de follow-up'
    ]
  },
  {
    id: 'gamification',
    title: 'Conquiste Recompensas',
    subtitle: 'Vender nunca foi tão divertido',
    description: 'Complete desafios diários e semanais para ganhar XP e subir de nível!',
    icon: Trophy,
    color: 'from-rank-gold to-yellow-400',
    tips: [
      'Desafios diários renovam a cada dia',
      'Mantenha sua sequência para bônus extras',
      'Desbloqueie conquistas exclusivas'
    ]
  }
];

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip?: () => void;
  className?: string;
}

export const OnboardingWizard: FC<OnboardingWizardProps> = ({
  onComplete,
  onSkip,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    setCompletedSteps(prev => [...prev, step.id]);
    
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

  const StepIcon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
      >
        {/* Progress bar */}
        <div className="p-4 bg-muted/30">
          <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
            <span>Passo {currentStep + 1} de {steps.length}</span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 py-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.id}
              initial={false}
              animate={{
                scale: i === currentStep ? 1.2 : 1,
                opacity: i <= currentStep ? 1 : 0.4
              }}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-colors",
                i < currentStep ? "bg-success" : 
                i === currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="px-8 pb-8"
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center",
                  "bg-gradient-to-br shadow-lg",
                  step.color
                )}
              >
                <StepIcon className="w-10 h-10 text-white" />
              </motion.div>
            </div>

            {/* Text */}
            <div className="text-center mb-6">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xs font-semibold text-primary uppercase tracking-wider mb-2"
              >
                {step.subtitle}
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-2xl font-bold mb-3"
              >
                {step.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground"
              >
                {step.description}
              </motion.p>
            </div>

            {/* Tips */}
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-3 mb-8"
            >
              {step.tips.map((tip, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.1 }}
                  className="flex items-start gap-3 text-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{tip}</span>
                </motion.li>
              ))}
            </motion.ul>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                className={cn(
                  "flex-1 bg-gradient-to-r gap-2",
                  step.color,
                  "text-white hover:opacity-90"
                )}
              >
                {isLastStep ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Começar!
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Skip */}
            {onSkip && (
              <button
                onClick={onSkip}
                className="w-full mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Pular introdução
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
