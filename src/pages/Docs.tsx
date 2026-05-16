import React from "react";
import { MainLayout } from "@/components/templates/MainLayout";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { NavItem } from "@/components/navigation/NavItem";
import { StatCard } from "@/components/dashboard/StatCard";
import { Home, TrendingUp, BookOpen, Layers, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkeletonStatCard, SkeletonCard } from "@/components/ui/skeleton-shimmer";

const DocsPage = () => {
  return (
    <PageTransition>
      <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
        <header className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-widest">
            <BookOpen className="h-4 w-4" />
            System Documentation
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Guidelines de Componentes</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Manual de excelência visual e funcional para os principais blocos de construção do ecossistema Promo Champions.
          </p>
        </header>

        <Tabs defaultValue="navitem" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="navitem">NavItem</TabsTrigger>
            <TabsTrigger value="statcard">StatCard</TabsTrigger>
            <TabsTrigger value="transitions">Transitions</TabsTrigger>
          </TabsList>

          <TabsContent value="navitem" className="mt-6 space-y-6">
            <Card className="border-primary/10 bg-background/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  NavItem (Navegação de Elite)
                </CardTitle>
                <CardDescription>
                  Componente de navegação lateral com feedback visual premium e micro-interações.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Preview</h3>
                    <div className="p-8 rounded-xl bg-sidebar/50 border border-border/50 max-w-xs space-y-2">
                      <NavItem title="Página Inicial" url="/docs" icon={Home} />
                      <NavItem title="Análises" url="/analytics" icon={TrendingUp} badgeCount={5} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Guidelines</h3>
                    <ul className="space-y-2 text-sm list-disc list-inside text-muted-foreground">
                      <li>Use ícones de linha (Lucide) para manter a leveza visual.</li>
                      <li>Badges devem ser usados para sinalizar itens pendentes ou novos dados.</li>
                      <li>O estado ativo injeta automaticamente um glow neon via Framer Motion.</li>
                      <li>Sempre forneça um <code className="bg-muted px-1 rounded">title</code> descritivo para o tooltip.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statcard" className="mt-6 space-y-6">
            <Card className="border-primary/10 bg-background/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  StatCard (Métricas Futuristas)
                </CardTitle>
                <CardDescription>
                  Cartões de dados com contagem animada, sparklines e estética Cyber-Arena.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Preview (Variantes)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <StatCard 
                        title="Vendas Totais" 
                        value="R$ 15.420" 
                        numericValue={15420} 
                        change={12.5} 
                        icon={TrendingUp} 
                        variant="primary"
                        sparklineData={[10, 15, 8, 20, 18, 25, 22]}
                      />
                      <StatCard 
                        title="Meta Batida" 
                        value="85%" 
                        numericValue={85} 
                        change={2.1} 
                        icon={Zap} 
                        variant="success"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Guidelines</h3>
                    <ul className="space-y-2 text-sm list-disc list-inside text-muted-foreground">
                      <li>Use <code className="bg-muted px-1 rounded">hero</code> apenas para a métrica principal da página.</li>
                      <li>Forneça <code className="bg-muted px-1 rounded">numericValue</code> para habilitar a animação de contagem (FPS otimizado).</li>
                      <li>Sparklines ajudam a entender a tendência sem ocupar espaço extra.</li>
                      <li>Variantes (primary, success, warning) devem seguir a semântica do dado.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transitions" className="mt-6 space-y-6">
            <Card className="border-primary/10 bg-background/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  PageTransition & Loading (Performance 10/10)
                </CardTitle>
                <CardDescription>
                  Sistemas de orquestração visual para transições suaves e carregamento progressivo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Skeleton System</h3>
                    <div className="space-y-4">
                      <SkeletonStatCard />
                      <div className="grid grid-cols-2 gap-4">
                        <SkeletonCard />
                        <SkeletonCard />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Guidelines</h3>
                    <ul className="space-y-2 text-sm list-disc list-inside text-muted-foreground">
                      <li>Envolva todas as páginas com <code className="bg-muted px-1 rounded">&lt;PageTransition /&gt;</code>.</li>
                      <li>A transição detecta automaticamente a profundidade da URL para definir a direção do slide.</li>
                      <li>Use <code className="bg-muted px-1 rounded">SmartSkeleton</code> em carregamentos assíncronos para reduzir o Layout Shift.</li>
                      <li>A propriedade <code className="bg-muted px-1 rounded">will-change</code> é aplicada em transições críticas para garantir 60 FPS.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
};

export default DocsPage;
