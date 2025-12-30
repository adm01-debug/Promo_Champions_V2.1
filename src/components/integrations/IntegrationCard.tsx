import { FC } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Check, ExternalLink, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  isConnected?: boolean;
  isPremium?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onConfigure?: () => void;
}

export const IntegrationCard: FC<IntegrationCardProps> = ({
  name,
  description,
  icon: Icon,
  iconColor = "text-primary",
  isConnected = false,
  isPremium = false,
  onConnect,
  onDisconnect,
  onConfigure
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "relative p-4 rounded-lg border bg-card transition-shadow hover:shadow-md",
        isConnected && "border-primary/50"
      )}
    >
      {isPremium && (
        <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500">
          Premium
        </Badge>
      )}

      <div className="flex items-start gap-4">
        <div className={cn(
          "p-3 rounded-lg bg-muted",
          isConnected && "bg-primary/10"
        )}>
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{name}</h3>
            {isConnected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 text-xs text-green-600"
              >
                <Check className="h-3 w-3" />
                Conectado
              </motion.div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {isConnected ? (
          <>
            {onConfigure && (
              <Button variant="outline" size="sm" onClick={onConfigure} className="gap-1">
                <Settings className="h-3.5 w-3.5" />
                Configurar
              </Button>
            )}
            {onDisconnect && (
              <Button variant="ghost" size="sm" onClick={onDisconnect}>
                Desconectar
              </Button>
            )}
          </>
        ) : (
          <Button
            size="sm"
            onClick={onConnect}
            disabled={isPremium}
            className="gap-1"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Conectar
          </Button>
        )}
      </div>
    </motion.div>
  );
};

// Grid de integrações
interface IntegrationGridProps {
  children: React.ReactNode;
  className?: string;
}

export const IntegrationGrid: FC<IntegrationGridProps> = ({ children, className }) => (
  <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
    {children}
  </div>
);
