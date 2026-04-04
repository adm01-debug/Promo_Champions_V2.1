import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormLabel } from "@/components/ui/form";
import { Handshake, X } from "lucide-react";

interface Closer {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface CloserSelectorProps {
  allClosers: Closer[];
  selectedClosers: string[];
  onToggle: (closerId: string) => void;
  validationMessage: string | null;
}

export const CloserSelector = React.memo(function CloserSelector({ allClosers, selectedClosers, onToggle, validationMessage }: CloserSelectorProps) {
  return (
    <div className="space-y-2">
      <FormLabel className="flex items-center justify-between">
        <span className="flex items-center gap-2"><Handshake className="h-4 w-4" />Closers Atendidos *</span>
        <Badge variant="outline" className="text-xs">{selectedClosers.length}/2</Badge>
      </FormLabel>
      <p className="text-xs text-muted-foreground">Os 2 Closers que este SDR atende (são concorrentes entre si)</p>

      {selectedClosers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedClosers.map((closerId) => {
            const closer = allClosers.find((c) => c.id === closerId);
            if (!closer) return null;
            return (
              <Badge key={closerId} variant="secondary" className="flex items-center gap-1 pr-1">
                {closer.name}
                <Button type="button" variant="ghost" size="icon" aria-label="Remover" className="h-4 w-4 ml-1 hover:bg-destructive/20" onClick={() => onToggle(closerId)}><X className="h-3 w-3" /></Button>
              </Badge>
            );
          })}
        </div>
      )}

      <ScrollArea className="h-[180px] border rounded-lg p-2">
        <div className="space-y-2">
          {allClosers.map((closer) => (
            <div key={closer.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => onToggle(closer.id)}>
              <Checkbox checked={selectedClosers.includes(closer.id)} disabled={!selectedClosers.includes(closer.id) && selectedClosers.length >= 2} />
              <Avatar className="h-8 w-8"><AvatarImage src={closer.avatar_url || undefined} /><AvatarFallback className="text-xs">{closer.name.substring(0, 2).toUpperCase()}</AvatarFallback></Avatar>
              <div className="flex-1"><p className="text-sm font-medium">{closer.name}</p></div>
            </div>
          ))}
          {allClosers.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum closer disponível</p>}
        </div>
      </ScrollArea>
      {validationMessage && <p className="text-sm text-status-warning flex items-center gap-1">⚠️ {validationMessage}</p>}
    </div>
  );
});
