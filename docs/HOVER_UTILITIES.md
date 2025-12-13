# Hover Utilities - Design System

Este documento descreve todas as classes utilitárias de hover disponíveis no design system.

## Visão Geral

### Classes de Escala e Elevação

| Classe | Escala | Shadow | Translate | Uso Recomendado |
|--------|--------|--------|-----------|-----------------|
| `hover-scale-sm` | 102% | `shadow-md` | - | Cards pequenos, itens de lista |
| `hover-scale` | 105% | `shadow-lg` | - | Botões, badges, elementos médios |
| `hover-scale-lg` | 110% | `shadow-xl` | - | Cards destacados, CTAs |
| `hover-lift` | 102% | `shadow-lg` | `-0.5` | Cards principais, destaque com elevação |

### Classes de Glow (Brilho)

| Classe | Cor | Intensidade | Uso Recomendado |
|--------|-----|-------------|-----------------|
| `hover-glow` | Primary (laranja) | Média | CTAs principais, destaques |
| `hover-glow-secondary` | Secondary (azul) | Média | Elementos secundários |
| `hover-glow-success` | Success (verde) | Média | Ações de sucesso, confirmação |
| `hover-glow-accent` | Accent (roxo) | Média | Elementos especiais |
| `hover-glow-gold` | Gold (dourado) | Alta | Rankings, conquistas, prêmios |
| `hover-border-glow` | Primary | Sutil | Borda com glow suave |

### Button Glow Variants

O componente Button inclui variantes com glow integrado:

| Variant | Cor | Descrição |
|---------|-----|-----------|
| `glow` | Primary (laranja) | CTA principal com glow |
| `glow-secondary` | Secondary (azul) | CTA secundário com glow |
| `glow-success` | Success (verde) | Ações de confirmação |
| `glow-accent` | Accent (roxo) | Elementos especiais |
| `hover-scale-sm` | 102% | `shadow-md` | - | Cards pequenos, itens de lista |
| `hover-scale` | 105% | `shadow-lg` | - | Botões, badges, elementos médios |
| `hover-scale-lg` | 110% | `shadow-xl` | - | Cards destacados, CTAs |
| `hover-lift` | 102% | `shadow-lg` | `-0.5` | Cards principais, destaque com elevação |

---

## Classes Detalhadas

### `hover-scale-sm`
Efeito sutil para elementos menores ou quando você quer uma interação discreta.

```css
.hover-scale-sm {
  @apply transition-all duration-200 hover:scale-102 active:scale-98;
  @apply hover:shadow-md hover:shadow-primary/5;
}
```

**Uso:**
```tsx
<div className="hover-scale-sm">Item de lista</div>
```

---

### `hover-scale`
Efeito padrão de hover com escala moderada. Ideal para botões e elementos de ação.

```css
.hover-scale {
  @apply transition-all duration-200 hover:scale-105 active:scale-95;
  @apply hover:shadow-lg hover:shadow-primary/5;
}
```

**Uso:**
```tsx
<Button className="hover-scale">Clique aqui</Button>
```

---

### `hover-scale-lg`
Efeito mais pronunciado para elementos que precisam de destaque máximo.

```css
.hover-scale-lg {
  @apply transition-all duration-200 hover:scale-110 active:scale-95;
  @apply hover:shadow-xl hover:shadow-primary/10;
}
```

**Uso:**
```tsx
<Card className="hover-scale-lg">Card em destaque</Card>
```

---

### `hover-lift` ⭐ Recomendado
Combina escala, elevação (translate-y) e shadow para criar um efeito de "levantamento" do elemento. **Ideal para cards principais.**

```css
.hover-lift {
  @apply transition-all duration-200;
  @apply hover:scale-102 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10;
  @apply active:scale-98 active:translate-y-0;
}
```

**Uso:**
```tsx
<Card className="hover-lift cursor-pointer">
  Card com efeito de elevação
</Card>
```

---

## Componentes que usam `hover-lift`

Os seguintes componentes já utilizam a classe `hover-lift`:

- `StatCard` - Cards de KPIs do dashboard
- `SDRStatCard` - Cards de métricas SDR
- `CloserStatCard` - Cards de métricas Closer
- `SalespersonGoalCard` - Cards de metas de vendedores
- `DealCard` - Cards de deals no pipeline Kanban
- `ActivityGoalCard` - Cards de metas de atividades
- `CompetitiveLeaderboard` - Itens do ranking competitivo
- `TopSDRsRanking` - Itens do ranking SDR
- `TopClosersRanking` - Itens do ranking Closer
- `CadenceCard` - Cards de cadências
- `TaskCard` - Cards de tarefas
- `DraggableTaskCard` - Cards de tarefas arrastáveis

---

## Combinações Comuns

### Card Interativo Completo
```tsx
<Card className="glass border-border/40 hover-lift cursor-pointer">
  {/* conteúdo */}
</Card>
```

### Card com Variante de Destaque
```tsx
<div className="glass rounded-xl p-5 hover-lift cursor-pointer gradient-border glow-primary">
  {/* conteúdo destacado */}
</div>
```

### Item de Lista Interativo
```tsx
<div className="p-3 rounded-lg bg-muted/30 hover-lift cursor-pointer">
  {/* item */}
</div>
```

---

## Classes Complementares

Use em conjunto com as classes de hover:

| Classe | Descrição |
|--------|-----------|
| `glass` | Background com blur e transparência |
| `glass-hover` | Hover adicional para elementos glass |
| `gradient-border` | Borda com gradiente |
| `glow-primary` | Glow laranja/rosa |
| `glow-secondary` | Glow azul/roxo |
| `glow-success` | Glow verde |

---

## Boas Práticas

1. **Sempre adicione `cursor-pointer`** em elementos clicáveis
2. **Use `hover-lift`** como padrão para cards principais
3. **Use `hover-scale-sm`** para itens menores em listas
4. **Combine com `glass`** para efeito glassmorphism
5. **Não misture** múltiplas classes de hover no mesmo elemento
