import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Play, 
  Bell, 
  Settings, 
  Sparkles, 
  Zap, 
  Star,
  Heart,
  Trophy,
  Flame,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  RotateCw,
  MousePointer2,
  Palette
} from "lucide-react";
import { cn } from "@/lib/utils";

const AnimacoesDemo = () => {
  const [triggerKey, setTriggerKey] = useState(0);
  const [showError, setShowError] = useState(false);

  const replayAnimations = () => {
    setTriggerKey(prev => prev + 1);
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-display gradient-text">
              Animações do Design System
            </h1>
            <p className="text-muted-foreground">
              Demonstração visual de todas as animações disponíveis
            </p>
          </div>
          <Button onClick={replayAnimations} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Replay Animações
          </Button>
        </div>

        {/* Animações de Entrada */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold font-display flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Animações de Entrada
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimationCard
              key={`fade-in-${triggerKey}`}
              title="animate-fade-in"
              description="Fade in com movimento sutil (8px)"
              className="animate-fade-in"
            />
            <AnimationCard
              key={`fade-in-up-${triggerKey}`}
              title="animate-fade-in-up"
              description="Fade in mais pronunciado (20px)"
              className="animate-fade-in-up"
            />
            <AnimationCard
              key={`fade-in-scale-${triggerKey}`}
              title="animate-fade-in-scale"
              description="Fade in com scale (0.96 → 1)"
              className="animate-fade-in-scale"
            />
            <AnimationCard
              key={`slide-in-${triggerKey}`}
              title="animate-slide-in"
              description="Slide da esquerda"
              className="animate-slide-in"
            />
            <AnimationCard
              key={`slide-in-right-${triggerKey}`}
              title="animate-slide-in-right"
              description="Slide da direita"
              className="animate-slide-in-right"
            />
            <AnimationCard
              key={`slide-up-${triggerKey}`}
              title="animate-slide-up"
              description="Slide de baixo para cima"
              className="animate-slide-up"
            />
            <AnimationCard
              key={`slide-down-${triggerKey}`}
              title="animate-slide-down"
              description="Slide de cima para baixo"
              className="animate-slide-down"
            />
            <AnimationCard
              key={`scale-in-${triggerKey}`}
              title="animate-scale-in"
              description="Scale in suave"
              className="animate-scale-in"
            />
            <AnimationCard
              key={`bounce-in-${triggerKey}`}
              title="animate-bounce-in"
              description="Entrada com overshoot elástico"
              className="animate-bounce-in"
            />
          </div>
        </section>

        {/* Animações de Modal/Dialog */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold font-display flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Animações de Modais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimationCard
              key={`zoom-in-${triggerKey}`}
              title="animate-zoom-in"
              description="Zoom in para modais (200ms)"
              className="animate-zoom-in"
            />
            <AnimationCard
              key={`flip-in-${triggerKey}`}
              title="animate-flip-in"
              description="Flip 3D para cards (400ms)"
              className="animate-flip-in"
            />
          </div>
        </section>

        {/* Animações de Atenção */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold font-display flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Animações de Atenção
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass border-border/40">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="p-4 rounded-xl bg-warning/20">
                  <Bell className="h-8 w-8 text-warning animate-bounce" />
                </div>
                <div className="text-center">
                  <p className="font-mono text-sm font-medium">animate-bounce</p>
                  <p className="text-xs text-muted-foreground">Bounce contínuo</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/40">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="p-4 rounded-xl bg-primary/20">
                  <Settings className="h-8 w-8 text-primary animate-wiggle-loop" />
                </div>
                <div className="text-center">
                  <p className="font-mono text-sm font-medium">animate-wiggle-loop</p>
                  <p className="text-xs text-muted-foreground">Rotação contínua ±8°</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/40">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div 
                  key={`wiggle-${triggerKey}`}
                  className="p-4 rounded-xl bg-accent/20"
                >
                  <Star className="h-8 w-8 text-accent animate-wiggle" />
                </div>
                <div className="text-center">
                  <p className="font-mono text-sm font-medium">animate-wiggle</p>
                  <p className="text-xs text-muted-foreground">Rotação única ±3°</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/40">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div 
                  key={`pop-${triggerKey}`}
                  className="p-4 rounded-xl bg-status-success/20"
                >
                  <Heart className="h-8 w-8 text-status-success animate-pop" />
                </div>
                <div className="text-center">
                  <p className="font-mono text-sm font-medium">animate-pop</p>
                  <p className="text-xs text-muted-foreground">Scale 1 → 1.1 → 1</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/40">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div 
                  key={`bounce-attention-${triggerKey}`}
                  className="p-4 rounded-xl bg-destructive/20 animate-bounce-attention"
                >
                  <Zap className="h-8 w-8 text-destructive" />
                </div>
                <div className="text-center">
                  <p className="font-mono text-sm font-medium">animate-bounce-attention</p>
                  <p className="text-xs text-muted-foreground">Bounce suave único</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Animações de Loading */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold font-display flex items-center gap-2">
            <Loader2 className="h-5 w-5 text-primary" />
            Animações de Loading
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass border-border/40">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <Skeleton className="h-16 w-full rounded-lg animate-shimmer" />
                <div className="text-center">
                  <p className="font-mono text-sm font-medium">animate-shimmer</p>
                  <p className="text-xs text-muted-foreground">Shimmer para skeletons</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/40">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="p-4 rounded-xl bg-primary/20 animate-pulse-glow">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-mono text-sm font-medium">animate-pulse-glow</p>
                  <p className="text-xs text-muted-foreground">Pulse com opacity</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/40">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="p-4 rounded-xl bg-secondary/20">
                  <RotateCw className="h-8 w-8 text-secondary animate-spin-slow" />
                </div>
                <div className="text-center">
                  <p className="font-mono text-sm font-medium">animate-spin-slow</p>
                  <p className="text-xs text-muted-foreground">Rotação lenta (3s)</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/40">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="relative p-4 rounded-xl bg-info/20">
                  <div className="absolute inset-0 rounded-xl bg-info/40 animate-ping-slow" />
                  <Zap className="h-8 w-8 text-info relative z-10" />
                </div>
                <div className="text-center">
                  <p className="font-mono text-sm font-medium">animate-ping-slow</p>
                  <p className="text-xs text-muted-foreground">Ping expandindo (2s)</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/40">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/50 animate-pulse-ring" />
                  <div className="p-4 rounded-full bg-primary/20 relative z-10">
                    <Bell className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-mono text-sm font-medium">animate-pulse-ring</p>
                  <p className="text-xs text-muted-foreground">Anel expandindo</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/40">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="p-4 rounded-xl bg-accent/20 animate-float">
                  <Trophy className="h-8 w-8 text-accent" />
                </div>
                <div className="text-center">
                  <p className="font-mono text-sm font-medium">animate-float</p>
                  <p className="text-xs text-muted-foreground">Levitação suave (3s)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Animações de Feedback */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold font-display flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Animações de Feedback
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card 
              key={`flash-success-${triggerKey}`}
              className="glass border-border/40 animate-flash-success"
            >
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="p-4 rounded-xl bg-status-success/20">
                  <CheckCircle className="h-8 w-8 text-status-success" />
                </div>
                <div className="text-center">
                  <p className="font-mono text-sm font-medium">animate-flash-success</p>
                  <p className="text-xs text-muted-foreground">Flash verde de sucesso</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              key={`flash-error-${triggerKey}`}
              className="glass border-border/40 animate-flash-error"
            >
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="p-4 rounded-xl bg-destructive/20">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
                <div className="text-center">
                  <p className="font-mono text-sm font-medium">animate-flash-error</p>
                  <p className="text-xs text-muted-foreground">Flash vermelho de erro</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/40">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <span 
                  key={`count-up-${triggerKey}`}
                  className="text-4xl font-bold font-display gradient-text animate-count-up"
                >
                  1.234
                </span>
                <div className="text-center">
                  <p className="font-mono text-sm font-medium">animate-count-up</p>
                  <p className="text-xs text-muted-foreground">Entrada de número</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Animação de Erro - Shake */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold font-display flex items-center gap-2">
            <XCircle className="h-5 w-5 text-primary" />
            Animação de Erro em Formulários
          </h2>
          <Card className="glass border-border/40">
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Campo com erro</label>
                  <Input 
                    error={showError}
                    placeholder="Clique no botão para ver o shake"
                    className={cn(showError && "border-destructive")}
                  />
                </div>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowError(true);
                    setTimeout(() => setShowError(false), 500);
                  }}
                >
                  Simular Erro
                </Button>
              </div>
              <p className="text-sm text-muted-foreground font-mono">
                Input com prop error=true aplica animate-shake automaticamente
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Animações de Glow */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold font-display flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            Animações de Glow (Botões)
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="glow-pulse" className="gap-2">
              <Sparkles className="h-4 w-4" />
              glow-pulse
            </Button>
            <Button variant="glow-pulse-success" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              glow-pulse-success
            </Button>
            <Button variant="glow-pulse-accent" className="gap-2">
              <Star className="h-4 w-4" />
              glow-pulse-accent
            </Button>
            <Button variant="glow" className="gap-2">
              <Zap className="h-4 w-4" />
              glow (hover)
            </Button>
            <Button variant="glow-success" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              glow-success (hover)
            </Button>
          </div>
        </section>

        {/* Micro-interações */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold font-display flex items-center gap-2">
            <MousePointer2 className="h-5 w-5 text-primary" />
            Micro-interações (Hover/Click)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass border-border/40 hover-scale cursor-pointer">
              <CardContent className="p-6 text-center">
                <p className="font-mono text-sm font-medium">hover-scale</p>
                <p className="text-xs text-muted-foreground">Scale 1.05x no hover</p>
              </CardContent>
            </Card>

            <Card className="glass border-border/40 hover-scale-sm cursor-pointer">
              <CardContent className="p-6 text-center">
                <p className="font-mono text-sm font-medium">hover-scale-sm</p>
                <p className="text-xs text-muted-foreground">Scale 1.02x no hover</p>
              </CardContent>
            </Card>

            <Card className="glass border-border/40 hover-scale-lg cursor-pointer">
              <CardContent className="p-6 text-center">
                <p className="font-mono text-sm font-medium">hover-scale-lg</p>
                <p className="text-xs text-muted-foreground">Scale 1.10x no hover</p>
              </CardContent>
            </Card>

            <Card className="glass border-border/40 hover-lift cursor-pointer">
              <CardContent className="p-6 text-center">
                <p className="font-mono text-sm font-medium">hover-lift</p>
                <p className="text-xs text-muted-foreground">Scale + translate + shadow</p>
              </CardContent>
            </Card>

            <Card className="glass border-border/40 hover-glow cursor-pointer">
              <CardContent className="p-6 text-center">
                <p className="font-mono text-sm font-medium">hover-glow</p>
                <p className="text-xs text-muted-foreground">Glow primário</p>
              </CardContent>
            </Card>

            <Card className="glass border-border/40 hover-glow-success cursor-pointer">
              <CardContent className="p-6 text-center">
                <p className="font-mono text-sm font-medium">hover-glow-success</p>
                <p className="text-xs text-muted-foreground">Glow verde</p>
              </CardContent>
            </Card>

            <Card className="glass border-border/40 hover-glow-gold cursor-pointer">
              <CardContent className="p-6 text-center">
                <p className="font-mono text-sm font-medium">hover-glow-gold</p>
                <p className="text-xs text-muted-foreground">Glow dourado</p>
              </CardContent>
            </Card>

            <Card className="glass border-border/40 hover-border-glow cursor-pointer">
              <CardContent className="p-6 text-center">
                <p className="font-mono text-sm font-medium">hover-border-glow</p>
                <p className="text-xs text-muted-foreground">Borda brilhante</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            <Button className="press-effect">press-effect</Button>
            <Button className="press-scale">press-scale</Button>
            <Button className="click-bounce">click-bounce</Button>
          </div>
        </section>

        {/* Stagger Animation Example */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold font-display flex items-center gap-2">
            <ArrowDown className="h-5 w-5 text-primary" />
            Animações Stagger (com delay)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Card 
                key={`stagger-${triggerKey}-${i}`}
                className="glass border-border/40 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <CardContent className="p-4 text-center">
                  <Badge variant="outline">{i * 100}ms</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-sm text-muted-foreground font-mono">
            {`style={{ animationDelay: \`\${index * 100}ms\` }}`}
          </p>
        </section>

        {/* Referência Rápida */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold font-display flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Referência Rápida
          </h2>
          <Card className="glass border-border/40">
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-4 font-display">Classe</th>
                      <th className="text-left py-2 px-4 font-display">Duração</th>
                      <th className="text-left py-2 px-4 font-display">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    <tr><td className="py-2 px-4 font-mono text-primary">animate-fade-in</td><td className="py-2 px-4">350ms</td><td className="py-2 px-4">Entrada</td></tr>
                    <tr><td className="py-2 px-4 font-mono text-primary">animate-fade-in-up</td><td className="py-2 px-4">500ms</td><td className="py-2 px-4">Entrada</td></tr>
                    <tr><td className="py-2 px-4 font-mono text-primary">animate-fade-in-scale</td><td className="py-2 px-4">300ms</td><td className="py-2 px-4">Entrada</td></tr>
                    <tr><td className="py-2 px-4 font-mono text-primary">animate-slide-in</td><td className="py-2 px-4">300ms</td><td className="py-2 px-4">Entrada</td></tr>
                    <tr><td className="py-2 px-4 font-mono text-primary">animate-bounce-in</td><td className="py-2 px-4">500ms</td><td className="py-2 px-4">Entrada</td></tr>
                    <tr><td className="py-2 px-4 font-mono text-primary">animate-zoom-in</td><td className="py-2 px-4">200ms</td><td className="py-2 px-4">Modal</td></tr>
                    <tr><td className="py-2 px-4 font-mono text-primary">animate-flip-in</td><td className="py-2 px-4">400ms</td><td className="py-2 px-4">Card</td></tr>
                    <tr><td className="py-2 px-4 font-mono text-primary">animate-shake</td><td className="py-2 px-4">500ms</td><td className="py-2 px-4">Erro</td></tr>
                    <tr><td className="py-2 px-4 font-mono text-primary">animate-wiggle-loop</td><td className="py-2 px-4">∞ (800ms)</td><td className="py-2 px-4">Atenção</td></tr>
                    <tr><td className="py-2 px-4 font-mono text-primary">animate-bounce</td><td className="py-2 px-4">∞</td><td className="py-2 px-4">Atenção</td></tr>
                    <tr><td className="py-2 px-4 font-mono text-primary">animate-float</td><td className="py-2 px-4">∞ (3s)</td><td className="py-2 px-4">Decorativo</td></tr>
                    <tr><td className="py-2 px-4 font-mono text-primary">animate-shimmer</td><td className="py-2 px-4">∞ (1.8s)</td><td className="py-2 px-4">Loading</td></tr>
                    <tr><td className="py-2 px-4 font-mono text-primary">animate-glow-pulse</td><td className="py-2 px-4">∞ (2s)</td><td className="py-2 px-4">CTA</td></tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </MainLayout>
  );
};

// Componente auxiliar para cards de animação
const AnimationCard = ({ 
  title, 
  description, 
  className 
}: { 
  title: string; 
  description: string; 
  className: string;
}) => (
  <Card className={cn("glass border-border/40", className)}>
    <CardContent className="p-6">
      <div className="h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 mb-4 flex items-center justify-center">
        <Play className="h-6 w-6 text-primary" />
      </div>
      <p className="font-mono text-sm font-medium text-primary">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

export default AnimacoesDemo;
