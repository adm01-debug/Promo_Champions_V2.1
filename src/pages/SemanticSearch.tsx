import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Sparkles } from "lucide-react";
import { SemanticSearchDialog } from "@/components/semantic/SemanticSearchDialog";
import { Button } from "@/components/ui/button";

export default function SemanticSearch() {
  const [open, setOpen] = useState(true);

  useEffect(() => { setOpen(true); }, []);

  return (
    <>
      <Helmet>
        <title>Busca Semântica | Promo Champions</title>
        <meta name="description" content="Busca semântica universal com IA: encontre clientes, leads, deals, atividades e calls usando linguagem natural." />
      </Helmet>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="text-center space-y-4 py-12">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Busca Semântica Universal</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Pergunte em linguagem natural. A IA entende a intenção e encontra resultados relevantes em clientes, leads, deals, atividades e gravações.
          </p>
          <Button size="lg" onClick={() => setOpen(true)} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Abrir busca
          </Button>
          <p className="text-xs text-muted-foreground">Atalho: <kbd className="px-1.5 py-0.5 rounded bg-muted">Ctrl/⌘ + Shift + F</kbd></p>
        </div>
      </div>

      <SemanticSearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
