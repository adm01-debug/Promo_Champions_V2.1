import { Search, Filter, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SDRAdvancedFiltersProps {
  onSearch: (value: string) => void;
  onFilterChange: (filters: any) => void;
}

export function SDRAdvancedFilters({ onSearch, onFilterChange }: SDRAdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    channel: "all",
    status: "all",
    temp: "all",
    sdr: "all"
  });

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  const clearFilters = () => {
    const defaultFilters = {
      channel: "all",
      status: "all",
      temp: "all",
      sdr: "all"
    };
    setFilters(defaultFilters);
    setSearchTerm("");
    onSearch("");
    onFilterChange(defaultFilters);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por lead, empresa ou SDR..." 
            className="pl-10 h-10 glass focus:ring-primary/30"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button 
              onClick={() => { setSearchTerm(""); onSearch(""); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className={`h-10 gap-2 border-primary/20 hover:bg-primary/5 ${isExpanded ? 'bg-primary/10 border-primary/40' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros Avançados
          </Button>
          
          <Select value={filters.channel} onValueChange={(val) => updateFilter("channel", val)}>
            <SelectTrigger className="w-[140px] h-10 glass">
              <SelectValue placeholder="Canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Canais</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="phone">Telefone</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl border border-primary/10 bg-primary/5 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1">
                  Status de Qualificação
                </label>
                <Select value={filters.status} onValueChange={(val) => updateFilter("status", val)}>
                  <SelectTrigger className="h-9 bg-background/50 border-primary/10">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="lead">Lead Novo</SelectItem>
                    <SelectItem value="qualified">Qualificado (MQL)</SelectItem>
                    <SelectItem value="unqualified">Desqualificado</SelectItem>
                    <SelectItem value="converted">Convertido (SQL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1">
                  Temperatura
                </label>
                <Select value={filters.temp} onValueChange={(val) => updateFilter("temp", val)}>
                  <SelectTrigger className="h-9 bg-background/50 border-primary/10">
                    <SelectValue placeholder="Temperatura" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="hot">Quente (Score &gt; 75)</SelectItem>
                    <SelectItem value="warm">Morno (50-74)</SelectItem>
                    <SelectItem value="cold">Frio (&lt; 50)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1">
                  SDR Responsável
                </label>
                <Select value={filters.sdr} onValueChange={(val) => updateFilter("sdr", val)}>
                  <SelectTrigger className="h-9 bg-background/50 border-primary/10">
                    <SelectValue placeholder="SDR" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos SDRs</SelectItem>
                    <SelectItem value="me">Apenas Eu</SelectItem>
                    <SelectItem value="team">Meu Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full h-9 text-xs font-medium hover:text-primary"
                  onClick={clearFilters}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}