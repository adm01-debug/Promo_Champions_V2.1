# Graph Report - wt-ux-nav (2026-10-11)

## Corpus Check

- 3371 files · ~1,828,539 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 31 file(s) not represented in the graph (top: (none) 18, .toml 6, .lock 2)

## Summary

- 200 nodes · 328 edges · 13 communities (5 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `a133634e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- MainLayout.tsx
- MainLayout
- BackButton.tsx
- useScrollRestoration.ts
- SalesReportHeader.tsx
- NavigationGuard.tsx
- RouteTracker
- CelebrationOverlayProvider
- MobileNavigation
- LayoutRealtimeEffects
- RoleAwareSidebar
- SemanticSearchMount
- Orcamentos.tsx

## God Nodes (most connected - your core abstractions)

1. `useBackNavigation()` - 14 edges
2. `MainLayout()` - 13 edges
3. `NavigationGuardBridge()` - 8 edges
4. `useScrollRestoration()` - 7 edges
5. `requestNavigation()` - 7 edges
6. `handleDocumentClick()` - 6 edges
7. `handlePopState()` - 6 edges
8. `hasDirtySources()` - 5 edges
9. `askConfirmation()` - 4 edges
10. `registerDirtySource()` - 4 edges

## Surprising Connections (you probably didn't know these)

- `MobilePageHeader` --calls--> `useBackNavigation()` [EXTRACTED]
  src/components/mobile/MobilePageHeader.tsx → src/hooks/useBackNavigation.ts
- `BackButton` --calls--> `useBackNavigation()` [EXTRACTED]
  src/components/navigation/BackButton.tsx → src/hooks/useBackNavigation.ts
- `SalesReportHeader()` --calls--> `useBackNavigation()` [EXTRACTED]
  src/components/reports/sales/SalesReportHeader.tsx → src/hooks/useBackNavigation.ts
- `useBackNavigation()` --calls--> `requestNavigation()` [EXTRACTED]
  src/hooks/useBackNavigation.ts → src/lib/navigationGuard.ts
- `AccessDenied()` --calls--> `useBackNavigation()` [EXTRACTED]
  src/pages/AccessDenied.tsx → src/hooks/useBackNavigation.ts

## Import Cycles

- None detected.

## Communities (13 total, 8 thin omitted)

### Community 1 - "MainLayout"

Cohesion: 0.25
Nodes (5): MobilePageHeader, GlobalSearch, MainLayout(), PerformanceMonitor, PersonalAssistantDrawer

### Community 2 - "BackButton.tsx"

Cohesion: 0.11
Nodes (4): MobilePageHeaderProps, BackButton, BackButtonProps, hasOpenDialog()

### Community 3 - "useScrollRestoration.ts"

Cohesion: 0.25
Nodes (5): persistPositions(), readPositions(), ScrollMap, Probe(), useScrollRestoration()

### Community 4 - "SalesReportHeader.tsx"

Cohesion: 0.08
Nodes (10): Props, SalesReportHeader(), BackNavigationOptions, closeTopmostDialog(), HOME_PATHS, PARENT_OVERRIDES, resolveBackFallback(), useBackNavigation() (+2 more)

### Community 5 - "NavigationGuard.tsx"

Cohesion: 0.14
Nodes (17): NavigationGuardBridge(), useFormGuard(), askConfirmation(), ConfirmHandler, DirtySource, dirtySources, firstDirtyMessage(), handleDocumentClick() (+9 more)

## Knowledge Gaps

- **12 isolated node(s):** `HOME_PATHS`, `PARENT_OVERRIDES`, `BackNavigationOptions`, `MainLayoutProps`, `MobilePageHeaderProps` (+7 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 122 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `useBackNavigation()` connect `SalesReportHeader.tsx` to `MainLayout`, `BackButton.tsx`, `NavigationGuard.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `useScrollRestoration()` connect `useScrollRestoration.ts` to `MainLayout.tsx`, `MainLayout`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `NavigationGuardBridge()` connect `NavigationGuard.tsx` to `MainLayout.tsx`, `MainLayout`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `NavigationGuardBridge()` (e.g. with `handleDocumentClick()` and `handlePopState()`) actually correct?**
  _`NavigationGuardBridge()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `HOME_PATHS`, `PARENT_OVERRIDES`, `BackNavigationOptions` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `MainLayout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `BackButton.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10822510822510822 - nodes in this community are weakly interconnected._
