import { useState } from "react";
import { Bookmark, BookmarkPlus, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useWinLossSavedViews,
  useSaveWinLossView,
  useDeleteWinLossView,
  type SavedView,
} from "@/hooks/win-loss/useWinLossSavedViews";
import type { WinLossFilterState } from "@/components/win-loss/winLossFiltersHelpers";

interface Props {
  currentFilters: WinLossFilterState;
  onLoad: (view: SavedView) => void;
}

export function WinLossSavedViews({ currentFilters, onLoad }: Props) {
  const { data: views = [] } = useWinLossSavedViews();
  const save = useSaveWinLossView();
  const del = useDeleteWinLossView();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [makeDefault, setMakeDefault] = useState(false);

  const submit = () => {
    if (!name.trim()) return;
    save.mutate(
      { name: name.trim(), filters: currentFilters, makeDefault },
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
          setMakeDefault(false);
        },
      },
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            <Bookmark className="h-3.5 w-3.5 mr-1.5" />
            Visões
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 z-50 bg-popover">
          <DropdownMenuLabel>Minhas visões</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {!views.length && (
            <p className="px-2 py-3 text-xs text-muted-foreground text-center">Nenhuma visão salva.</p>
          )}
          {views.map(v => (
            <DropdownMenuItem
              key={v.id}
              className="flex items-center justify-between gap-2"
              onSelect={(e) => { e.preventDefault(); onLoad(v); }}
            >
              <span className="flex items-center gap-1.5 truncate">
                {v.is_default && <Check className="h-3 w-3 text-primary" />}
                <span className="truncate">{v.name}</span>
              </span>
              <button
                type="button"
                aria-label={`Remover ${v.name}`}
                className="text-muted-foreground hover:text-destructive transition-colors"
                onClick={(e) => { e.stopPropagation(); del.mutate(v.id); }}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setOpen(true); }}>
            <BookmarkPlus className="h-3.5 w-3.5 mr-1.5" />
            Salvar visão atual
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Salvar visão atual</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="view-name" className="text-xs">Nome</Label>
              <Input
                id="view-name"
                placeholder="Ex.: Q1 enterprise · vs. Concorrente X"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>
            <label className="flex items-center gap-2 text-xs">
              <Checkbox checked={makeDefault} onCheckedChange={c => setMakeDefault(!!c)} />
              Definir como padrão
            </label>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={submit} disabled={!name.trim() || save.isPending}>
              {save.isPending ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
