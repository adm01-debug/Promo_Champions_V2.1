import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Trophy, 
  Target, 
  Zap, 
  BarChart3, 
  Users,
  Rocket,
  ChevronRight,
  PartyPopper
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Feature {
  icon: typeof Sparkles;
  title: string;
  description: string;
  tag?: string;
  tagColor?: string;
}

interface WhatsNewModalProps {
  version?: string;
  features: Feature[];
  onClose: () => void;
}

const WHATS_NEW_VERSION_KEY = 'sales_arena_whats_new_version';

export const useWhatsNew = (currentVersion: string) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem(WHATS_NEW_VERSION_KEY);
    if (lastSeenVersion !== currentVersion) {
      // Small delay for better UX
      const timer = setTimeout(() => setShowModal(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentVersion]);

  const dismissModal = () => {
    localStorage.setItem(WHATS_NEW_VERSION_KEY, currentVersion);
    setShowModal(false);
  };

  return { showModal, dismissModal };
};

export const WhatsNewModal: FC<WhatsNewModalProps> = ({
  version = '2.0',
  features,
  onClose
}) => {
  const [currentFeature, setCurrentFeature] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="relative h-32 bg-gradient-to-br from-primary via-primary/80 to-primary/60 overflow-hidden">
          {/* Animated particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              initial={{
                x: Math.random() * 100 + '%',
                y: Math.random() * 100 + '%'
              }}
              animate={{
                y: [null, '-100%'],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-center"
            >
              <PartyPopper className="w-12 h-12 text-white mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-white">Novidades v{version}</h2>
              <p className="text-white/80 text-sm">Veja o que há de novo!</p>
            </motion.div>
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Features list */}
        <div className="p-6 max-h-[400px] overflow-y-auto">
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-xl transition-colors',
                  'hover:bg-muted/50 cursor-pointer',
                  currentFeature === index && 'bg-muted/50 ring-1 ring-primary/20'
                )}
                onClick={() => setCurrentFeature(index)}
              >
                <div className={cn(
                  'p-2.5 rounded-xl shrink-0',
                  feature.tagColor || 'bg-primary/10'
                )}>
                  <feature.icon className={cn(
                    'w-5 h-5',
                    feature.tagColor ? 'text-white' : 'text-primary'
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    {feature.tag && (
                      <span className={cn(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase',
                        feature.tagColor || 'bg-primary/10 text-primary'
                      )}>
                        {feature.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>

                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/30">
          <Button 
            className="w-full gap-2" 
            size="lg"
            onClick={onClose}
          >
            <Rocket className="w-4 h-4" />
            Começar a usar!
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Pre-configured What's New for current version
export const CurrentWhatsNew: FC<{ onClose: () => void }> = ({ onClose }) => {
  const features: Feature[] = [
    {
      icon: BarChart3,
      title: 'Dashboard Interativo',
      description: 'Clique nos KPIs para ver detalhes e análises aprofundadas.',
      tag: 'Novo',
      tagColor: 'bg-emerald-500'
    },
    {
      icon: Trophy,
      title: 'XP Épico',
      description: 'Animações mais impactantes ao ganhar XP e subir de nível.',
      tag: 'Melhorado',
      tagColor: 'bg-amber-500'
    },
    {
      icon: Zap,
      title: 'Streak de Fogo',
      description: 'Mantenha sua sequência de vendas e ganhe bônus especiais.',
      tag: 'Novo',
      tagColor: 'bg-orange-500'
    },
    {
      icon: Target,
      title: 'Metas Visuais',
      description: 'Acompanhe seu progresso com visualizações mais claras.',
    },
    {
      icon: Users,
      title: 'Gestão de Equipe',
      description: 'Drill-down completo na performance de cada membro.',
    }
  ];

  return <WhatsNewModal version="2.0" features={features} onClose={onClose} />;
};
