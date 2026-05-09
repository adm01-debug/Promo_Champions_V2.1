import { useState, useEffect } from "react";
import { Search, Command, Zap, Brain, TrendingUp, MessageSquare, Briefcase, FileText, BarChart3, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const IntelligenceCommandBar = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const suggestions = [
    { label: "Revenue Forecast", icon: TrendingUp, route: "/revenue-intelligence" },
    { label: "Conversational Sentiment", icon: MessageSquare, route: "/conversational-intelligence" },
    { label: "Deal Risk Analysis", icon: Briefcase, route: "/deal-intelligence" },
    { label: "Predictive AI Model", icon: Brain, route: "/inteligencia-preditiva" },
    { label: "Executive Summary", icon: FileText, route: "/relatorios-executivos" },
    { label: "Pipeline Velocity", icon: BarChart3, route: "/deal-intelligence" },
    { label: "Buying Committee", icon: ShieldCheck, route: "/deal-intelligence" },
  ];

  const filteredSuggestions = suggestions.filter(s => 
    s.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsFocused(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative max-w-2xl mx-auto z-50">
      <div 
        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 backdrop-blur-md ${
          isFocused 
            ? "bg-black/60 border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.2)]" 
            : "bg-white/5 border-white/10"
        }`}
      >
        <Command className={`size-4 transition-colors ${isFocused ? "text-primary" : "text-muted-foreground"}`} />
        <input 
          type="text"
          placeholder="O que você deseja analisar agora? (e.g. 'Show me revenue forecast')"
          className="bg-transparent border-none outline-none text-sm w-full font-medium placeholder:text-muted-foreground/50"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-black uppercase text-muted-foreground">
          <span>⌘</span>
          <span>K</span>
        </div>
      </div>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl bg-black/80 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            <div className="p-2 border-b border-white/5 mb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Zap className="size-3" /> Sugestões Inteligentes
              </p>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((s, i) => (
                  <div 
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-primary/10 transition-colors cursor-pointer group"
                    onClick={() => {
                      navigate(s.route);
                      setIsFocused(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <s.icon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground">{s.label}</span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary">Jump to Module</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className="text-xs text-muted-foreground italic">No results found for "{query}"</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};