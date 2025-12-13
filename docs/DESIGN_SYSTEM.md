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

### Animações de Entrada

```tsx
// Fade in com movimento para cima
<div className="animate-fade-in">...</div>

// Fade in mais pronunciado
<div className="animate-fade-in-up">...</div>

// Slide da esquerda
<div className="animate-slide-in">...</div>

// Scale in
<div className="animate-scale-in">...</div>
```

### Micro-interações

```tsx
// Efeito de pressionar
<button className="press-effect">...</button>

// Bounce no clique
<button className="click-bounce">...</button>
```

### Shimmer (Loading)

```tsx
// Shimmer para skeletons
<div className="animate-shimmer">...</div>

// Pulse glow
<div className="animate-pulse-glow">...</div>
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
| DealCard | `pipeline/DealCard.tsx` | Glass effect, gradient-text values, primary badges |
| PipelineColumn | `pipeline/PipelineColumn.tsx` | Glass headers, gradient-text totals, primary badges |
| AtRiskDealsPanel | `pipeline/AtRiskDealsPanel.tsx` | Card elevated, icon containers |

### Tarefas

| Componente | Arquivo | Melhorias |
|------------|---------|-----------|
| TaskCard | `tasks/TaskCard.tsx` | Card elevated, hover-lift |

### Cadências

| Componente | Arquivo | Melhorias |
|------------|---------|-----------|
| CadenceCard | `cadences/CadenceCard.tsx` | Card elevated, gradient-text name, primary badges |
| TodaysCadenceTasks | `cadences/TodaysCadenceTasks.tsx` | Gradient-primary icon, gradient-text title, glow button |

### Metas

| Componente | Arquivo | Melhorias |
|------------|---------|-----------|
| SalespersonGoalCard | `goals/SalespersonGoalCard.tsx` | Glass effect, gradient-text name, gradient badges |
| TeamGoalProgress | `goals/TeamGoalProgress.tsx` | Card elevated, gradient header, gradient-text values |

### Gamificação

| Componente | Arquivo | Melhorias |
|------------|---------|-----------|
| CompetitiveLeaderboard | `gamification/CompetitiveLeaderboard.tsx` | Glass cards, gradient headers, avatar fallbacks |
| LevelBadge | `gamification/LevelBadge.tsx` | Shadow badges, glass tooltips, gradient-text |

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
