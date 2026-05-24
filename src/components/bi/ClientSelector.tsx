import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useClientSearch } from "@/hooks/bi/useClientSearch";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface ClientSelectorProps {
  onSelect: (client: { id: string; name: string; ramo_atividade: string | null }) => void;
  selectedId?: string;
}

export function ClientSelector({ onSelect, selectedId }: ClientSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedValue(searchValue, 300);
  
  const { data: clients, isLoading } = useClientSearch(debouncedSearch);
  const selectedClient = clients?.find((c) => c.id === selectedId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white/5 border-white/10 hover:bg-white/10 text-foreground"
        >
          {selectedClient ? selectedClient.name : "Selecionar cliente para análise..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 bg-background border-white/10">
        <Command>
          <CommandInput 
            placeholder="Buscar por nome do cliente..." 
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
            <CommandGroup>
              {clients?.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.name}
                  onSelect={() => {
                    onSelect({
                      id: client.id,
                      name: client.name,
                      ramo_atividade: (client as any).ramo_atividade || null
                    });
                    setOpen(false);
                  }}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-bold">{client.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      {(client as any).ramo_atividade || "Sem ramo definido"}
                    </span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedId === client.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
