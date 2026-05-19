import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Search, Sparkles, Camera, Loader2, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSemanticSearch, type SemanticProduct } from "@/hooks/useSemanticSearch";
import {
  VisualSearchButton,
  type VisualSearchResponse,
  type VisualSearchProduct,
} from "@/components/search/VisualSearchButton";

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function ProductCard({ p }: { p: SemanticProduct | VisualSearchProduct }) {
  return (
    <Card className="hover-scale transition-shadow hover:shadow-md">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm line-clamp-2">{p.name}</h3>
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            {Math.round(p.similarity_score * 100)}%
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{p.category}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="font-semibold text-primary">{formatBRL(Number(p.price))}</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-rank-gold text-rank-gold" />
            {Number(p.rating).toFixed(1)}
            <span className="ml-1">· {p.sales_count} vendas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SmartSearch() {
  const [query, setQuery] = useState("");
  const semantic = useSemanticSearch();
  const [visual, setVisual] = useState<VisualSearchResponse | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void semantic.search(query);
  };

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <Helmet>
        <title>Busca Inteligente | Promo Champions</title>
        <meta
          name="description"
          content="Busca semântica e visual de produtos usando IA. Descreva o que procura ou envie uma foto."
        />
      </Helmet>

      <header className="space-y-1">
        <h1 className="text-page-title flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          Busca Inteligente
        </h1>
        <p className="text-muted-foreground">
          Descreva o produto em linguagem natural ou envie uma foto. A IA encontra os itens mais
          relevantes do catálogo.
        </p>
      </header>

      <Tabs defaultValue="semantic" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="semantic" className="gap-2">
            <Search className="h-4 w-4" /> Semântica
          </TabsTrigger>
          <TabsTrigger value="visual" className="gap-2">
            <Camera className="h-4 w-4" /> Visual
          </TabsTrigger>
        </TabsList>

        {/* SEMANTIC */}
        <TabsContent value="semantic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Busca por descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  placeholder='ex.: "caneta executiva preta para evento corporativo"'
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={semantic.loading}
                />
                <Button type="submit" disabled={semantic.loading || !query.trim()}>
                  {semantic.loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">Buscar</span>
                </Button>
              </form>

              {semantic.data && (
                <div className="mt-4 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {semantic.data.keywords.map((k) => (
                      <Badge key={k} variant="outline" className="text-xs">
                        {k}
                      </Badge>
                    ))}
                    {semantic.data.cached && (
                      <Badge variant="secondary" className="text-xs">cache</Badge>
                    )}
                  </div>
                  {semantic.data.intent && (
                    <p className="text-xs text-muted-foreground italic">
                      Intenção interpretada: {semantic.data.intent}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {semantic.data && (
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                {semantic.data.count} resultado(s)
              </h2>
              {semantic.data.count === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    Nenhum produto encontrado. Tente outras palavras.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {semantic.data.results.map((p) => (
                    <ProductCard key={p.id} p={p} />
                  ))}
                </div>
              )}
            </section>
          )}
        </TabsContent>

        {/* VISUAL */}
        <TabsContent value="visual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Busca por imagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Envie uma foto do produto desejado. A IA identifica o item e procura similares no
                catálogo.
              </p>
              <VisualSearchButton onResults={setVisual} />
            </CardContent>
          </Card>

          {visual && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Análise da imagem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {visual.analysis.product_name && (
                    <p>
                      <span className="font-medium">Identificado:</span>{" "}
                      {visual.analysis.product_name}
                    </p>
                  )}
                  {visual.analysis.category && (
                    <p>
                      <span className="font-medium">Categoria:</span> {visual.analysis.category}
                    </p>
                  )}
                  {(visual.analysis.color || visual.analysis.material) && (
                    <p className="text-muted-foreground">
                      {visual.analysis.color && `Cor: ${visual.analysis.color}`}
                      {visual.analysis.color && visual.analysis.material && " · "}
                      {visual.analysis.material && `Material: ${visual.analysis.material}`}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {visual.analysis.keywords?.map((k) => (
                      <Badge key={k} variant="outline" className="text-xs">
                        {k}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <section>
                <h2 className="text-sm font-medium text-muted-foreground mb-3">
                  {visual.count} produto(s) similar(es)
                </h2>
                {visual.count === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      Nenhum produto similar encontrado.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {visual.results.map((p) => (
                      <ProductCard key={p.id} p={p} />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
