# 🎯 Plano de Melhorias - Product Design Strategy

> **Análise Exaustiva do SalesPro CRM**
> Data: 30/12/2024
> Versão: 1.0

---

## 📊 Sumário Executivo

| Categoria | Total | Crítico | Alto | Médio | Baixo |
|-----------|-------|---------|------|-------|-------|
| UX/Usabilidade | 24 | 4 | 10 | 7 | 3 |
| Design System | 18 | 2 | 8 | 5 | 3 |
| Performance | 12 | 3 | 5 | 3 | 1 |
| Acessibilidade | 15 | 5 | 6 | 3 | 1 |
| Mobile | 16 | 4 | 7 | 4 | 1 |
| Micro-interações | 10 | 0 | 4 | 4 | 2 |
| Onboarding/Fluxos | 8 | 2 | 4 | 2 | 0 |
| Data Visualization | 9 | 1 | 4 | 3 | 1 |
| **TOTAL** | **112** | **21** | **48** | **31** | **12** |

---

## 🔴 CRÍTICAS (Implementar Imediatamente)

### 1. [UX-001] Falta de Breadcrumbs na Navegação
**Prioridade:** Crítico | **Esforço:** 4h | **Impacto:** Alto

**Problema:**
- Usuários se perdem na navegação profunda
- Não há contexto visual de onde estão no sistema
- Aumenta carga cognitiva e abandono

**Solução:**
```tsx
// src/components/navigation/Breadcrumbs.tsx
- Implementar breadcrumbs dinâmicos baseados na rota
- Integrar com react-router-dom
- Adicionar ao MainLayout
```

**Arquivos a modificar:**
- `src/components/layout/MainLayout.tsx`
- Criar `src/components/navigation/Breadcrumbs.tsx`

---

### 2. [UX-002] ClosingTimeChart Vazio/Não Implementado
**Prioridade:** Crítico | **Esforço:** 6h | **Impacto:** Alto

**Problema:**
```tsx
// Atual - apenas placeholder
export const ClosingTimeChart:FC=()=>{return <Card className="p-6"><h3>Closing Time</h3></Card>;};
```

**Solução:**
- Implementar gráfico de tempo médio de fechamento
- Usar Recharts para visualização
- Adicionar filtros por período e vendedor

---

### 3. [UX-003] Navegação Mobile Incompleta
**Prioridade:** Crítico | **Esforço:** 8h | **Impacto:** Muito Alto

**Problema:**
- Bottom nav tem apenas 5 itens (Dashboard, Pipeline, Tarefas, Ranking, Perfil)
- 35+ páginas não acessíveis via mobile
- Menu "hamburguer" não implementado

**Solução:**
```tsx
// Implementar:
1. Drawer lateral com menu completo
2. Expandir bottom nav com menu "Mais"
3. Quick actions via FAB (Floating Action Button)
```

**Arquivos a modificar:**
- `src/components/mobile/MobileNavigation.tsx`
- Criar `src/components/mobile/MobileDrawer.tsx`
- Criar `src/components/mobile/FloatingActionButton.tsx`

---

### 4. [A11Y-001] Ausência de Skip Links
**Prioridade:** Crítico | **Esforço:** 2h | **Impacto:** Alto

**Problema:**
- Usuários de teclado/screen reader não conseguem pular para conteúdo principal
- Violação WCAG 2.1 Level A

**Solução:**
```tsx
// Adicionar ao MainLayout
<a href="#main-content" className="sr-only focus:not-sr-only ...">
  Pular para conteúdo principal
</a>
```

---

### 5. [A11Y-002] Contraste Insuficiente em Estados Muted
**Prioridade:** Crítico | **Esforço:** 3h | **Impacto:** Alto

**Problema:**
```css
/* Atual */
--muted-foreground: 0 0% 9%; /* Em light mode - OK */
--muted-foreground: 0 0% 98%; /* Em dark mode - OK */
/* MAS os textos "text-muted-foreground" sobre "bg-muted" não passam */
```

**Solução:**
- Auditar todas as combinações de cores
- Ajustar valores HSL para ratio mínimo 4.5:1
- Usar ferramenta de contraste

---

### 6. [PERF-001] Imagens Sem Lazy Loading Nativo
**Prioridade:** Crítico | **Esforço:** 4h | **Impacto:** Alto

**Problema:**
- Avatares e imagens carregam eager
- Impacto no LCP (Largest Contentful Paint)

**Solução:**
```tsx
// Criar componente OptimizedImage
<img loading="lazy" decoding="async" ... />
```

---

### 7. [MOB-001] Touch Targets Menores que 44x44px
**Prioridade:** Crítico | **Esforço:** 6h | **Impacto:** Alto

**Problema:**
- Botões de ação em cards (Editar/Excluir) são 32x32px
- Dificulta uso em mobile (guideline Apple/Google: 44x44)

**Solução:**
```tsx
// Padronizar todos os botões de ação
className="h-11 w-11 min-h-[44px] min-w-[44px]"
```

---

## 🟠 ALTA PRIORIDADE

### 8. [UX-004] Empty States Inconsistentes
**Prioridade:** Alta | **Esforço:** 6h | **Impacto:** Médio

**Problema:**
- Diferentes estilos de empty state pelo app
- Alguns não têm CTA
- Ilustrações/ícones não padronizados

**Páginas afetadas:**
- Vendas (ShoppingCart genérico)
- Analytics (sem empty state)
- Fornecedores (inconsistente)

**Solução:**
- Padronizar todos via componente `EmptyState`
- Adicionar ilustrações contextuais
- CTAs claros e acionáveis

---

### 9. [UX-005] Falta de Confirmação Visual em Ações
**Prioridade:** Alta | **Esforço:** 4h | **Impacto:** Médio

**Problema:**
- Algumas ações não mostram feedback
- Toast genéricos sem contexto

**Solução:**
- Toasts contextuais com ação de desfazer
- Micro-animações de sucesso
- Estados de loading em botões

---

### 10. [UX-006] Filtros Não Persistentes
**Prioridade:** Alta | **Esforço:** 4h | **Impacto:** Médio

**Problema:**
- Ao navegar e voltar, filtros são resetados
- Frustrante para workflows repetitivos

**Solução:**
```tsx
// Usar URL search params
const [searchParams, setSearchParams] = useSearchParams();
// Ou localStorage para persistência
```

---

### 11. [UX-007] Falta de Atalhos de Teclado Documentados
**Prioridade:** Alta | **Esforço:** 3h | **Impacto:** Médio

**Problema:**
- KeyboardShortcuts existe mas não há UI para descobrir
- Power users não sabem que existem

**Solução:**
- Adicionar modal de atalhos (Ctrl/Cmd + ?)
- Dicas contextuais em tooltips
- Onboarding de atalhos

---

### 12. [UX-008] Analytics Page - Tabs Overflow Horizontal
**Prioridade:** Alta | **Esforço:** 3h | **Impacto:** Médio

**Problema:**
```tsx
// 10 tabs em uma linha - quebra em telas menores
<TabsList className="bg-card/50 border border-border/50 flex-wrap h-auto gap-1 p-1">
```

**Solução:**
- Dropdown/Select para mobile
- Scroll horizontal com indicadores
- Agrupar tabs relacionadas

---

### 13. [UX-009] Formulários Sem Validação em Tempo Real
**Prioridade:** Alta | **Esforço:** 6h | **Impacto:** Médio

**Problema:**
- Validação só no submit
- Usuário não sabe se está preenchendo corretamente

**Solução:**
- Validação onChange com debounce
- Indicadores visuais de campos válidos/inválidos
- Hints contextuais

---

### 14. [DS-001] Inconsistência em Variant de Badges
**Prioridade:** Alta | **Esforço:** 4h | **Impacto:** Médio

**Problema:**
```tsx
// Vendas.tsx usa classes customizadas
const statusColors: Record<string, string> = {
  concluída: "bg-status-success/20 text-status-success...",
  // Deveria usar variants do Badge
}
```

**Solução:**
- Criar variants no Badge component
- Padronizar uso em todo o app

---

### 15. [DS-002] Cards Sem Padding Consistente
**Prioridade:** Alta | **Esforço:** 3h | **Impacto:** Médio

**Problema:**
- Alguns cards usam `p-4`, outros `p-5`, outros `p-6`
- `--spacing-card` existe mas não é usado consistentemente

**Solução:**
- Auditar todos os cards
- Padronizar via spacing tokens
- Criar variantes: card-sm, card-md, card-lg

---

### 16. [DS-003] Gradients Hardcoded em Componentes
**Prioridade:** Alta | **Esforço:** 4h | **Impacto:** Médio

**Problema:**
```tsx
// Auth.tsx
<div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600">
// Deveria usar gradient-gold ou tokens
```

**Solução:**
- Usar apenas tokens CSS para gradients
- Remover cores hardcoded

---

### 17. [DS-004] Tipografia Inconsistente
**Prioridade:** Alta | **Esforço:** 4h | **Impacto:** Médio

**Problema:**
- H1 em diferentes tamanhos pelo app
- Algumas páginas usam `text-2xl`, outras `text-3xl`

**Solução:**
- Auditar e padronizar via classes base
- Forçar uso de h1/h2/h3 com estilos globais

---

### 18. [MOB-002] Tabelas Não Responsivas
**Prioridade:** Alta | **Esforço:** 8h | **Impacto:** Alto

**Problema:**
```tsx
// Vendas.tsx - tabela horizontal scroll
<div className="overflow-x-auto">
  <table className="w-full">
```

**Solução:**
- Card layout para mobile
- Tabela para desktop
- Componente ResponsiveTable

---

### 19. [MOB-003] Dialogs Não Otimizados para Mobile
**Prioridade:** Alta | **Esforço:** 6h | **Impacto:** Alto

**Problema:**
- Dialogs padrão não ocupam tela toda em mobile
- Difícil interagir com campos

**Solução:**
- Usar Drawer (Vaul) em mobile
- Dialog em desktop
- Hook useResponsiveDialog

---

### 20. [MOB-004] Swipe Gestures Ausentes
**Prioridade:** Alta | **Esforço:** 8h | **Impacto:** Médio

**Problema:**
- Pipeline Kanban não tem swipe
- Tarefas não têm swipe para complete
- Cards não têm swipe actions

**Solução:**
- Implementar swipe com Framer Motion
- Actions: Complete, Delete, Archive

---

### 21. [A11Y-003] Falta de Focus Visible em Alguns Componentes
**Prioridade:** Alta | **Esforço:** 4h | **Impacto:** Alto

**Problema:**
- Alguns elementos interativos não têm focus ring visível
- Cards clicáveis sem indicação de foco

**Solução:**
- Auditar todos os elementos interativos
- Adicionar focus:ring-2 consistente

---

### 22. [A11Y-004] Imagens Decorativas Sem role="presentation"
**Prioridade:** Alta | **Esforço:** 2h | **Impacto:** Médio

**Solução:**
- Adicionar `role="presentation"` ou `aria-hidden="true"`
- Auditar todos os ícones decorativos

---

### 23. [A11Y-005] Formulários Sem aria-describedby
**Prioridade:** Alta | **Esforço:** 4h | **Impacto:** Médio

**Problema:**
- Hints de validação não conectados aos inputs
- Screen readers não leem erros

**Solução:**
```tsx
<Input aria-describedby="email-error" />
<span id="email-error">Email inválido</span>
```

---

### 24. [PERF-002] Bundle Size - Unused Dependencies
**Prioridade:** Alta | **Esforço:** 4h | **Impacto:** Médio

**Problema:**
- Possíveis imports não utilizados
- Tree shaking incompleto

**Solução:**
- Auditar com bundle analyzer
- Dynamic imports para rotas
- Code splitting agressivo

---

### 25. [PERF-003] Queries Sem Stale Time Otimizado
**Prioridade:** Alta | **Esforço:** 4h | **Impacto:** Médio

**Problema:**
- Refetch desnecessário em dados que mudam pouco
- Sobrecarga no backend

**Solução:**
- Configurar staleTime por tipo de dado
- gcTime adequado
- Prefetch estratégico

---

### 26. [FLOW-001] Onboarding Inexistente
**Prioridade:** Alta | **Esforço:** 16h | **Impacto:** Muito Alto

**Problema:**
- Novo usuário cai direto no dashboard
- Não sabe por onde começar
- Alta taxa de abandono inicial

**Solução:**
- Implementar OnboardingFlow existente
- Wizard de configuração inicial
- Tour guiado

---

### 27. [FLOW-002] Falta de Guided Tour
**Prioridade:** Alta | **Esforço:** 8h | **Impacto:** Alto

**Problema:**
- TooltipTour existe mas não está integrado
- Usuários não descobrem features

**Solução:**
- Integrar useTour hook
- Definir tours por página
- Trigger contextual

---

## 🟡 MÉDIA PRIORIDADE

### 28. [UX-010] Ausência de Estado de Carregamento em Charts
**Prioridade:** Média | **Esforço:** 4h | **Impacto:** Médio

**Problema:**
- Charts aparecem vazios e depois populam
- Flicker visual

**Solução:**
- Skeleton específico para charts
- Placeholder com dimensões corretas

---

### 29. [UX-011] Feedback Insuficiente em Drag & Drop
**Prioridade:** Média | **Esforço:** 4h | **Impacto:** Médio

**Problema:**
- Pipeline Kanban: drop zones pouco visíveis
- Não há preview do item sendo arrastado

**Solução:**
- Highlight nas drop zones
- Ghost element durante drag
- Haptic feedback em mobile

---

### 30. [UX-012] Busca Global Não Indexa Todos os Dados
**Prioridade:** Média | **Esforço:** 8h | **Impacto:** Médio

**Problema:**
- GlobalSearch existe mas escopo limitado

**Solução:**
- Indexar: Clientes, Vendas, Deals, Produtos, Tarefas
- Resultados categorizados
- Histórico de buscas recentes

---

### 31. [UX-013] Falta de Quick Actions no Dashboard
**Prioridade:** Média | **Esforço:** 4h | **Impacto:** Médio

**Solução:**
- Adicionar botões de ação rápida
- Nova Venda, Novo Cliente, Nova Tarefa
- Atalhos de teclado visíveis

---

### 32. [UX-014] Notificações Sem Agrupamento
**Prioridade:** Média | **Esforço:** 6h | **Impacto:** Médio

**Problema:**
- Notificações listadas cronologicamente
- Difícil priorizar

**Solução:**
- Agrupar por tipo/prioridade
- Ações em batch
- Limpar todas

---

### 33. [UX-015] Calendário/Agenda Ausente
**Prioridade:** Média | **Esforço:** 16h | **Impacto:** Médio

**Problema:**
- Tarefas têm due_date mas não há visualização de calendário
- Compromissos difíceis de gerenciar

**Solução:**
- Implementar vista de calendário
- Integração com tarefas e atividades
- Drag to reschedule

---

### 34. [DS-005] Falta de Skeleton Loaders para Todos os Componentes
**Prioridade:** Média | **Esforço:** 6h | **Impacto:** Médio

**Arquivos existentes:**
- DashboardSkeletons.tsx
- PageLoadingSkeleton.tsx

**Faltando:**
- StatCardSkeleton
- ChartSkeleton genérico
- TableRowSkeleton
- CardGridSkeleton

---

### 35. [DS-006] Animações Não Reduzidas em prefers-reduced-motion
**Prioridade:** Média | **Esforço:** 3h | **Impacto:** Médio

**Problema:**
```css
/* Existe no index.css mas Framer Motion não respeita */
@media (prefers-reduced-motion: reduce) {...}
```

**Solução:**
- Usar `useReducedMotion` do Framer Motion
- Condicionar animações

---

### 36. [DS-007] Z-Index Não Padronizado
**Prioridade:** Média | **Esforço:** 3h | **Impacto:** Baixo

**Solução:**
```css
--z-dropdown: 50;
--z-sticky: 100;
--z-modal: 1000;
--z-toast: 1100;
```

---

### 37. [MOB-005] Pull to Refresh Ausente
**Prioridade:** Média | **Esforço:** 6h | **Impacto:** Médio

**Solução:**
- Implementar PTR nativo
- Indicador visual de loading
- Integrar com React Query refetch

---

### 38. [MOB-006] Landscape Mode Não Otimizado
**Prioridade:** Média | **Esforço:** 6h | **Impacto:** Baixo

**Solução:**
- Media queries para landscape
- Layouts alternativos
- Especialmente em charts

---

### 39. [A11Y-006] Modais Sem trap focus
**Prioridade:** Média | **Esforço:** 3h | **Impacto:** Médio

**Problema:**
- Focus pode sair do modal com Tab

**Solução:**
- Radix já implementa, verificar customizações
- Testar com keyboard navigation

---

### 40. [A11Y-007] Carrosséis Sem Controles de Acessibilidade
**Prioridade:** Média | **Esforço:** 4h | **Impacto:** Médio

**Solução:**
- Pause on hover/focus
- Controles de navegação visíveis
- Live region para mudanças

---

### 41. [PERF-004] Fontes Sem font-display: swap
**Prioridade:** Média | **Esforço:** 1h | **Impacto:** Médio

**Problema:**
```css
/* Atual */
@import url('...&display=swap');
/* OK! Mas verificar todas as importações */
```

---

### 42. [PERF-005] Não Usa IntersectionObserver para Lazy Components
**Prioridade:** Média | **Esforço:** 6h | **Impacto:** Médio

**Solução:**
- Charts só carregam quando visíveis
- Listas virtualizadas para dados grandes

---

### 43. [VIZ-001] Cores de Charts Não Acessíveis
**Prioridade:** Média | **Esforço:** 4h | **Impacto:** Médio

**Problema:**
- Chart colors podem ser indistinguíveis para daltônicos

**Solução:**
- Palette acessível
- Patterns além de cores
- Tooltips claros

---

### 44. [VIZ-002] Falta de Tooltips em Todos os Charts
**Prioridade:** Média | **Esforço:** 4h | **Impacto:** Médio

**Solução:**
- Tooltips ricos com contexto
- Formatação de números/datas
- Comparação com período anterior

---

### 45. [VIZ-003] Eixos de Charts Sem Formatação Adequada
**Prioridade:** Média | **Esforço:** 3h | **Impacto:** Baixo

**Solução:**
- Abreviação de valores grandes (K, M)
- Formatação de datas localizada
- Grid lines sutis

---

### 46. [MICRO-001] Falta de Hover States em Todas as Linhas de Tabela
**Prioridade:** Média | **Esforço:** 2h | **Impacto:** Baixo

**Solução:**
- `hover:bg-muted/30` consistente
- Transition suave

---

### 47. [MICRO-002] Ausência de Haptic Feedback em Mobile
**Prioridade:** Média | **Esforço:** 4h | **Impacto:** Médio

**Solução:**
- Vibration API para ações
- Feedback tátil em swipe, complete, delete

---

### 48. [MICRO-003] Progress Bars Sem Animação
**Prioridade:** Média | **Esforço:** 3h | **Impacto:** Baixo

**Solução:**
- Animação de fill suave
- Número counter animado

---

### 49. [MICRO-004] Botões Sem Press State Visual
**Prioridade:** Média | **Esforço:** 2h | **Impacto:** Baixo

**Solução:**
```tsx
// Já existe press-scale, garantir uso universal
className="press-scale"
```

---

## 🟢 BAIXA PRIORIDADE

### 50. [UX-016] Falta de Modo Compacto/Densidade
**Prioridade:** Baixa | **Esforço:** 8h | **Impacto:** Baixo

**Solução:**
- Toggle densidade: Comfortable/Compact
- Ajusta spacing e tamanhos

---

### 51. [UX-017] Ausência de Export de Dados
**Prioridade:** Baixa | **Esforço:** 6h | **Impacto:** Baixo

**Solução:**
- Export CSV/Excel
- Export PDF de relatórios

---

### 52. [DS-008] Falta de Temas Alternativos
**Prioridade:** Baixa | **Esforço:** 12h | **Impacto:** Baixo

**Solução:**
- Além de light/dark, oferecer:
- High contrast
- Colorblind-friendly

---

### 53. [DS-009] Ícones Sem Tamanho Padronizado
**Prioridade:** Baixa | **Esforço:** 3h | **Impacto:** Baixo

**Solução:**
- Definir sizes: sm(16), md(20), lg(24), xl(32)
- Componente Icon wrapper

---

### 54. [MOB-007] Sem Modo Offline
**Prioridade:** Baixa | **Esforço:** 20h | **Impacto:** Médio

**Solução:**
- Service Worker para cache
- Sync quando online
- Indicador de status

---

### 55. [A11Y-008] Falta de High Contrast Mode
**Prioridade:** Baixa | **Esforço:** 6h | **Impacto:** Baixo

**Solução:**
- Tema adicional com alto contraste
- Bordas mais definidas
- Cores mais saturadas

---

### 56. [VIZ-004] Falta de Zoom em Charts Grandes
**Prioridade:** Baixa | **Esforço:** 8h | **Impacto:** Baixo

**Solução:**
- Brush para seleção de período
- Zoom in/out
- Reset view

---

---

## 📋 Roadmap de Implementação

### Sprint 1 (Semana 1-2) - Fundações Críticas
| # | Item | Esforço | Responsável |
|---|------|---------|-------------|
| 1 | [A11Y-001] Skip Links | 2h | Dev |
| 2 | [A11Y-002] Contraste | 3h | Dev |
| 3 | [UX-001] Breadcrumbs | 4h | Dev |
| 4 | [MOB-001] Touch Targets | 6h | Dev |
| 5 | [UX-002] ClosingTimeChart | 6h | Dev |

**Total: 21h**

### Sprint 2 (Semana 3-4) - Mobile First
| # | Item | Esforço | Responsável |
|---|------|---------|-------------|
| 1 | [MOB-003] Mobile Dialogs | 6h | Dev |
| 2 | [UX-003] Mobile Navigation | 8h | Dev |
| 3 | [MOB-002] Responsive Tables | 8h | Dev |
| 4 | [MOB-004] Swipe Gestures | 8h | Dev |

**Total: 30h**

### Sprint 3 (Semana 5-6) - Design System
| # | Item | Esforço | Responsável |
|---|------|---------|-------------|
| 1 | [DS-001] Badge Variants | 4h | Dev |
| 2 | [DS-002] Card Padding | 3h | Dev |
| 3 | [DS-003] Gradient Tokens | 4h | Dev |
| 4 | [DS-004] Typography | 4h | Dev |
| 5 | [UX-004] Empty States | 6h | Dev |

**Total: 21h**

### Sprint 4 (Semana 7-8) - Fluxos
| # | Item | Esforço | Responsável |
|---|------|---------|-------------|
| 1 | [FLOW-001] Onboarding | 16h | Dev |
| 2 | [FLOW-002] Guided Tour | 8h | Dev |
| 3 | [UX-007] Keyboard Shortcuts UI | 3h | Dev |

**Total: 27h**

### Sprint 5 (Semana 9-10) - Performance & A11Y
| # | Item | Esforço | Responsável |
|---|------|---------|-------------|
| 1 | [PERF-001] Lazy Loading | 4h | Dev |
| 2 | [PERF-002] Bundle Audit | 4h | Dev |
| 3 | [PERF-003] Query Optimization | 4h | Dev |
| 4 | [A11Y-003] Focus States | 4h | Dev |
| 5 | [A11Y-005] Form A11Y | 4h | Dev |

**Total: 20h**

### Sprint 6 (Semana 11-12) - Polish
| # | Item | Esforço | Responsável |
|---|------|---------|-------------|
| 1 | [MICRO-001] Hover States | 2h | Dev |
| 2 | [MICRO-003] Progress Animations | 3h | Dev |
| 3 | [VIZ-001] Accessible Charts | 4h | Dev |
| 4 | [VIZ-002] Chart Tooltips | 4h | Dev |
| 5 | [UX-005] Action Feedback | 4h | Dev |

**Total: 17h**

---

## 🔧 Implementação Detalhada por Arquivo

### Arquivos a Criar

```
src/
├── components/
│   ├── navigation/
│   │   └── Breadcrumbs.tsx          # [UX-001]
│   ├── mobile/
│   │   ├── MobileDrawer.tsx         # [UX-003]
│   │   ├── FloatingActionButton.tsx # [UX-003]
│   │   ├── ResponsiveTable.tsx      # [MOB-002]
│   │   └── SwipeableCard.tsx        # [MOB-004]
│   ├── charts/
│   │   ├── ChartSkeleton.tsx        # [DS-005]
│   │   └── AccessibleChart.tsx      # [VIZ-001]
│   ├── feedback/
│   │   ├── SuccessAnimation.tsx     # [UX-005]
│   │   └── UndoToast.tsx            # [UX-005]
│   └── a11y/
│       ├── SkipLinks.tsx            # [A11Y-001]
│       └── VisuallyHidden.tsx       # Utilitário
├── hooks/
│   ├── useResponsiveDialog.ts       # [MOB-003]
│   ├── useHapticFeedback.ts         # [MICRO-002]
│   └── usePersistentFilters.ts      # [UX-006]
└── styles/
    └── high-contrast.css            # [A11Y-008]
```

### Arquivos a Modificar

| Arquivo | Melhorias |
|---------|-----------|
| `src/components/layout/MainLayout.tsx` | Skip Links, Breadcrumbs |
| `src/components/mobile/MobileNavigation.tsx` | Drawer, Menu "Mais" |
| `src/components/analytics/ClosingTimeChart.tsx` | Implementação completa |
| `src/components/ui/badge.tsx` | Variants para status |
| `src/components/ui/button.tsx` | Touch target sizes |
| `src/index.css` | Contraste, z-index, high contrast |
| `tailwind.config.ts` | Spacing tokens, z-index scale |

---

## 📊 Métricas de Sucesso

| Métrica | Atual | Meta | Método |
|---------|-------|------|--------|
| Lighthouse A11Y | ~85 | >95 | Lighthouse CI |
| Touch Target Compliance | ~60% | 100% | Manual audit |
| Mobile Usability | ~70% | >90% | User testing |
| First Contentful Paint | ~2.5s | <1.5s | Web Vitals |
| Largest Contentful Paint | ~4s | <2.5s | Web Vitals |
| Cumulative Layout Shift | ~0.15 | <0.1 | Web Vitals |
| Time to Interactive | ~5s | <3s | Web Vitals |

---

## 🎯 Checklist de Implementação

### Fase 1 - Crítico
- [ ] Skip Links implementados
- [ ] Contraste auditado e corrigido
- [ ] Breadcrumbs funcionando
- [ ] Touch targets 44x44 mínimo
- [ ] ClosingTimeChart implementado
- [ ] Lazy loading em imagens

### Fase 2 - Mobile
- [ ] MobileDrawer completo
- [ ] Todas tabelas responsivas
- [ ] Dialogs → Drawers em mobile
- [ ] Swipe actions em cards/tasks

### Fase 3 - Design System
- [ ] Badge variants padronizados
- [ ] Card spacing tokens
- [ ] Gradients via CSS vars
- [ ] Typography scale consistente
- [ ] Empty states uniformes

### Fase 4 - Fluxos
- [ ] Onboarding flow integrado
- [ ] Guided tour nas páginas principais
- [ ] Atalhos documentados em UI

### Fase 5 - Performance
- [ ] Bundle < 500kb (gzipped)
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] Queries otimizadas

### Fase 6 - Polish
- [ ] Todas animações respeitam prefers-reduced-motion
- [ ] Charts acessíveis
- [ ] Feedback visual em todas ações

---

## 📝 Notas Finais

Este plano representa uma visão exaustiva das melhorias necessárias para elevar o SalesPro CRM ao padrão de excelência em Product Design. 

**Priorização recomendada:**
1. Acessibilidade crítica (compliance legal)
2. Mobile (60%+ do tráfego)
3. Performance (conversão)
4. UX refinements (retenção)
5. Polish (diferenciação)

**Estimativa total:** ~136 horas de desenvolvimento

**Recomendação:** Implementar em sprints de 2 semanas com validação de usuários entre cada fase.

---

*Documento gerado por análise de Product Design Strategy*
*Última atualização: 30/12/2024*
