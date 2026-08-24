import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ExportDossierButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export function ExportDossierButton({ onClick, isLoading }: ExportDossierButtonProps) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
      <Button 
        onClick={onClick}
        disabled={isLoading}
        className="bg-violet-600 hover:bg-violet-700 text-white gap-2 rounded-xl font-bold uppercase tracking-widest text-xs"
      >
        <FileDown className="size-4" />
        {isLoading ? "Gerando..." : "Exportar Dossiê PDF"}
      </Button>
    </motion.div>
  );
}
