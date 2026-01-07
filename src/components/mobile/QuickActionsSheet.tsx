import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/useMediaQuery";
import {
  Plus,
  ShoppingCart,
  Users,
  Phone,
  Calendar,
  FileText,
  Target,
  MessageSquare,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface QuickAction {
  id: string;
  label: string;
  icon: typeof Plus;
  color: string;
  bgColor: string;
  action: () => void;
}

interface QuickActionsSheetProps {
  onNewSale?: () => void;
  onNewClient?: () => void;
  onNewActivity?: () => void;
  onNewTask?: () => void;
}

export function QuickActionsSheet({
  onNewSale,
  onNewClient,
  onNewActivity,
  onNewTask,
}: QuickActionsSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const quickActions: QuickAction[] = [
    {
      id: "new-sale",
      label: "Nova Venda",
      icon: ShoppingCart,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      action: () => {
        onNewSale?.();
        navigate("/vendas?new=true");
        setIsOpen(false);
      },
    },
    {
      id: "new-client",
      label: "Novo Cliente",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      action: () => {
        onNewClient?.();
        navigate("/clientes?new=true");
        setIsOpen(false);
      },
    },
    {
      id: "new-call",
      label: "Registrar Ligação",
      icon: Phone,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
      action: () => {
        onNewActivity?.();
        navigate("/atividades?type=call");
        setIsOpen(false);
      },
    },
    {
      id: "new-meeting",
      label: "Agendar Reunião",
      icon: Calendar,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      action: () => {
        navigate("/tarefas?new=meeting");
        setIsOpen(false);
      },
    },
    {
      id: "new-task",
      label: "Nova Tarefa",
      icon: FileText,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      action: () => {
        onNewTask?.();
        navigate("/tarefas?new=true");
        setIsOpen(false);
      },
    },
    {
      id: "new-goal",
      label: "Definir Meta",
      icon: Target,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      action: () => {
        navigate("/metas?new=true");
        setIsOpen(false);
      },
    },
  ];

  if (!isMobile) return null;

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          size="icon"
          className={cn(
            "fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full shadow-lg",
            "bg-gradient-to-br from-primary to-primary/80",
            "hover:shadow-xl hover:scale-105 transition-all",
            "active:scale-95"
          )}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="h-6 w-6 text-primary-foreground" />
          </motion.div>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="pb-safe">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Ações Rápidas
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-6">
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={action.action}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl",
                  "transition-all duration-200",
                  "hover:scale-105 active:scale-95",
                  action.bgColor,
                  "border border-transparent hover:border-border/50"
                )}
              >
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center",
                  action.bgColor
                )}>
                  <action.icon className={cn("h-6 w-6", action.color)} />
                </div>
                <span className="text-xs font-medium text-foreground text-center">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Close handle hint */}
        <div className="flex justify-center pb-4">
          <div className="h-1 w-12 rounded-full bg-muted" />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// Floating Action Button variant
export function FloatingQuickAction() {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const miniActions = [
    { icon: ShoppingCart, color: "bg-emerald-500", path: "/vendas?new=true" },
    { icon: Users, color: "bg-blue-500", path: "/clientes?new=true" },
    { icon: Phone, color: "bg-violet-500", path: "/atividades?type=call" },
  ];

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 flex flex-col gap-3"
          >
            {miniActions.map((action, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  navigate(action.path);
                  setExpanded(false);
                }}
                className={cn(
                  "h-12 w-12 rounded-full shadow-lg flex items-center justify-center",
                  action.color,
                  "hover:scale-110 active:scale-95 transition-transform"
                )}
              >
                <action.icon className="h-5 w-5 text-white" />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg",
          "bg-gradient-to-br from-primary to-primary/80",
          "hover:shadow-xl transition-all"
        )}
      >
        <motion.div
          animate={{ rotate: expanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {expanded ? (
            <X className="h-6 w-6 text-primary-foreground" />
          ) : (
            <Plus className="h-6 w-6 text-primary-foreground" />
          )}
        </motion.div>
      </Button>
    </div>
  );
}
