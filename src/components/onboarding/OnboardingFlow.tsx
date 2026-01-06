import { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { OnboardingWizard } from './OnboardingWizard';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Target, 
  Trophy, 
  Rocket,
  Users,
  TrendingUp,
  Zap
} from 'lucide-react';

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Sales Arena! 🚀',
    description: 'Sua plataforma gamificada para dominar as vendas. Vamos fazer um tour rápido?',
    content: (
      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: TrendingUp, label: 'Acompanhe métricas', color: 'text-blue-500 bg-blue-500/10' },
            { icon: Trophy, label: 'Ganhe conquistas', color: 'text-yellow-500 bg-yellow-500/10' },
            { icon: Target, label: 'Bata suas metas', color: 'text-green-500 bg-green-500/10' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-colors">
              <div className={`p-3 rounded-lg ${item.color}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <span className="text-xs text-center font-medium text-muted-foreground">{item.label}</span>
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
        <div className="w-full max-w-md p-4 rounded-xl border bg-card shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-primary/10 text-center border border-primary/20">
              <span className="text-2xl font-bold text-primary">R$ 45K</span>
              <p className="text-xs text-muted-foreground">Faturamento</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 text-center border border-green-500/20">
              <span className="text-2xl font-bold text-green-500">28</span>
              <p className="text-xs text-muted-foreground">Vendas</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 text-center border border-blue-500/20">
              <span className="text-2xl font-bold text-blue-500">85%</span>
              <p className="text-xs text-muted-foreground">Meta</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10 text-center border border-yellow-500/20">
              <span className="text-2xl font-bold text-yellow-500">12</span>
              <p className="text-xs text-muted-foreground">Novos Clientes</p>
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
        <div className="flex items-center gap-6 p-4 rounded-xl bg-muted/30 border">
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-2xl font-bold text-primary-foreground">5</span>
            </div>
            <span className="text-sm font-semibold">Nível</span>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-yellow-500/10">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">15 Conquistas</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-500/10">
              <Zap className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">3.450 XP Total</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-green-500/10">
              <Users className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">#3 no Ranking</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'ready',
    title: 'Pronto para Começar! 🎯',
    description: 'Você está preparado para dominar suas vendas. Boa sorte na arena!',
    content: (
      <div className="flex justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium">Sistema pronto</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Use a barra lateral para navegar entre as seções. Boas vendas! 💪
          </p>
        </div>
      </div>
    ),
  },
];

export const OnboardingFlow: FC = () => {
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();
  const { user } = useAuth();
  const location = useLocation();

  // Don't show on auth pages or if not logged in
  const isAuthPage = location.pathname === '/auth' || location.pathname === '/reset-password';
  
  if (!user || isAuthPage || !showOnboarding) return null;

  return (
    <OnboardingWizard
      steps={onboardingSteps}
      onComplete={completeOnboarding}
      onSkip={skipOnboarding}
    />
  );
};
