import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Braces } from "lucide-react";
import { AVAILABLE_MERGE_TAGS, applyMergeTags, type MergeTagContext } from "@/lib/mergeTags";

interface MergeTagPickerProps {
  onInsert: (tagToken: string) => void;
  preview?: string;
  previewContext?: MergeTagContext;
}

const SAMPLE_CTX: MergeTagContext = {
  sale: { client_name: "João Silva", amount: 12500, stage: "qualified", category: "Brindes Premium", source: "LinkedIn" },
  client: { name: "João Silva", company: "Acme Ltda", email: "joao@acme.com", phone: "(11) 9 9999-9999" },
  salesperson: { name: "Maria", email: "maria@empresa.com" },
};

export function MergeTagPicker({ onInsert, preview, previewContext }: MergeTagPickerProps) {
  const grouped = AVAILABLE_MERGE_TAGS.reduce<Record<string, typeof AVAILABLE_MERGE_TAGS>>((acc, tag) => {
    (acc[tag.group] ??= []).push(tag);
    return acc;
  }, {});

  const ctx = previewContext ?? SAMPLE_CTX;
  const rendered = preview ? applyMergeTags(preview, ctx) : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="gap-2 h-8">
          <Braces className="h-3.5 w-3.5" /> Variáveis
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <ScrollArea className="h-[320px]">
          <div className="p-3 space-y-3">
            {Object.entries(grouped).map(([group, tags]) => (
              <div key={group} className="space-y-1.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{group}</p>
                <div className="flex flex-wrap gap-1">
                  {tags.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => onInsert(`{{${t.key}}}`)}
                      className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-2 py-1 text-[11px] hover:bg-primary/10 hover:border-primary/50 transition-colors"
                      title={`Exemplo: ${t.example}`}
                    >
                      <code className="text-primary">{`{{${t.key}}}`}</code>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {rendered && (
              <div className="pt-2 border-t border-border/40">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Pré-visualização</p>
                <div className="text-xs whitespace-pre-wrap rounded-md bg-muted/30 p-2">{rendered}</div>
                <Badge variant="secondary" className="text-[9px] mt-1">dados de exemplo</Badge>
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
