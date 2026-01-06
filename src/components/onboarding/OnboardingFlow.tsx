import { FC, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { OnboardingWizard } from './OnboardingWizard';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  Target, 
  Trophy, 
  Rocket,
  Users,
  TrendingUp,
  Zap,
  BarChart3,
  Flame,
  Calendar,
  MessageSquare,
  Bell,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Animated feature card component
const FeatureCard: FC<{
  icon: typeof TrendingUp;
  label: string;
  color: string;
  delay?: number;
}> = ({ icon: Icon, label, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={cn(
      'flex flex-col items-center gap-2 p-4 rounded-xl',
      'bg-muted/50 border border-border/50',
      'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
      'transition-all duration-300 cursor-default'
    )}
  >
    <motion.div 
      className={cn('p-3 rounded-lg', color)}
      whileHover={{ scale: 1.1, rotate: 5 }}
    >
      <Icon className="h-6 w-6" />
    </motion.div>
    <span className="text-xs text-center font-medium text-muted-foreground">
      {label}
    </span>
  </motion.div>
);

// Level progress visualization
const LevelPreview: FC = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex items-center gap-6 p-5 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border"
  >
    <motion.div 
      className="relative"
      animate={{ rotate: [0, 5, -5, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-xl shadow-primary/30">
        <span className="text-3xl font-black text-primary-foreground">5</span>
      </div>
      <motion.div
        className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        <Crown className="h-4 w-4 text-yellow-900" />
      </motion.div>
    </motion.div>
    
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <span className="text-sm font-medium">15 Conquistas</span>
      </div>
      <div className="flex items-center gap-3 p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <Zap className="h-5 w-5 text-blue-500" />
        <span className="text-sm font-medium">3.450 XP Total</span>
      </div>
      <div className="flex items-center gap-3 p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
        <Flame className="h-5 w-5 text-orange-500" />
        <span className="text-sm font-medium">7 dias de streak</span>
      </div>
    </div>
  </motion.div>
);

// Dashboard preview
const DashboardPreview: FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="w-full max-w-md p-4 rounded-xl border bg-card shadow-lg"
  >
    <div className="grid grid-cols-2 gap-3">
      {[
        { value: 'R$ 45K', label: 'Faturamento', color: 'bg-primary/10 border-primary/20 text-primary' },
        { value: '28', label: 'Vendas', color: 'bg-green-500/10 border-green-500/20 text-green-500' },
        { value: '85%', label: 'Meta', color: 'bg-blue-500/10 border-blue-500/20 text-blue-500' },
        { value: '12', label: 'Novos Clientes', color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className={cn('p-3 rounded-lg text-center border cursor-pointer transition-shadow hover:shadow-md', item.color)}
        >
          <span className="text-2xl font-bold">{item.value}</span>
          <p className="text-xs text-muted-foreground">{item.label}</p>
        </motion.div>
      ))}
    </div>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="text-xs text-center text-muted-foreground mt-3"
    >
      💡 Clique nos cards para ver detalhes
    </motion.p>
  </motion.div>
);

// Features grid
const FeaturesGrid: FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="grid grid-cols-3 sm:grid-cols-4 gap-3"
  >
    {[
      { icon: BarChart3, label: 'Pipeline', color: 'text-blue-500 bg-blue-500/10' },
      { icon: Calendar, label: 'Atividades', color: 'text-purple-500 bg-purple-500/10' },
      { icon: Users, label: 'Clientes', color: 'text-green-500 bg-green-500/10' },
      { icon: MessageSquare, label: 'IA Coach', color: 'text-pink-500 bg-pink-500/10' },
      { icon: Trophy, label: 'Conquistas', color: 'text-yellow-500 bg-yellow-500/10' },
      { icon: Target, label: 'Metas', color: 'text-red-500 bg-red-500/10' },
      { icon: Bell, label: 'Alertas', color: 'text-orange-500 bg-orange-500/10' },
      { icon: TrendingUp, label: 'Relatórios', color: 'text-teal-500 bg-teal-500/10' },
    ].map((item, i) => (
      <FeatureCard key={i} {...item} delay={i * 0.05} />
    ))}
  </motion.div>
);

// Ready animation
const ReadyAnimation: FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center space-y-5"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20"
    >
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
      </span>
      <span className="font-medium">Sistema pronto</span>
    </motion.div>
    
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-2"
    >
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        Use a <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">barra lateral</kbd> para navegar
      </p>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        Pressione <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">Ctrl+K</kbd> para busca rápida
      </p>
    </motion.div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="pt-4"
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Rocket className="h-12 w-12 mx-auto text-primary" />
      </motion.div>
      <p className="text-lg font-semibold mt-2">Boas vendas! 💪</p>
    </motion.div>
  </motion.div>
);

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Sales Arena! 🚀',
    description: 'Sua plataforma gamificada para dominar as vendas. Vamos fazer um tour rápido?',
    content: (
      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-4">
          <FeatureCard icon={TrendingUp} label="Acompanhe métricas" color="text-blue-500 bg-blue-500/10" delay={0.1} />
          <FeatureCard icon={Trophy} label="Ganhe conquistas" color="text-yellow-500 bg-yellow-500/10" delay={0.2} />
          <FeatureCard icon={Target} label="Bata suas metas" color="text-green-500 bg-green-500/10" delay={0.3} />
        </div>
      </div>
    ),
  },
  {
    id: 'dashboard',
    title: 'Seu Dashboard Personalizado',
    description: 'Visualize KPIs, metas e performance em tempo real. Clique nos cards para explorar detalhes.',
    content: (
      <div className="flex justify-center">
        <DashboardPreview />
      </div>
    ),
  },
  {
    id: 'gamification',
    title: 'Gamificação que Motiva 🎮',
    description: 'Ganhe XP, suba de nível e desbloqueie conquistas conforme bate suas metas!',
    content: (
      <div className="flex justify-center">
        <LevelPreview />
      </div>
    ),
  },
  {
    id: 'features',
    title: 'Recursos Poderosos',
    description: 'Explore todas as ferramentas disponíveis para maximizar suas vendas.',
    content: <FeaturesGrid />,
  },
  {
    id: 'ready',
    title: 'Pronto para Começar! 🎯',
    description: 'Você está preparado para dominar suas vendas. Boa sorte na arena!',
    content: <ReadyAnimation />,
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
