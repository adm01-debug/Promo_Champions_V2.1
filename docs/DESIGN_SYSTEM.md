# Design System - SalesPro

Documentação completa das classes utilitárias, variantes e tokens de design implementados.

## Índice

1. [Tipografia](#tipografia)
2. [Cores e Tokens](#cores-e-tokens)
3. [Cards](#cards)
4. [Botões](#botões)
5. [Efeitos de Hover](#efeitos-de-hover)
6. [Efeitos de Glow](#efeitos-de-glow)
7. [Glass Morphism](#glass-morphism)
8. [Gradientes](#gradientes)
9. [Sombras](#sombras)
10. [Focus States](#focus-states)
11. [Animações](#animações)
12. [Gamificação](#gamificação)

---

## Tipografia

### Fontes

```css
/* Fonte principal (body) */
font-family: 'Plus Jakarta Sans', system-ui, sans-serif;

/* Fonte display (headers) */
font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
```

### Classes

```tsx
// Headers automaticamente usam font-display
<h1>Título Principal</h1>  // Space Grotesk
<h2>Subtítulo</h2>         // Space Grotesk
<h3>Seção</h3>             // Space Grotesk

// Classe explícita
<span className="font-display">Texto Display</span>
```

---

## Cores e Tokens

### Cores Semânticas (use SEMPRE estas)

```tsx
// Backgrounds
className="bg-background"      // Fundo principal
className="bg-card"            // Fundo de cards
className="bg-muted"           // Fundo secundário/sutil

// Texto
className="text-foreground"        // Texto principal
className="text-muted-foreground"  // Texto secundário
className="text-primary"           // Texto de destaque

// Status
className="text-status-success"    // Verde (sucesso)
className="text-status-warning"    // Amarelo (atenção)
className="text-status-error"      // Vermelho (erro)
className="text-status-info"       // Azul (informação)
className="text-status-purple"     // Roxo (especial)

// Ranking
className="text-rank-gold"         // Dourado (1º lugar)
className="text-rank-silver"       // Prata (2º lugar)
className="text-rank-bronze"       // Bronze (3º lugar)

// Gamificação
className="text-xp"                // Verde XP
className="text-coins"             // Dourado moedas
className="text-streak"            // Laranja sequência
```

---

## Cards

### Variantes de Card

```tsx
import { Card } from "@/components/ui/card";

// Padrão - sombra sutil
<Card variant="default">...</Card>

// Elevado - sombra mais pronunciada, hover effect
<Card variant="elevated">...</Card>

// Flutuante - máxima elevação
<Card variant="floating">...</Card>

// Glass - efeito vidro com blur
<Card variant="glass">...</Card>

// Profundidade - borda interna luminosa
<Card variant="depth">...</Card>

// Interativo - cursor pointer, hover lift
<Card variant="interactive">...</Card>

// Ghost - transparente, sem borda
<Card variant="ghost">...</Card>
```

### Classes de Card Auxiliares

```tsx
// Elevação com sombra
className="card-elevated"

// Profundidade com borda interna
className="card-depth"

// Glow de borda no dark mode
className="dark:border-glow"
```

---

## Botões

### Variantes de Button

```tsx
import { Button } from "@/components/ui/button";

// Padrão
<Button variant="default">Ação</Button>

// Destrutivo
<Button variant="destructive">Deletar</Button>

// Outline
<Button variant="outline">Cancelar</Button>

// Secundário
<Button variant="secondary">Secundário</Button>

// Ghost
<Button variant="ghost">Ghost</Button>

// Link
<Button variant="link">Link</Button>

// Glow - CTA principal com efeito brilho
<Button variant="glow">CTA Principal</Button>

// Glow Secundário - azul com brilho
<Button variant="glow-secondary">Secundário</Button>

// Glow Success - verde com brilho (salvar/confirmar)
<Button variant="glow-success">Salvar</Button>

// Glow Accent - roxo com brilho
<Button variant="glow-accent">Especial</Button>
```

---

## Efeitos de Hover

### Hover Scale

```tsx
// Escala pequena (1.02x)
<div className="hover-scale-sm">...</div>

// Escala média (1.05x) - MAIS USADO
<div className="hover-scale">...</div>

// Escala grande (1.10x)
<div className="hover-scale-lg">...</div>
```

### Hover Lift

```tsx
// Combina scale + translate-y + shadow
<div className="hover-lift">...</div>
```

### Hover Border Glow

```tsx
// Borda brilhante no hover
<div className="hover-border-glow">...</div>
```

---

## Efeitos de Glow

### Hover Glow (aplica no hover)

```tsx
// Glow primário (laranja)
<div className="hover-glow">...</div>

// Glow secundário (azul)
<div className="hover-glow-secondary">...</div>

// Glow sucesso (verde)
<div className="hover-glow-success">...</div>

// Glow accent (roxo)
<div className="hover-glow-accent">...</div>

// Glow dourado
<div className="hover-glow-gold">...</div>
```

### Glow Estático (sempre visível)

```tsx
// Glow primário permanente
<div className="glow-primary">...</div>

// Glow secundário permanente
<div className="glow-secondary">...</div>

// Glow sucesso permanente
<div className="glow-success">...</div>
```

---

## Glass Morphism

```tsx
// Glass básico
<div className="glass">...</div>

// Glass com hover
<div className="glass glass-hover">...</div>
```

**Comportamento:**
- Light mode: `bg-card/80` com `backdrop-blur-xl`
- Dark mode: `bg-card/70` com borda branca sutil

---

## Gradientes

### Background Gradients

```tsx
// Gradiente primário (laranja → rosa)
<div className="gradient-primary">...</div>

// Gradiente secundário (azul → roxo)
<div className="gradient-secondary">...</div>

// Gradiente sucesso (verde → ciano)
<div className="gradient-success">...</div>

// Gradiente XP (verde → ciano horizontal)
<div className="gradient-xp">...</div>
```

### Text Gradient

```tsx
// Texto com gradiente
<span className="gradient-text">Texto Colorido</span>
```

### Border Gradient

```tsx
// Borda com gradiente
<div className="gradient-border">...</div>
```

### Rank Gradients

```tsx
// Medalha ouro
<div className="rank-gold">1º</div>

// Medalha prata
<div className="rank-silver">2º</div>

// Medalha bronze
<div className="rank-bronze">3º</div>
```

---

## Sombras

```tsx
// Sombra suave (adapta light/dark)
<div className="shadow-soft">...</div>

// Sombras do Tailwind
<div className="shadow-sm">...</div>
<div className="shadow-md">...</div>
<div className="shadow-lg">...</div>
<div className="shadow-xl">...</div>
```

---

## Focus States

Os focus states são aplicados automaticamente com:

```css
*:focus-visible {
  outline: none;
  ring: 2px solid primary/50;
  ring-offset: 2px;
}
```

### Focus Animado

```tsx
// Ring com animação de pulse
<button className="focus-ring-animated">...</button>
```

---

## Animações

O sistema de design inclui animações otimizadas para performance e acessibilidade. Todas respeitam `prefers-reduced-motion`.

### Animações de Entrada

```tsx
// Fade in com movimento sutil para cima (8px)
<div className="animate-fade-in">...</div>

// Fade in mais pronunciado (20px)
<div className="animate-fade-in-up">...</div>

// Fade in com scale (0.96 → 1)
<div className="animate-fade-in-scale">...</div>

// Slide da esquerda
<div className="animate-slide-in">...</div>

// Slide da direita
<div className="animate-slide-in-right">...</div>

// Slide para cima
<div className="animate-slide-up">...</div>

// Slide para baixo
<div className="animate-slide-down">...</div>

// Scale in
<div className="animate-scale-in">...</div>

// Bounce in (com overshoot)
<div className="animate-bounce-in">...</div>
```

**Uso com delay stagger:**

```tsx
{items.map((item, index) => (
  <div 
    key={item.id}
    className="animate-fade-in"
    style={{ animationDelay: `${index * 75}ms` }}
  >
    {item.content}
  </div>
))}
```

### Animações de Modais e Dialogs

```tsx
// Zoom in para entrada de modais
<DialogContent className="animate-zoom-in data-[state=closed]:animate-zoom-out">

// Aplicado automaticamente em:
// - Dialog
// - AlertDialog  
// - Popover
// - DropdownMenu
```

### Animações de Cards

```tsx
// Flip in para cards (ex: deal cards no pipeline)
<Card className="animate-flip-in">...</Card>

// Shake para erros de validação
<Input className="animate-shake" />
```

### Animações de Atenção

```tsx
// Bounce padrão (contínuo)
<Bell className="animate-bounce" />

// Bounce de atenção (uma vez, mais suave)
<div className="animate-bounce-attention">...</div>

// Wiggle único (rotação ±3°)
<Icon className="animate-wiggle" />

// Wiggle contínuo (rotação ±8°) - para indicadores
<Settings className="animate-wiggle-loop" />

// Pop (scale 1 → 1.1 → 1)
<Badge className="animate-pop">Novo!</Badge>
```

### Animações de Loading

```tsx
// Shimmer (para skeletons)
<Skeleton className="animate-shimmer" />

// Pulse glow
<div className="animate-pulse-glow">...</div>

// Spin lento (3s)
<Loader className="animate-spin-slow" />

// Ping lento (2s)
<span className="animate-ping-slow" />

// Pulse ring (anel expandindo)
<div className="animate-pulse-ring" />
```

### Animações de Feedback

```tsx
// Flash verde (sucesso)
<div className="animate-flash-success">...</div>

// Flash vermelho (erro)
<div className="animate-flash-error">...</div>

// Count up (números)
<span className="animate-count-up">1.234</span>

// Float (levitação suave)
<div className="animate-float">...</div>
```

### Animações de Glow

```tsx
// Glow pulsante (para CTAs)
<Button className="animate-glow-pulse">CTA Importante</Button>

// Variantes de button com glow animado:
<Button variant="glow-pulse">Destaque</Button>
<Button variant="glow-pulse-success">Confirmar</Button>
<Button variant="glow-pulse-accent">Especial</Button>
```

### Micro-interações

```tsx
// Efeito de pressionar (scale 0.98)
<button className="press-effect">...</button>

// Press scale alternativo
<button className="press-scale">...</button>

// Bounce no clique
<button className="click-bounce">...</button>
```

### Accordion

```tsx
// Animações automáticas via Radix
<AccordionContent className="animate-accordion-down" />
// Fechando: animate-accordion-up
```

### Tabela de Referência Rápida

| Classe | Duração | Descrição |
|--------|---------|-----------|
| `animate-fade-in` | 350ms | Entrada suave com movimento |
| `animate-fade-in-up` | 500ms | Entrada mais dramática |
| `animate-fade-in-scale` | 300ms | Entrada com scale |
| `animate-slide-in` | 300ms | Slide da esquerda |
| `animate-slide-in-right` | 300ms | Slide da direita |
| `animate-slide-up` | 300ms | Slide de baixo |
| `animate-slide-down` | 300ms | Slide de cima |
| `animate-scale-in` | 350ms | Scale suave |
| `animate-bounce-in` | 500ms | Entrada com overshoot |
| `animate-zoom-in` | 200ms | Zoom para modais |
| `animate-zoom-out` | 200ms | Saída de modais |
| `animate-flip-in` | 400ms | Flip 3D para cards |
| `animate-shake` | 500ms | Shake para erros |
| `animate-wiggle` | 500ms | Rotação única |
| `animate-wiggle-loop` | 800ms | Rotação contínua |
| `animate-bounce` | ∞ | Bounce contínuo |
| `animate-bounce-attention` | 1s | Bounce suave único |
| `animate-pop` | 300ms | Pop de destaque |
| `animate-shimmer` | 1.8s | Shimmer loading |
| `animate-pulse-glow` | 2.5s | Glow pulsante |
| `animate-glow-pulse` | 2s | Glow de botão |
| `animate-float` | 3s | Levitação suave |
| `animate-spin-slow` | 3s | Rotação lenta |
| `animate-ping-slow` | 2s | Ping lento |
| `animate-pulse-ring` | 1.5s | Anel expandindo |
| `animate-flash-success` | 500ms | Flash verde |
| `animate-flash-error` | 500ms | Flash vermelho |
| `animate-count-up` | 400ms | Entrada de número |

### Keyframes Disponíveis

Todos os keyframes estão definidos em `tailwind.config.ts`:

```ts
keyframes: {
  "fade-in": { ... },
  "fade-in-up": { ... },
  "fade-in-scale": { ... },
  "slide-in": { ... },
  "slide-in-right": { ... },
  "slide-up": { ... },
  "slide-down": { ... },
  "scale-in": { ... },
  "bounce-in": { ... },
  "wiggle": { ... },
  "wiggle-loop": { ... },
  "pop": { ... },
  "float": { ... },
  "shimmer": { ... },
  "pulse-glow": { ... },
  "glow-pulse": { ... },
  "pulse-ring": { ... },
  "bounce-attention": { ... },
  "flash-success": { ... },
  "flash-error": { ... },
  "count-up": { ... },
  "spin-slow": { ... },
  "ping-slow": { ... },
  // ... e mais
}
```

### Animações em Componentes UI

Os seguintes componentes têm animações integradas automaticamente:

| Componente | Animação |
|------------|----------|
| Dialog | `animate-zoom-in` / `animate-zoom-out` |
| AlertDialog | `animate-zoom-in` / `animate-zoom-out` |
| Popover | `animate-zoom-in` + `animate-slide-down/up` |
| DropdownMenu | `animate-zoom-in` / `animate-zoom-out` |
| Accordion | `animate-accordion-down/up` |
| Input (com error) | `animate-shake` |
| FormMessage | `animate-fade-in` |
| DealCard | `animate-flip-in` |
| Skeleton | `animate-shimmer` |

### Uso em Notificações

```tsx
// Ícone de sino com alertas pendentes
<Bell className={cn(
  "h-5 w-5",
  hasAlerts && "animate-bounce text-warning"
)} />

// Badge de contagem
{hasAlerts && (
  <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-destructive animate-pulse">
    {count}
  </span>
)}

// Ícone de configurações pendentes
<Settings className={cn(
  "h-4 w-4",
  hasPendingConfig && "animate-wiggle-loop text-primary"
)} />
```

---

## Gamificação

### Animações Específicas

```tsx
// Shimmer em barra de XP
<div className="animate-xp-shimmer gradient-xp">...</div>

// Pulso de fogo (streaks)
<Icon className="animate-fire-pulse" />

// Brilho de moeda
<Icon className="animate-coin-shine" />

// Animação de level up
<div className="animate-level-up">...</div>
```

---

## Transições de Tema

As transições entre light/dark mode são suaves (250ms) para todos os elementos, exceto elementos interativos que usam 150ms para feedback mais rápido.

### Desabilitar Transições

```tsx
// Elemento sem transição
<div className="no-transition">...</div>

// Via data attribute
<div data-no-transition>...</div>
```

---

## Exemplos de Uso

### Card de Estatística

```tsx
<Card variant="elevated" className="dark:border-glow">
  <CardContent className="p-4">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg gradient-primary">
        <TrendingUp className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-muted-foreground text-sm">Vendas</p>
        <p className="text-2xl font-bold gradient-text">R$ 89.096</p>
      </div>
    </div>
  </CardContent>
</Card>
```

### Botão CTA

```tsx
<Button variant="glow" className="gap-2">
  <Plus className="h-4 w-4" />
  Nova Venda
</Button>
```

### Card Interativo

```tsx
<div className="bg-card rounded-xl p-4 border border-border/60 card-elevated hover-lift cursor-pointer dark:border-glow">
  <h3 className="font-display font-semibold">Título</h3>
  <p className="text-muted-foreground">Descrição</p>
</div>
```

### Badge de Ranking

```tsx
<div className="flex items-center gap-2">
  <div className="w-8 h-8 rounded-full rank-gold flex items-center justify-center">
    <Crown className="h-4 w-4 text-white" />
  </div>
  <span className="font-medium">1º Lugar</span>
</div>
```

---

## Componentes Atualizados

Os seguintes componentes já utilizam o design system completo:

### Dashboard Principal

| Componente | Arquivo | Melhorias |
|------------|---------|-----------|
| StatCard | `dashboard/StatCard.tsx` | Glass, gradient-primary icons, gradient-text values, shadow badges |
| KPIGrid | `dashboard/KPIGrid.tsx` | Glass container, gradient-text title, icon containers com bg-primary/10 |

### Analytics

| Componente | Arquivo | Melhorias |
|------------|---------|-----------|
| WinLossAnalysis | `analytics/WinLossAnalysis.tsx` | Summary cards com glass, gradient headers, hover-glow |
| ConversionFunnel | `analytics/ConversionFunnel.tsx` | Summary cards, gradient-text, elevated variant |
| DealVelocityChart | `analytics/DealVelocityChart.tsx` | Stats cards com glass, gradient icons |
| ObjectionsLibrary | `analytics/ObjectionsLibrary.tsx` | Card elevated, gradient header, glass items |
| ABCAnalysis | `analytics/ABCAnalysis.tsx` | Summary cards elevated, hover-lift, gradient icons |
| ClosingTimeChart | `analytics/ClosingTimeChart.tsx` | Glass summary, gradient-primary icon, tab cards elevated |
| ChurnPrediction | `analytics/ChurnPrediction.tsx` | Summary cards com hover-glow, glass client cards |

### Pipeline

| Componente | Arquivo | Melhorias |
|------------|---------|-----------|
| DealCard | `pipeline/DealCard.tsx` | Glass + hover-lift, gradient-text values, conditional badges (lead score/probability), cadence status dropdown, dark:border-glow |
| PipelineColumn | `pipeline/PipelineColumn.tsx` | Glass headers com card-elevated, gradient-primary deal count badge, gradient-text totals, empty state melhorado |
| PipelineBoard | `pipeline/PipelineBoard.tsx` | Stats bar com glass + dark:border-glow, font-display values, gradient-text total, button transitions, drag overlay shadow |
| AtRiskDealsPanel | `pipeline/AtRiskDealsPanel.tsx` | Glass panel com dark:border-glow, gradient icon container, risk badges coloridos, activity icons com tooltips, AI analysis section com gradient bg |
| DealTimeline | `pipeline/DealTimeline.tsx` | Gradient timeline dots/line, event-type badges coloridos, glass dialog, gradient icon header, empty state melhorado |

### Tarefas

| Componente | Arquivo | Melhorias |
|------------|---------|-----------|
| TaskCard | `tasks/TaskCard.tsx` | Glass + card-elevated, hover-lift, gradient-text client, font-display, styled type icons, complete button transitions |
| TaskQueue | `tasks/TaskQueue.tsx` | Glass header com dark:border-glow, gradient icon containers, hover-glow stat cards, styled empty state, drag overlay shadow |
| NextBestAction | `tasks/NextBestAction.tsx` | Glass + card-elevated, gradient-primary button, hover-lift suggestion cards, styled insight box, AI badge gradient |

### Cadências

| Componente | Arquivo | Melhorias |
|------------|---------|-----------|
| CadenceCard | `cadences/CadenceCard.tsx` | Card elevated, gradient-text name, primary badges |
| TodaysCadenceTasks | `cadences/TodaysCadenceTasks.tsx` | Gradient-primary icon, gradient-text title, glow button |

### Metas

| Componente | Arquivo | Melhorias |
|------------|---------|-----------|
| GoalsLeaderboard | `goals/GoalsLeaderboard.tsx` | Glass + card-elevated, gradient icon header, styled empty state, border-b header separator |
| CommissionCalculator | `goals/CommissionCalculator.tsx` | Glass + dark:border-glow, hover-lift stat cards com hover-glow, animate-float crown, font-display, styled empty state |
| SalespersonGoalCard | `goals/SalespersonGoalCard.tsx` | Glass + hover-lift, gradient-text, animate-fire-pulse, xp-shimmer progress, font-display, shadow badges |
| TeamGoalProgress | `goals/TeamGoalProgress.tsx` | Glass + dark:border-glow, gradient status bar, font-display 4xl values, hover-lift stat cards, styled projection bar |

### Gamificação

| Componente | Arquivo | Melhorias |
|------------|---------|-----------|
| CompetitiveLeaderboard | `gamification/CompetitiveLeaderboard.tsx` | Glass cards com hover-lift, gradient rank icons com animate-float (1º lugar), fire-pulse animation para deals, font-display, avatar borders, subtle-pulse para líder |
| LevelBadge | `gamification/LevelBadge.tsx` | Gradient badges com hover:scale, shadow transitions, glass tooltips com dark:border-glow, Star icon fill |
| XPProgressBar | `gamification/XPProgressBar.tsx` | Gradient progress bar com animate-xp-shimmer, Zap/Sparkles icons, hover indicator dot, glass tooltips, font-display |
| SalespersonLevelBadge | `gamification/SalespersonLevelBadge.tsx` | Gradient badges, shadow transitions, Star icons, glass tooltips com dark:border-glow |
| CompetitiveStatusBar | `gamification/CompetitiveStatusBar.tsx` | Glass + card-elevated, gradient rank icons, styled stat boxes, hover-lift, dark:border-glow, button transitions |

### SDR Dashboard

| Componente | Arquivo | Melhorias |
|------------|---------|-----------|
| SDRStatCard | `sdr/SDRStatCard.tsx` | Glass, gradient-text values, gradient-primary icons |
| TopSDRsRanking | `sdr/TopSDRsRanking.tsx` | Card elevated, gradient headers, avatar fallbacks |

### Closer Dashboard

| Componente | Arquivo | Melhorias |
|------------|---------|-----------|
| CloserStatCard | `closer/CloserStatCard.tsx` | Glass, gradient-text values, gradient-primary icons |
| TopClosersRanking | `closer/TopClosersRanking.tsx` | Card elevated, gradient headers, avatar fallbacks |

### Páginas

| Componente | Arquivo | Melhorias |
|------------|---------|-----------|
| Relatorios | `pages/Relatorios.tsx` | Metric cards com glass, gradient icons |
| Analytics | `pages/Analytics.tsx` | Header com gradient-primary icon, gradient-text |

---

## Padrões de Componentes

### Summary Cards (3 colunas)

```tsx
<div className="grid grid-cols-3 gap-4">
  {/* Card Primário */}
  <div className="glass rounded-xl p-4 text-center border border-primary/30 hover-lift cursor-pointer hover-glow-primary">
    <div className="p-2 rounded-lg gradient-primary w-fit mx-auto mb-2">
      <Icon className="h-4 w-4 text-white" />
    </div>
    <p className="text-xl font-bold gradient-text">Valor</p>
    <p className="text-xs text-muted-foreground uppercase tracking-wider">Label</p>
  </div>
  
  {/* Card Success */}
  <div className="glass rounded-xl p-4 text-center border border-status-success/30 hover-lift cursor-pointer hover-glow-success">
    <div className="p-2 rounded-lg bg-status-success/20 w-fit mx-auto mb-2">
      <Icon className="h-4 w-4 text-status-success" />
    </div>
    <p className="text-xl font-bold text-status-success">Valor</p>
    <p className="text-xs text-muted-foreground uppercase tracking-wider">Label</p>
  </div>
  
  {/* Card Error */}
  <div className="glass rounded-xl p-4 text-center border border-destructive/30 hover-lift cursor-pointer hover-glow-error">
    <div className="p-2 rounded-lg bg-destructive/20 w-fit mx-auto mb-2">
      <Icon className="h-4 w-4 text-destructive" />
    </div>
    <p className="text-xl font-bold text-destructive">Valor</p>
    <p className="text-xs text-muted-foreground uppercase tracking-wider">Label</p>
  </div>
</div>
```

### Card Header com Ícone

```tsx
<CardHeader>
  <CardTitle className="text-lg flex items-center gap-2">
    <div className="p-2 rounded-lg gradient-primary">
      <Icon className="h-4 w-4 text-white" />
    </div>
    <span className="gradient-text">Título do Card</span>
  </CardTitle>
</CardHeader>
```

### Metric Card

```tsx
<div className="glass rounded-xl p-5 border border-border/40 dark:border-glow hover-lift cursor-pointer group">
  <div className="flex items-center justify-between mb-3">
    <div className="p-2.5 rounded-xl gradient-primary group-hover:scale-110 transition-transform">
      <Icon className="h-4 w-4 text-white" />
    </div>
    <span className="text-sm font-medium flex items-center gap-1 px-2 py-1 rounded-full bg-status-success/20 text-status-success">
      <TrendingUp className="h-3 w-3" />
      +12.5%
    </span>
  </div>
  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Label</p>
  <p className="text-2xl font-bold gradient-text">R$ 107.895</p>
</div>
```

---

## Regras Importantes

1. **NUNCA use cores diretas** como `text-white`, `bg-black`, `text-gray-500`
2. **SEMPRE use tokens semânticos** como `text-foreground`, `bg-card`, `text-muted-foreground`
3. **Cards importantes** devem usar `variant="elevated"` ou classes `card-elevated`
4. **CTAs principais** devem usar `variant="glow"`
5. **Botões de salvar/confirmar** devem usar `variant="glow-success"`
6. **Headers** automaticamente usam `font-display` (Space Grotesk)
7. **Dark mode** adicione `dark:border-glow` em cards importantes para efeito sutil
8. **Labels** devem usar `uppercase tracking-wider` para consistência
9. **Icon containers** devem ter `p-2 rounded-lg` com background apropriado
10. **Interatividade** combine `hover-lift cursor-pointer` para elementos clicáveis

---

## Changelog - Sessão de Melhorias (Dezembro 2024)

### Resumo Executivo

Esta sessão implementou melhorias significativas no design system do SalesPro, focando em:
- **Profundidade e contraste** no light mode
- **Refinamento de bordas/glows** no dark mode
- **Tipografia consistente** com font-display
- **Transições de tema suaves**
- **Micro-interações polidas**
- **Focus states elegantes**

---

### 1. Melhorias no Light Mode

#### Problema Identificado
Cards muito planos, falta de profundidade e contraste insuficiente.

#### Soluções Implementadas

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Sombras** | Simples, 2 camadas | Multi-camada (3 níveis) com mais profundidade |
| **Bordas** | `border-border` básico | `border-border/80` com melhor definição |
| **Texto secundário** | `muted-foreground: 40%` lightness | `muted-foreground: 35%` (mais contraste) |
| **Cards** | Flat | Inset highlights para efeito 3D |

```css
/* Novas sombras light mode */
--card-shadow: 
  0 1px 2px 0 hsl(220 30% 30% / 0.04),
  0 2px 4px 0 hsl(220 30% 30% / 0.04),
  0 4px 8px -2px hsl(220 30% 30% / 0.06);

/* Card depth com inset */
box-shadow: 
  0 1px 2px 0 hsl(220 30% 30% / 0.04),
  0 3px 10px -3px hsl(220 30% 30% / 0.08),
  inset 0 1px 0 0 hsl(0 0% 100% / 0.7);
```

---

### 2. Melhorias no Dark Mode

#### Refinamentos

| Aspecto | Mudança |
|---------|---------|
| **Bordas** | Glow sutil com gradiente primário/secundário |
| **Border glow** | Opacity 0.8 → 1.0 no hover (transição suave) |
| **Card hover** | Toque de `primary/0.1` no box-shadow |
| **Muted foreground** | Aumentado para 65% lightness (melhor legibilidade) |

```css
/* Border glow refinado */
.dark .border-glow::after {
  background: linear-gradient(
    135deg,
    hsl(var(--primary) / 0.2) 0%,
    transparent 40%,
    transparent 60%,
    hsl(var(--secondary) / 0.15) 100%
  );
  opacity: 0.8;
  transition: opacity 0.3s ease;
}
.dark .border-glow:hover::after {
  opacity: 1;
}
```

---

### 3. Tipografia Consistente

#### Headers com Font-Display

```css
/* Aplicação automática */
h1, h2, h3, h4, .font-display {
  font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
  font-weight: 600;
  letter-spacing: -0.02em;
}

/* Hierarquia */
h1: text-3xl/4xl, font-bold, letter-spacing: -0.03em
h2: text-2xl/3xl, font-semibold, letter-spacing: -0.025em
h3: text-xl/2xl, font-semibold, letter-spacing: -0.02em
h4: text-lg/xl, font-medium, letter-spacing: -0.015em
```

---

### 4. Transições de Tema

#### Melhorias

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Duração** | 250ms | 300ms (mais suave) |
| **Propriedades** | Básicas | + `filter` para efeitos |
| **Timing** | ease-out | `cubic-bezier(0.4, 0, 0.2, 1)` |
| **Acessibilidade** | N/A | `prefers-reduced-motion` respeitado |

```css
/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### 5. Focus States Elegantes

#### Melhorias

| Elemento | Focus State |
|----------|-------------|
| **Geral** | `ring-2 ring-primary/50` + transição suave |
| **Botões** | Ring + glow sutil (`box-shadow: 0 0 0 4px primary/0.15`) |
| **Inputs** | Ring + border-primary/60 + glow externo |
| **Links** | Ring com `rounded-sm` |
| **Animado** | Pulse animation mais elegante (2s) |

```css
/* Focus ring animado */
@keyframes focus-ring-pulse {
  0%, 100% { 
    box-shadow: 0 0 0 2px hsl(var(--primary) / 0.5),
                0 0 8px 2px hsl(var(--primary) / 0.15); 
  }
  50% { 
    box-shadow: 0 0 0 3px hsl(var(--primary) / 0.4),
                0 0 12px 4px hsl(var(--primary) / 0.25); 
  }
}
```

---

### 6. Micro-interações Polidas

#### Novas Classes

| Classe | Descrição |
|--------|-----------|
| `card-interactive` | Hover com sombra e borda refinada por modo |
| `animate-subtle-pulse` | Pulse sutil para chamar atenção (2.5s) |
| `animate-fade-in-scale` | Fade + scale combinados |
| `animate-slide-in-right` | Slide da direita |
| `animate-float` | Flutuação suave (3s) |

#### Click Bounce Refinado

```css
@keyframes click-bounce {
  0% { transform: scale(1); }
  40% { transform: scale(0.96); }
  70% { transform: scale(1.02); }
  100% { transform: scale(1); }
}
```

---

### 7. Glass Morphism Aprimorado

#### Diferenças por Modo

| Modo | Background | Border | Shadow |
|------|------------|--------|--------|
| **Light** | `card/0.9` | `border/0.8` | Inset branco (50% opacity) |
| **Dark** | `card/0.75` | Branco 10% | Inset branco (4% opacity) |

```css
:root .glass {
  background: hsl(var(--card) / 0.9);
  border-color: hsl(var(--border) / 0.8);
  box-shadow: 
    0 1px 2px 0 hsl(220 30% 30% / 0.03),
    inset 0 1px 0 0 hsl(0 0% 100% / 0.5);
}
```

---

### 8. Novas Animações (tailwind.config.ts)

```ts
keyframes: {
  "fade-in-scale": {
    "0%": { opacity: "0", transform: "scale(0.96)" },
    "100%": { opacity: "1", transform: "scale(1)" },
  },
  "slide-in-right": {
    "0%": { opacity: "0", transform: "translateX(10px)" },
    "100%": { opacity: "1", transform: "translateX(0)" },
  },
  "float": {
    "0%, 100%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-4px)" },
  },
}

animation: {
  "fade-in-scale": "fade-in-scale 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "float": "float 3s ease-in-out infinite",
}
```

---

### 9. Tokens de Cor Ajustados

| Token | Light Mode | Dark Mode | Mudança |
|-------|------------|-----------|---------|
| `--foreground` | `225 30% 10%` | `0 0% 98%` | Mais escuro no light |
| `--muted-foreground` | `220 20% 35%` | `225 15% 65%` | Melhor contraste |
| `--border` | `220 20% 85%` | `225 25% 20%` | Mais definido |
| `--success` | `142 70% 35%` | `142 70% 50%` | Mais escuro no light |

---

### Componentes Atualizados (27+)

#### Atividades (3 componentes)
- `ActivityGoalCard` - Glass progress section, staggered activity animations, group hover states
- `ActivityStats` - Staggered card entry, hover-glow primary, group icon scale
- `DailyActivityRanking` - Gradient icon header, staggered ranking entry, group hover states
- `StatCard` - Glass, gradient icons, shadow badges
- `KPIGrid` - Glass container, gradient-text title

#### Analytics (7 componentes)
- `WinLossAnalysis`, `ConversionFunnel`, `DealVelocityChart`
- `ObjectionsLibrary`, `ABCAnalysis`, `ClosingTimeChart`, `ChurnPrediction`

#### Pipeline (5 componentes)
- `DealCard` - Glass + hover-lift, conditional badges, cadence dropdown
- `PipelineColumn` - Glass headers, gradient deal count badge
- `PipelineBoard` - Stats bar glass, drag overlay shadow
- `AtRiskDealsPanel` - Risk badges, activity tooltips, AI analysis section
- `DealTimeline` - Gradient timeline, event-type badges, glass dialog

#### Tarefas (3 componentes)
- `TaskCard` - Glass, hover-lift, gradient-text
- `TaskQueue` - Glass header, hover-glow stat cards
- `NextBestAction` - Glass + gradient, hover-lift suggestions

#### Cadências (2 componentes)
- `CadenceCard` - Glass + hover-lift/hover-glow, gradient icon header, staggered step animations, group hover states
- `TodaysCadenceTasks` - Animated loading skeletons, conditional pulse badge, staggered task entry, gradient client names

#### Metas (4 componentes)
- `GoalsLeaderboard` - Glass, gradient icon header
- `CommissionCalculator` - Hover-lift cards, animate-float crown
- `SalespersonGoalCard` - Fire-pulse, xp-shimmer progress
- `TeamGoalProgress` - Gradient status bar, hover-lift stats

#### Gamificação (5 componentes)
- `CompetitiveLeaderboard` - Hover-lift, animate-float/subtle-pulse
- `LevelBadge` - Gradient badges, hover:scale, glass tooltips
- `XPProgressBar` - Shimmer progress, icon indicators
- `SalespersonLevelBadge` - Star icons, shadow transitions
- `CompetitiveStatusBar` - Styled stat boxes, gradient icons

#### SDR/Closer Dashboards (8 componentes)
- `SDRStatCard` - Group hover scale, gradient icon variants, font-display titles
- `ProspectingFunnel` - Gradient header, staggered bar animations, glow effects on bars
- `LeadTemperatureChart` - Gradient header, legend hover states, pie cell shadows
- `TopSDRsRanking` - Staggered entry, group hover states, gradient rank badges
- `CloserStatCard` - Group hover scale, gradient icon variants, font-display titles
- `CloserPipeline` - Gradient header, staggered bar animations, glow effects
- `RecentClosedDeals` - Glass cards, staggered entry, success hover borders
- `TopClosersRanking` - Staggered entry, group hover states, gradient rank badges

#### Páginas (2 componentes)
- `Relatorios`, `Analytics`

---

### Resultados Visuais

✅ **Light Mode**: Cards com profundidade real, sombras multicamadas, contraste de texto melhorado  
✅ **Dark Mode**: Bordas com glow refinado, transições suaves, hover states polidos  
✅ **Tipografia**: Headers consistentes com Space Grotesk e letter-spacing negativo  
✅ **Transições**: 300ms com cubic-bezier para fluidez  
✅ **Focus States**: Rings elegantes com glow sutil  
✅ **Acessibilidade**: `prefers-reduced-motion` suportado

---

*Última atualização: Dezembro 2024*
