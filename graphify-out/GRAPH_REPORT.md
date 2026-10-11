# Graph Report - wt-ux-nav (2026-10-11)

## Corpus Check

- 3365 files · ~1,826,449 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 31 file(s) not represented in the graph (top: (none) 18, .toml 6, .lock 2)

## Summary

- 89 nodes · 132 edges · 6 communities (2 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `9078c391`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- MainLayout.tsx
- MainLayout
- BackButton.tsx
- MobilePageHeader.tsx
- useBackNavigation.ts
- GlobalSearch

## God Nodes (most connected - your core abstractions)

1. `MainLayout()` - 12 edges
2. `useBackNavigation()` - 8 edges
3. `recordNavTrail()` - 6 edges
4. `MobilePageHeader` - 4 edges
5. `GlobalSearch` - 3 edges
6. `RoleAwareSidebar` - 3 edges
7. `LayoutRealtimeEffects` - 3 edges
8. `CelebrationOverlayProvider` - 3 edges
9. `MobileNavigation` - 3 edges
10. `PersonalAssistantDrawer` - 3 edges

## Surprising Connections (you probably didn't know these)

- `BackButton` --calls--> `useBackNavigation()` [EXTRACTED]
  src/components/navigation/BackButton.tsx → src/hooks/useBackNavigation.ts
- `MobilePageHeader` --calls--> `useBackNavigation()` [EXTRACTED]
  src/components/mobile/MobilePageHeader.tsx → src/hooks/useBackNavigation.ts
- `MainLayout()` --calls--> `recordNavTrail()` [EXTRACTED]
  src/components/templates/MainLayout.tsx → src/hooks/useBackNavigation.ts
- `MainLayout()` --calls--> `MobilePageHeader` [EXTRACTED]
  src/components/templates/MainLayout.tsx → src/components/mobile/MobilePageHeader.tsx

## Import Cycles

- None detected.

## Communities (6 total, 4 thin omitted)

### Community 1 - "MainLayout"

Cohesion: 0.11
Nodes (10): MobilePageHeader, CelebrationOverlayProvider, LayoutRealtimeEffects, MainLayout(), MobileNavigation, PerformanceMonitor, PersonalAssistantDrawer, RoleAwareSidebar (+2 more)

### Community 4 - "useBackNavigation.ts"

Cohesion: 0.31
Nodes (8): BackNavigationOptions, closeTopmostDialog(), HOME_PATHS, readTrail(), recordNavTrail(), resolveBackFallback(), useBackNavigation(), writeTrail()

## Knowledge Gaps

- **5 isolated node(s):** `MobilePageHeaderProps`, `BackButtonProps`, `MainLayoutProps`, `HOME_PATHS`, `BackNavigationOptions`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 53 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `recordNavTrail()` connect `useBackNavigation.ts` to `MainLayout.tsx`, `MainLayout`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `MainLayout()` connect `MainLayout` to `MainLayout.tsx`, `useBackNavigation.ts`, `GlobalSearch`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `useBackNavigation()` connect `useBackNavigation.ts` to `MainLayout`, `BackButton.tsx`, `MobilePageHeader.tsx`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `MobilePageHeaderProps`, `BackButtonProps`, `MainLayoutProps` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `MainLayout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `MainLayout` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `BackButton.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
