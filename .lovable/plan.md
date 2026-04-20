

## Win/Loss Intelligence — Fase 4: Refinamento sensorial e inteligência preditiva (10 melhorias)

Módulo já em 10/10 funcional. Esta fase adiciona camadas de **profundidade analítica, deleite sensorial e automação inteligente** — elevando de "excelente" para "referência de mercado".

---

### #1 — Cohort de Win Rate por safra de lead
Novo `WinLossCohortHeatmap.tsx`: matriz mês-de-criação × mês-de-fechamento, célula = win rate. Revela se safras recentes estão melhorando ou piorando. Click → drawer.

### #2 — Anomaly detection nos KPIs
Hook `useWinLossAnomalies.ts` calcula z-score sobre série de win rate semanal. Quando |z| > 2, banner amarelo no topo: "Win rate desta semana 2.3σ acima da média — investigar". Click abre o drawer da semana.

### #3 — Explicação IA por insight ("Why?")
Botão `Sparkles` em cada insight do `ActionableInsightsPanel` chama edge `analyze-win-loss` com `mode: "explain", insight_id` e mostra explicação em popover (markdown-lite). Cache em `localStorage` por 24h.

### #4 — Histograma de tempo até fechamento (Won vs Lost)
Novo `CycleTimeHistogram.tsx`: bins de 0-7d, 8-14d, 15-30d, 31-60d, 60+. Duas séries (won verde / lost rosa). Identifica zona de fricção. Click em bin → drawer.

### #5 — Funnel de motivos de perda (Sankey-like)
`LossReasonFlow.tsx`: estágio → motivo top → próximo motivo. Visualização hierárquica com `recharts` Treemap (mais leve que sankey). Mostra onde concentrar esforço.

### #6 — Toggle "Comparar com período anterior" no Trend Chart
Sobrepõe linha pontilhada do período equivalente anterior no `WinLossTrendChart`. Revela sazonalidade. Toggle persiste em URL.

### #7 — Quick filters chips abaixo do header
Chips clicáveis: "Só Wins", "Só Losses", "Top concorrente", "Ciclo > 30d", "Ticket > 10k". Aplicam filtros instantâneos sem abrir o painel. Visual `Badge` com `X` para remover.

### #8 — Notificação de novo padrão detectado
`useWinLossRealtime` ganha listener para INSERT em `win_loss_patterns`: dispara `toast.success` com botão "Ver" → abre `ActionableInsightsPanel` em scroll-into-view e destaca o card por 3s (anel pulsante).

### #9 — Smart digest exportável (Markdown)
Botão extra no header: "Copiar resumo executivo" → gera Markdown com KPIs + delta + top 3 insights + top 3 concorrentes + recomendação IA. `navigator.clipboard.writeText` + toast. Hook `useWinLossDigest.ts`.

### #10 — Microinterações sensoriais
- KPI cards: hover lift sutil (translateY -2px) com `useReducedMotion` guard.
- Drawer abre com spring (stiffness 300, damping 30).
- Sucesso de "análise rodada": confetti discreto (canvas-confetti, 1.2s, 30 partículas, cores semânticas).
- Som opcional desligado por padrão (`mute` em localStorage).

---

### Detalhes técnicos

**Arquivos novos**
```
src/hooks/win-loss/useWinLossAnomalies.ts
src/hooks/win-loss/useWinLossCohort.ts
src/hooks/win-loss/useWinLossDigest.ts
src/hooks/win-loss/useInsightExplanation.ts
src/components/win-loss/WinLossCohortHeatmap.tsx
src/components/win-loss/WinLossAnomalyBanner.tsx
src/components/win-loss/CycleTimeHistogram.tsx
src/components/win-loss/LossReasonFlow.tsx
src/components/win-loss/WinLossQuickFilterChips.tsx
src/components/win-loss/InsightExplainPopover.tsx
```

**Arquivos modificados**
- `WinLossTrendChart.tsx` — toggle de comparação período anterior.
- `ActionableInsightsPanel.tsx` — botão "Why?" + popover de explicação IA.
- `WinLossPageHeader.tsx` — botão "Copiar digest".
- `WinLossKpiBanner.tsx` — hover lift respeitando `useReducedMotion`.
- `WinLossDealsDrawer.tsx` — animação spring na abertura.
- `useRunWinLossAnalysis.ts` — confetti no `onSuccess`.
- `useWinLossRealtime.ts` — listener de patterns + toast.
- `WinLossIntelligence.tsx` — orquestra novos componentes (Cohort, Histogram, LossFlow, AnomalyBanner, QuickFilterChips).

**Edge function reutilizada**
`analyze-win-loss` (já existe) — adiciona suporte a `mode: "explain"` retornando `explanation: string`. Sem nova função.

**Dependência nova**
`canvas-confetti` (≈ 8kb) — única adição. Importada dinamicamente para não pesar bundle inicial.

**Padrões mantidos**
Tokens semânticos · Sora/Inter · ≤400 linhas/arquivo · TS strict · Framer Motion + `useReducedMotion` · zero warnings · RLS preservada · react-helmet-async · sem mutações destrutivas (apenas leitura + clipboard + toast).

### Ordem de execução (sequencial, sem perguntas)
1. #1 Cohort heatmap
2. #2 Anomaly detection + banner
3. #3 Explicação IA (edge + popover)
4. #4 Histograma de ciclo
5. #5 Funnel de motivos (Treemap)
6. #6 Toggle comparativo no Trend
7. #7 Quick filter chips
8. #8 Notificação de novo padrão
9. #9 Digest Markdown copiável
10. #10 Microinterações + confetti
11. Build check + relatório 10/10

