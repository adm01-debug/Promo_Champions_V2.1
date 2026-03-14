import { useState, forwardRef } from "react";
import { Plus, ShoppingCart, Users, Kanban, Activity, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useMediaQuery";

const actions = [
  { icon: ShoppingCart, label: "Nova Venda", route: "/vendas", color: "bg-primary text-primary-foreground" },
  { icon: Kanban, label: "Novo Deal", route: "/pipeline", color: "bg-accent text-accent-foreground" },
  { icon: Users, label: "Novo Cliente", route: "/clientes", color: "bg-status-info text-primary-foreground" },
  { icon: Activity, label: "Atividade", route: "/atividades", color: "bg-status-warning text-primary-foreground" },
];

export function FABQuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleAction = (route: string) => {
    setIsOpen(false);
    navigate(route);
  };

  return (
    <div className={cn(
      "fixed z-40",
      isMobile ? "bottom-[5.5rem] right-4" : "bottom-6 right-6"
    )}>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-30"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Actions */}
          <div className="absolute bottom-16 right-0 z-40 flex flex-col-reverse gap-3 items-end">
            {actions.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                onClick={() => handleAction(action.route)}
                className="flex items-center gap-3 group"
              >
                <span className="bg-card border border-border/50 shadow-lg rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap opacity-90 group-hover:opacity-100 transition-opacity">
                  {action.label}
                </span>
                <div className={cn(
                  "h-11 w-11 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110",
                  action.color
                )}>
                  <action.icon className="h-5 w-5" />
                </div>
              </motion.button>
            ))}
          </div>
        </>
      )}

      {/* Main FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative z-40 h-14 w-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-200",
          "bg-primary text-primary-foreground hover:shadow-2xl hover:shadow-primary/30",
          isOpen && "rotate-45"
        )}
        whileTap={{ scale: 0.9 }}
        style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </motion.button>
    </div>
  );
}
