import { Helmet } from "react-helmet-async";
import { Sparkles, History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NLQInput } from "@/components/nlq/NLQInput";
import { NLQAnswerCard } from "@/components/nlq/NLQAnswerCard";
import { useNLQ } from "@/hooks/nlq/useNLQ";

export default function AskAnything() {
  const { loading, response, history, ask, clearHistory, restore } = useNLQ();

  return (
    <>
      <Helmet>
        <title>Perguntar à IA — Promo Champions</title>
        <meta name="description" content="Faça perguntas em linguagem natural sobre suas vendas, pipeline, atividades e clientes. A IA responde com dados reais do CRM." />
        <link rel="canonical" href="/perguntar" />
      </Helmet>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <header className="mb-6">
          <h1 className="text-page-title flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" /> Perguntar à IA
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Linguagem natural sobre seus dados de CRM. A IA consulta o banco em tempo real respeitando suas permissões.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <NLQInput loading={loading} onAsk={ask} autoFocus />
              </CardContent>
            </Card>

            {response && <NLQAnswerCard response={response} />}

            {!response && !loading && (
              <Card className="border-dashed">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Comece com uma pergunta acima ou escolha uma das sugestões.
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="space-y-3">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <History className="h-4 w-4" /> Histórico
                </CardTitle>
                {history.length > 0 && (
                  <Button variant="ghost" size="icon-sm" onClick={clearHistory} aria-label="Limpar histórico">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {history.length === 0 ? (
                  <div className="p-4 text-xs text-muted-foreground">Nenhuma pergunta ainda.</div>
                ) : (
                  <ScrollArea className="h-[420px]">
                    <ul className="divide-y divide-border/60">
                      {history.map((item) => (
                        <li key={item.at}>
                          <button
                            type="button"
                            onClick={() => restore(item)}
                            className="w-full text-left px-4 py-3 hover:bg-accent/10 transition-colors"
                          >
                            <div className="text-xs font-medium line-clamp-2">{item.question}</div>
                            <div className="text-[10px] text-muted-foreground mt-1">
                              {new Date(item.at).toLocaleString("pt-BR")}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}
