import { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User, Briefcase, Plus, LayoutDashboard, Settings, Mail, ListTodo, Headphones, BookOpen } from "lucide-react";
import Fuse from "fuse.js";
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
  const [allData, setAllData] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }));

  // Fuse.js instance for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(allData, {
      keys: ['title', 'subtitle'],
      threshold: 0.4,
      includeScore: true,
      ignoreLocation: true,
      minMatchCharLength: 1,
    });
  }, [allData]);

  // Fuzzy search results
  const results = useMemo(() => {
    if (!query.trim()) {
      return allData.slice(0, 15);
    }
    const fuseResults = fuse.search(query, { limit: 15 });
    return fuseResults.map((result) => result.item);
  }, [query, fuse, allData]);

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

  // Load all searchable data when dialog opens
  const loadSearchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: sales, error } = await supabase
        .from("sales")
        .select("id, client_name, product_name, status, amount")
        .limit(100);

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

      setAllData([...Array.from(clientsMap.values()), ...deals]);
    } catch (error) {
      if (import.meta.env.DEV) {
        if (import.meta.env.DEV) console.error("Search error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data when dialog opens
  useEffect(() => {
    if (open && allData.length === 0) {
      loadSearchData();
    }
  }, [open, allData.length, loadSearchData]);


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
    pending: "bg-rank-gold/10 text-rank-gold",
    qualified: "bg-status-info/10 text-status-info",
    proposal: "bg-status-purple/10 text-status-purple",
    negotiation: "bg-status-warning/10 text-status-warning",
    completed: "bg-status-success/10 text-status-success",
    lost: "bg-status-error/10 text-status-error",
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
