import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FileQuestion,
  Users,
  ShoppingCart,
  Target,
  BarChart3,
  Bell,
  MessageSquare,
  Inbox,
  Search,
  Calendar,
  LucideIcon,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";

type EmptyStateType = 
  | "default"
  | "no-data"
  | "no-results"
  | "no-sales"
  | "no-clients"
  | "no-goals"
  | "no-notifications"
  | "no-messages"
  | "no-activities"
  | "no-reports"
  | "search-empty"
  | "first-time";

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: ReactNode;
  compact?: boolean;
}

const emptyStateConfigs: Record<EmptyStateType, {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
}> = {
  default: {
    icon: Inbox,
    title: "Nada por aqui ainda",
    description: "Comece adicionando novos itens para visualizar os dados.",
    gradient: "from-muted/50 to-muted/30",
    iconColor: "text-muted-foreground",
  },
  "no-data": {
    icon: FileQuestion,
    title: "Sem dados disponíveis",
    description: "Ainda não há dados para exibir nesta seção.",
    gradient: "from-blue-500/10 to-blue-500/5",
    iconColor: "text-blue-500",
  },
  "no-results": {
    icon: Search,
    title: "Nenhum resultado encontrado",
    description: "Tente ajustar seus filtros ou termos de busca.",
    gradient: "from-amber-500/10 to-amber-500/5",
    iconColor: "text-amber-500",
  },
  "no-sales": {
    icon: ShoppingCart,
    title: "Nenhuma venda registrada",
    description: "Comece registrando sua primeira venda para acompanhar seu desempenho.",
    gradient: "from-primary/10 to-primary/5",
    iconColor: "text-primary",
  },
  "no-clients": {
    icon: Users,
    title: "Nenhum cliente cadastrado",
    description: "Adicione seus primeiros clientes para começar a gerenciar seu portfólio.",
    gradient: "from-violet-500/10 to-violet-500/5",
    iconColor: "text-violet-500",
  },
  "no-goals": {
    icon: Target,
    title: "Nenhuma meta configurada",
    description: "Defina metas para acompanhar seu progresso e motivar sua equipe.",
    gradient: "from-emerald-500/10 to-emerald-500/5",
    iconColor: "text-emerald-500",
  },
  "no-notifications": {
    icon: Bell,
    title: "Tudo em dia!",
    description: "Você não tem notificações pendentes no momento.",
    gradient: "from-sky-500/10 to-sky-500/5",
    iconColor: "text-sky-500",
  },
  "no-messages": {
    icon: MessageSquare,
    title: "Nenhuma mensagem",
    description: "Suas conversas aparecerão aqui quando você iniciar uma.",
    gradient: "from-pink-500/10 to-pink-500/5",
    iconColor: "text-pink-500",
  },
  "no-activities": {
    icon: Calendar,
    title: "Sem atividades",
    description: "Registre suas atividades diárias para acompanhar seu progresso.",
    gradient: "from-orange-500/10 to-orange-500/5",
    iconColor: "text-orange-500",
  },
  "no-reports": {
    icon: BarChart3,
    title: "Nenhum relatório disponível",
    description: "Relatórios serão gerados conforme você acumula dados.",
    gradient: "from-indigo-500/10 to-indigo-500/5",
    iconColor: "text-indigo-500",
  },
  "search-empty": {
    icon: Search,
    title: "Nenhum resultado para sua busca",
    description: "Tente outros termos ou limpe os filtros para ver todos os itens.",
    gradient: "from-slate-500/10 to-slate-500/5",
    iconColor: "text-slate-500",
  },
  "first-time": {
    icon: Sparkles,
    title: "Bem-vindo ao Sales Arena!",
    description: "Vamos configurar seu ambiente para você começar a vender.",
    gradient: "from-primary/15 to-accent/10",
    iconColor: "text-primary",
  },
};

export function EmptyState({
  type = "default",
  title,
  description,
  icon: CustomIcon,
  action,
  secondaryAction,
  className,
  children,
  compact = false,
}: EmptyStateProps) {
  const config = emptyStateConfigs[type];
  const Icon = CustomIcon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-8 px-4" : "py-12 px-6",
        className
      )}
    >
      {/* Animated Icon Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4, type: "spring", stiffness: 200 }}
        className={cn(
          "relative rounded-full flex items-center justify-center mb-4",
          compact ? "h-16 w-16" : "h-24 w-24",
          `bg-gradient-to-br ${config.gradient}`
        )}
      >
        {/* Pulse ring animation */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full",
            `bg-gradient-to-br ${config.gradient}`
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <Icon className={cn(
          config.iconColor,
          compact ? "h-8 w-8" : "h-12 w-12"
        )} />
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className={cn(
          "font-semibold text-foreground",
          compact ? "text-base mb-1" : "text-lg mb-2"
        )}
      >
        {displayTitle}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
        className={cn(
          "text-muted-foreground max-w-sm",
          compact ? "text-sm mb-4" : "text-sm mb-6"
        )}
      >
        {displayDescription}
      </motion.p>

      {/* Actions */}
      {(action || secondaryAction || children) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
              size={compact ? "sm" : "default"}
              className="gap-2 group"
            >
              <Plus className="h-4 w-4" />
              {action.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="ghost"
              size={compact ? "sm" : "default"}
              className="text-muted-foreground"
            >
              {secondaryAction.label}
            </Button>
          )}
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}

// Convenience exports for common empty states
export function NoDataEmptyState(props: Omit<EmptyStateProps, "type">) {
  return <EmptyState type="no-data" {...props} />;
}

export function NoResultsEmptyState(props: Omit<EmptyStateProps, "type">) {
  return <EmptyState type="no-results" {...props} />;
}

export function NoSalesEmptyState(props: Omit<EmptyStateProps, "type">) {
  return <EmptyState type="no-sales" {...props} />;
}

export function NoClientsEmptyState(props: Omit<EmptyStateProps, "type">) {
  return <EmptyState type="no-clients" {...props} />;
}

export function NoGoalsEmptyState(props: Omit<EmptyStateProps, "type">) {
  return <EmptyState type="no-goals" {...props} />;
}

export function NoNotificationsEmptyState(props: Omit<EmptyStateProps, "type">) {
  return <EmptyState type="no-notifications" {...props} />;
}

export function SearchEmptyState(props: Omit<EmptyStateProps, "type">) {
  return <EmptyState type="search-empty" {...props} />;
}

export function FirstTimeEmptyState(props: Omit<EmptyStateProps, "type">) {
  return <EmptyState type="first-time" {...props} />;
}
