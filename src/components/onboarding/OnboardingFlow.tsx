import { FC } from 'react';
import { OnboardingWizard } from './OnboardingWizard';
import { useOnboarding } from '@/hooks/useOnboarding';
import { 
  LayoutDashboard, 
  Target, 
  Trophy, 
  Rocket,
  Users,
  TrendingUp
} from 'lucide-react';

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao SalesPro! 🚀',
    description: 'Sua plataforma gamificada para dominar as vendas. Vamos fazer um tour rápido?',
    content: (
      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: TrendingUp, label: 'Acompanhe métricas', color: 'text-blue-500' },
            { icon: Trophy, label: 'Ganhe conquistas', color: 'text-yellow-500' },
            { icon: Target, label: 'Bata suas metas', color: 'text-green-500' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
              <item.icon className={`h-8 w-8 ${item.color}`} />
              <span className="text-xs text-center text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'dashboard',
    title: 'Seu Dashboard Personalizado',
    description: 'Visualize KPIs, metas e performance em tempo real. Tudo o que você precisa em um só lugar.',
    content: (
      <div className="flex justify-center">
        <div className="w-full max-w-md p-4 rounded-lg border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded bg-primary/10 text-center">
              <span className="text-2xl font-bold text-primary">R$ 45K</span>
              <p className="text-xs text-muted-foreground">Faturamento</p>
            </div>
            <div className="p-3 rounded bg-green-500/10 text-center">
              <span className="text-2xl font-bold text-green-500">28</span>
              <p className="text-xs text-muted-foreground">Vendas</p>
            </div>
            <div className="p-3 rounded bg-blue-500/10 text-center">
              <span className="text-2xl font-bold text-blue-500">85%</span>
              <p className="text-xs text-muted-foreground">Meta</p>
            </div>
            <div className="p-3 rounded bg-yellow-500/10 text-center">
              <span className="text-2xl font-bold text-yellow-500">12</span>
              <p className="text-xs text-muted-foreground">Clientes</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'gamification',
    title: 'Gamificação que Motiva',
    description: 'Ganhe XP, suba de nível e desbloqueie conquistas conforme bate suas metas!',
    content: (
      <div className="flex justify-center">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">5</span>
            </div>
            <span className="text-sm font-medium">Nível</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-sm">15 Conquistas</span>
            </div>
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-blue-500" />
              <span className="text-sm">3.450 XP Total</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <span className="text-sm">#3 no Ranking</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'ready',
    title: 'Pronto para Começar! 🎯',
    description: 'Você está preparado para dominar suas vendas. Boa sorte!',
    content: (
      <div className="flex justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-500">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium">Sistema pronto</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Use a barra lateral para navegar entre as seções
          </p>
        </div>
      </div>
    ),
  },
];

export const OnboardingFlow: FC = () => {
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

  if (!showOnboarding) return null;

  return (
    <OnboardingWizard
      steps={onboardingSteps}
      onComplete={completeOnboarding}
      onSkip={skipOnboarding}
    />
  );
};
