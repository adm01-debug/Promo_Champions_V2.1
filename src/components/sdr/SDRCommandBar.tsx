
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Phone, 
  Mail, 
  Linkedin, 
  MessageSquare, 
  Sparkles,
  Zap,
  LayoutGrid
} from "lucide-react";
import { motion } from "framer-motion";

export const SDRCommandBar = () => {
  return (
    <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl glass border-primary/20 bg-primary/5 shadow-lg mb-6">
      <div className="flex items-center gap-2 pr-4 border-r border-primary/10">
        <LayoutGrid className="h-4 w-4 text-primary" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Ações Rápidas</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 flex-1">
        <Button size="sm" className="h-8 gap-2 bg-primary hover:bg-primary/90 text-[10px] font-bold uppercase tracking-wider">
          <Plus className="h-3.5 w-3.5" />
          Novo Lead
        </Button>
        
        <div className="h-6 w-px bg-primary/10 mx-1 hidden sm:block" />
        
        <Button variant="outline" size="sm" className="h-8 gap-2 border-primary/20 hover:bg-primary/5 text-[10px] font-bold uppercase tracking-wider">
          <Phone className="h-3.5 w-3.5 text-green-500" />
          Log Call
        </Button>
        
        <Button variant="outline" size="sm" className="h-8 gap-2 border-primary/20 hover:bg-primary/5 text-[10px] font-bold uppercase tracking-wider">
          <Mail className="h-3.5 w-3.5 text-blue-500" />
          Log Email
        </Button>
        
        <Button variant="outline" size="sm" className="h-8 gap-2 border-primary/20 hover:bg-primary/5 text-[10px] font-bold uppercase tracking-wider">
          <Linkedin className="h-3.5 w-3.5 text-[#0077b5]" />
          Log Social
        </Button>
      </div>

      <div className="flex items-center gap-2 pl-4 border-l border-primary/10 ml-auto">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Button variant="ghost" size="sm" className="h-8 gap-2 text-primary hover:bg-primary/10 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            SDR Copilot
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
