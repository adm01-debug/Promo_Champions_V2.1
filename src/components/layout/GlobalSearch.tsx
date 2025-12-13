import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  id: string;
  type: "deal" | "client";
  title: string;
  subtitle?: string;
  status?: string;
  amount?: number;
}

export interface GlobalSearchHandle {
  open: () => void;
}

export const GlobalSearch = forwardRef<GlobalSearchHandle>((_, ref) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }));

  // Keyboard shortcut: Ctrl/Cmd + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search logic
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data: sales, error } = await supabase
        .from("sales")
        .select("id, client_name, product_name, status, amount")
        .or(`client_name.ilike.%${searchQuery}%,product_name.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;

      // Group by unique clients and deals
      const clientsMap = new Map<string, SearchResult>();
      const deals: SearchResult[] = [];

      (sales || []).forEach((sale) => {
        // Add as deal
        deals.push({
          id: sale.id,
          type: "deal",
          title: sale.product_name,
          subtitle: sale.client_name,
          status: sale.status,
          amount: sale.amount,
        });

        // Track unique clients
        if (!clientsMap.has(sale.client_name)) {
          clientsMap.set(sale.client_name, {
            id: sale.client_name,
            type: "client",
            title: sale.client_name,
          });
        }
      });

      setResults([...Array.from(clientsMap.values()), ...deals]);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    if (result.type === "deal") {
      navigate("/pipeline");
    } else {
      navigate("/clientes");
    }
  };

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500",
    qualified: "bg-blue-500/10 text-blue-500",
    proposal: "bg-purple-500/10 text-purple-500",
    negotiation: "bg-orange-500/10 text-orange-500",
    completed: "bg-green-500/10 text-green-500",
    lost: "bg-red-500/10 text-red-500",
  };

  const clients = results.filter((r) => r.type === "client");
  const deals = results.filter((r) => r.type === "deal");

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Buscar deals e clientes... (Ctrl+K)"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {isLoading ? "Buscando..." : "Nenhum resultado encontrado."}
        </CommandEmpty>

        {clients.length > 0 && (
          <CommandGroup heading="Clientes">
            {clients.map((result) => (
              <CommandItem
                key={`client-${result.id}`}
                onSelect={() => handleSelect(result)}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{result.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {deals.length > 0 && (
          <CommandGroup heading="Deals">
            {deals.map((result) => (
              <CommandItem
                key={`deal-${result.id}`}
                onSelect={() => handleSelect(result)}
                className="cursor-pointer"
              >
                <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <span className="font-medium">{result.title}</span>
                    <span className="text-muted-foreground ml-2 text-sm">
                      {result.subtitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.status && (
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${statusColors[result.status] || ""}`}
                      >
                        {result.status}
                      </Badge>
                    )}
                    {result.amount && (
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(result.amount)}
                      </span>
                    )}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
});

GlobalSearch.displayName = "GlobalSearch";

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground rounded-lg border border-border/50 bg-muted/50 hover:bg-muted transition-colors"
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">Buscar...</span>
      <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}
