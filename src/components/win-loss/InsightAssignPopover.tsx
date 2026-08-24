import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus2, Check, X } from "lucide-react";
import { useActiveSalespeople } from "@/hooks/win-loss/useWinLossData";
import { useInsightAssignment } from "@/hooks/win-loss/useInsightAssignment";

interface Props {
  insightId: string;
  currentAssigneeId?: string | null;
  currentAssigneeName?: string | null;
  currentAssigneeAvatar?: string | null;
}

const initials = (name?: string | null) =>
  (name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function InsightAssignPopover({ insightId, currentAssigneeId, currentAssigneeName, currentAssigneeAvatar }: Props) {
  const [open, setOpen] = useState(false);
  const { data: people = [] } = useActiveSalespeople();
  const assign = useInsightAssignment();

  const handlePick = async (id: string | null) => {
    await assign.mutateAsync({ insightId, salespersonId: id });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-[11px]"
          aria-label={currentAssigneeId ? `Atribuído a ${currentAssigneeName}` : "Atribuir insight"}
        >
          {currentAssigneeId ? (
            <>
              <Avatar className="h-4 w-4 mr-1">
                <AvatarImage src={currentAssigneeAvatar ?? undefined} alt={currentAssigneeName ?? ""} />
                <AvatarFallback className="text-[8px]">{initials(currentAssigneeName)}</AvatarFallback>
              </Avatar>
              <span className="max-w-[80px] truncate">{currentAssigneeName ?? "Atribuído"}</span>
            </>
          ) : (
            <>
              <UserPlus2 className="h-3 w-3 mr-1" />
              Atribuir
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1" align="end">
        <div className="text-[10px] text-muted-foreground px-2 py-1">Atribuir a…</div>
        <ul className="max-h-56 overflow-y-auto">
          {people.map((p) => {
            const sel = p.id === currentAssigneeId;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => void handlePick(p.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-muted transition-colors"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[9px]">{initials(p.name)}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 truncate text-left">{p.name}</span>
                  {sel && <Check className="h-3 w-3 text-primary" />}
                </button>
              </li>
            );
          })}
        </ul>
        {currentAssigneeId && (
          <button
            type="button"
            onClick={() => void handlePick(null)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-destructive hover:bg-destructive/5 transition-colors mt-1 border-t border-border/40 pt-2"
          >
            <X className="h-3 w-3" />
            Remover atribuição
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
