# 01 — FRONTEND: ROTAS E PÁGINAS (estado medido)

> **Auditoria por medição.** Cada afirmação abaixo tem `arquivo:linha` que eu li ou um comando que executei sobre o repositório / o banco de produção (SELECT apenas).
> Nenhuma linha veio de `README`/`docs/*.md`. Data da medição: 2026-08-16. Commit: `git rev-parse --short HEAD` = d44e3db.

## Como medi

| O quê | Como |
|---|---|
| Rotas | `grep -c '<Route path=' src/routes/AppRoutes.tsx` → **174** elementos `<Route>`, **174** paths distintos |
| Páginas | `find src/pages -name '*.tsx' \| wc -l` → **174** arquivos (**37.193** linhas), sendo 1 arquivo de teste (`Index.test.tsx`) e 12 em `src/pages/admin/` |
| Órfãs | conjunto de arquivos de `src/pages` menos todos os alvos de `import '@/pages/…'` e `import './…'` em todo `src/` |
| Alcançabilidade | união de `sidebarMenuData.ts` + `CommandPalette.tsx` + `mobile/` + `NavigationHud` + `useVoiceNavigation`, e depois todos os `to=`/`href=`/`navigate(`/`to:`/`route:` fora de `src/routes/` |
| Camada de dados | para cada página, resolvi 2 níveis de imports (`@/components`, `@/hooks`) e contei arquivos que tocam `integrations/supabase/client`, `useQuery`, `useMutation`/`.insert(`/`.update(`/`.upsert(`/`.delete()` |
| Uso real | `SELECT route, count(*) FROM page_analytics GROUP BY route` no banco de produção |

### Critério de classificação (aplicado mecanicamente, sem julgamento otimista)

| Símbolo | Regra exata |
|---|---|
| ✅ IMPLEMENTADO_TOTAL | alcançável por menu **ou** link no código **e** tem camada de leitura (supabase/useQuery) **e** tem mutação/persistência na árvore **e** nenhum dado fictício encontrado |
| 🟨 IMPLEMENTADO_PARCIAL | alcançável **e** tem camada de dados, **mas** (a) contém dado fictício **ou** (b) é somente leitura — zero mutação em toda a árvore de 2 níveis |
| 🟦 SUGERIDO_OU_INICIADO | alcançável **mas** zero chamadas `supabase`/`useQuery` em 2 níveis de imports (estado local ou dados semente) |
| ⬛ MORTO_OU_ABANDONADO | **nenhum** menu, **nenhum** `to=`/`href=`/`navigate()` em todo `src/` aponta para a rota — só se chega digitando a URL |

> ⚠️ **Limite honesto:** ✅ aqui significa "todas as camadas presentes e navegável", **não** "comprovadamente em uso". A telemetria de produção (`page_analytics`, 75 linhas, 2 usuários, 23/07/2026–15/08/2026) só registra **12 rotas de 174**. Para 162 rotas eu **não tenho evidência de uso** — está anotado no item (d).

---

## 1. Rotas (174) — tabela completa

Wrappers de proteção definidos em `src/routes/AppRoutes.tsx:70-78`:
`<Admin>` = `<ProtectedRoute requiredRole="admin">` (linha 71) · `<Manager>` = `<ProtectedRoute requireAdminOrManager>` (linha 76).
Todo o bloco `/*` já está dentro de `<ProtectedRoute>` (AppRoutes.tsx:101) dentro de `<MainLayout>` (:102).

> Nota de precisão conhecida: o detector de "mutação" procura `useMutation`/`.insert(`/`.update(`/`.upsert(`/`.delete()`. Ele **não** reconhece `supabase.auth.*`, por isso `/auth` e `/reset-password` aparecem como 🟨 "somente leitura" quando na verdade fazem login/cadastro/reset. São 2 falsos 🟨 conhecidos.

| Rota | Página (arquivo:linha) | Role | Classificação | Evidência / o que falta |
|---|---|---|---|---|
| `/auth`<br><sub>AppRoutes.tsx:85</sub> | `src/pages/Auth.tsx`<br>lazyPages.ts:24 | — | 🟨 | link src/components/auth/ProtectedRoute.tsx:55 · sb=1 useQuery=0 mut=0 (árvore 9 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/reset-password`<br><sub>AppRoutes.tsx:86</sub> | `src/pages/ResetPassword.tsx`<br>lazyPages.ts:25 | — | 🟨 | link do e-mail Supabase (fora do app) · sb=1 useQuery=0 mut=0 (árvore 5 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/embed/report/:token`<br><sub>AppRoutes.tsx:89</sub> | `src/pages/EmbedReportPage.tsx`<br>lazyPages.ts:154 | — | 🟨 | URL gerada em src/components/reporting/embedHelpers.ts:30 · sb=0 useQuery=1 mut=0 (árvore 6 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/race-arena/tv`<br><sub>AppRoutes.tsx:92</sub> | `src/pages/RaceArenaTV.tsx`<br>lazyPages.ts:220 | autenticado (explícito) | ⬛ | **SEM link/menu em todo src/** · sb=5 useQuery=3 mut=1 (árvore 7 arq.) |
| `/race-arena/spectator/:seasonId`<br><sub>AppRoutes.tsx:95</sub> | `src/pages/RaceSpectator.tsx`<br>lazyPages.ts:327 | — | ⬛ | **SEM link/menu em todo src/** · sb=1 useQuery=0 mut=0 (árvore 4 arq.) |
| `/`<br><sub>AppRoutes.tsx:108</sub> | `—` | — | ✅ | redirect → /dashboard/visao-geral (AppRoutes.tsx:108) |
| `/dashboard`<br><sub>AppRoutes.tsx:109</sub> | `src/pages/Index.tsx`<br>lazyPages.ts:21 | — | ✅ | menu (sidebarMenuData.ts) · sb=9 useQuery=8 mut=2 (árvore 31 arq.) |
| `/dashboard/:section`<br><sub>AppRoutes.tsx:110</sub> | `src/pages/Index.tsx`<br>lazyPages.ts:21 | — | ✅ | link src/components/mobile/MobilePageHeader.tsx:33 · sb=9 useQuery=8 mut=2 (árvore 31 arq.) |
| `/dashboard/*`<br><sub>AppRoutes.tsx:111</sub> | `src/pages/NotFound.tsx`<br>lazyPages.ts:26 | — | ✅ | rota de sistema (404) — src/pages/NotFound.tsx |
| `/sdr`<br><sub>AppRoutes.tsx:113</sub> | `src/pages/SDRDashboard.tsx`<br>lazyPages.ts:31 | — | 🟨 | menu (sidebarMenuData.ts) · sb=17 useQuery=16 mut=7 (árvore 60 arq.) · **DADO FICTÍCIO** src/components/sdr/SDRConversationInsights.tsx:6-18 (sentimento 65/25/10 e objeções hardcoded), renderizado em SDRDashboard.tsx:364 |
| `/closer`<br><sub>AppRoutes.tsx:114</sub> | `src/pages/CloserDashboard.tsx`<br>lazyPages.ts:32 | — | ✅ | menu (sidebarMenuData.ts) · sb=5 useQuery=5 mut=2 (árvore 24 arq.) |
| `/dashboard-custom`<br><sub>AppRoutes.tsx:115</sub> | `src/pages/DashboardCustom.tsx`<br>lazyPages.ts:33 | — | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 11 arq.) |
| `/vendedor/:id`<br><sub>AppRoutes.tsx:116</sub> | `src/pages/VendedorDashboard.tsx`<br>lazyPages.ts:34 | — | ✅ | link src/pages/Vendedores.tsx:212 (template literal `/vendedor/$id`) · sb=10 useQuery=8 mut=4 (árvore 33 arq.) |
| `/docs`<br><sub>AppRoutes.tsx:118</sub> | `src/pages/Docs.tsx`<br>lazyPages.ts:28 | — | 🟦 | link src/pages/Docs.tsx:60 · sb=0 useQuery=0 mut=0 (árvore 11 arq.) · sem nenhuma chamada supabase/useQuery em 2 níveis de imports |
| `/vendas`<br><sub>AppRoutes.tsx:121</sub> | `src/pages/Vendas.tsx`<br>lazyPages.ts:39 | — | ✅ | menu (sidebarMenuData.ts) · sb=5 useQuery=6 mut=4 (árvore 36 arq.) |
| `/clientes`<br><sub>AppRoutes.tsx:122</sub> | `src/pages/Clientes.tsx`<br>lazyPages.ts:40 | — | ✅ | menu (sidebarMenuData.ts) · sb=4 useQuery=5 mut=2 (árvore 35 arq.) |
| `/produtos`<br><sub>AppRoutes.tsx:123</sub> | `src/pages/Produtos.tsx`<br>lazyPages.ts:41 | — | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 24 arq.) |
| `/pipeline`<br><sub>AppRoutes.tsx:124</sub> | `src/pages/Pipeline.tsx`<br>lazyPages.ts:42 | — | ✅ | menu (sidebarMenuData.ts) · sb=9 useQuery=9 mut=5 (árvore 26 arq.) · **uso medido: 1 views** (page_analytics) |
| `/kanban-clientes`<br><sub>AppRoutes.tsx:125</sub> | `src/pages/KanbanClientes.tsx`<br>lazyPages.ts:43 | — | ✅ | menu (sidebarMenuData.ts) · sb=2 useQuery=4 mut=3 (árvore 18 arq.) |
| `/mapa-clientes`<br><sub>AppRoutes.tsx:126</sub> | `src/pages/MapaClientes.tsx`<br>lazyPages.ts:44 | — | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 9 arq.) |
| `/calendario`<br><sub>AppRoutes.tsx:127</sub> | `src/pages/Calendario.tsx`<br>lazyPages.ts:45 | — | 🟦 | menu (sidebarMenuData.ts) · sb=0 useQuery=0 mut=0 (árvore 8 arq.) · sem nenhuma chamada supabase/useQuery em 2 níveis de imports |
| `/portfolio`<br><sub>AppRoutes.tsx:128</sub> | `src/pages/Portfolio.tsx`<br>lazyPages.ts:46 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=4 useQuery=4 mut=4 (árvore 34 arq.) |
| `/atividades`<br><sub>AppRoutes.tsx:131</sub> | `src/pages/Atividades.tsx`<br>lazyPages.ts:49 | — | ✅ | menu (sidebarMenuData.ts) · sb=3 useQuery=3 mut=4 (árvore 37 arq.) |
| `/cadencias`<br><sub>AppRoutes.tsx:132</sub> | `src/pages/Cadencias.tsx`<br>lazyPages.ts:50 | — | 🟨 | menu (sidebarMenuData.ts) · sb=14 useQuery=8 mut=7 (árvore 43 arq.) · **DADO FICTÍCIO** src/components/sales/cadence/EliteCadenceAnalytics.tsx:55 `efficiencyScore: 88, // Mock score` |
| `/cadencias-orcamentos`<br><sub>AppRoutes.tsx:133</sub> | `src/pages/QuoteCadencesPage.tsx`<br>lazyPages.ts:51 | — | ✅ | menu (sidebarMenuData.ts) · sb=12 useQuery=10 mut=6 (árvore 48 arq.) |
| `/tarefas`<br><sub>AppRoutes.tsx:134</sub> | `src/pages/Tarefas.tsx`<br>lazyPages.ts:52 | — | ✅ | menu (sidebarMenuData.ts) · sb=3 useQuery=3 mut=3 (árvore 18 arq.) |
| `/icp`<br><sub>AppRoutes.tsx:135</sub> | `src/pages/ICP.tsx`<br>lazyPages.ts:53 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=3 useQuery=4 mut=3 (árvore 22 arq.) |
| `/fonte-leads`<br><sub>AppRoutes.tsx:136</sub> | `src/pages/FonteLeads.tsx`<br>lazyPages.ts:54 | admin ou manager | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=0 (árvore 13 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/playbooks`<br><sub>AppRoutes.tsx:137</sub> | `src/pages/Playbooks.tsx`<br>lazyPages.ts:55 | admin ou manager | 🟦 | menu (sidebarMenuData.ts) · sb=0 useQuery=0 mut=0 (árvore 10 arq.) · sem nenhuma chamada supabase/useQuery em 2 níveis de imports |
| `/follow-up`<br><sub>AppRoutes.tsx:138</sub> | `src/pages/FollowUpInteligente.tsx`<br>lazyPages.ts:56 | — | ✅ | link src/components/semantic/semanticSearchHelpers.ts:30 (deep-link da busca semântica) — **não está em nenhum menu** · sb=3 useQuery=3 mut=2 (árvore 23 arq.) |
| `/follow-up/audit`<br><sub>AppRoutes.tsx:139</sub> | `src/pages/FollowUpAudit.tsx`<br>lazyPages.ts:59 | admin ou manager | 🟨 | link src/components/follow-up/FollowUpHeader.tsx:50 · sb=1 useQuery=1 mut=1 (árvore 9 arq.) · **DADO FICTÍCIO** FollowUpAudit.tsx:77-99 `mockLogs` fixos ("Mariana Oliveira","Ricardo Santos"), concatenados ao real em :121 |
| `/sequences`<br><sub>AppRoutes.tsx:140</sub> | `src/pages/SequencesPage.tsx`<br>lazyPages.ts:60 | — | ✅ | menu (sidebarMenuData.ts) · sb=6 useQuery=6 mut=4 (árvore 23 arq.) |
| `/engagement/bulk-composer`<br><sub>AppRoutes.tsx:141</sub> | `src/pages/BulkComposer.tsx`<br>lazyPages.ts:61 | — | ✅ | menu (sidebarMenuData.ts) · sb=2 useQuery=2 mut=2 (árvore 15 arq.) |
| `/engagement/send-time`<br><sub>AppRoutes.tsx:142</sub> | `src/pages/SendTimeOptimization.tsx`<br>lazyPages.ts:62 | — | ✅ | menu (sidebarMenuData.ts) · sb=3 useQuery=3 mut=3 (árvore 11 arq.) |
| `/engagement/email-scoring`<br><sub>AppRoutes.tsx:143</sub> | `src/pages/EmailEngagementScoring.tsx`<br>lazyPages.ts:65 | — | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 7 arq.) |
| `/engagement/abm`<br><sub>AppRoutes.tsx:144</sub> | `src/pages/AccountBasedEngagement.tsx`<br>lazyPages.ts:84 | — | ✅ | menu (sidebarMenuData.ts) · sb=2 useQuery=2 mut=2 (árvore 8 arq.) |
| `/engagement/abm/:accountId`<br><sub>AppRoutes.tsx:145</sub> | `src/pages/AccountDetail.tsx`<br>lazyPages.ts:87 | — | ✅ | link src/components/layout/sidebar/sidebarMenuData.ts:67 · sb=1 useQuery=1 mut=1 (árvore 9 arq.) |
| `/engagement/dialer`<br><sub>AppRoutes.tsx:146</sub> | `src/pages/PowerDialer.tsx`<br>lazyPages.ts:68 | — | ✅ | menu (sidebarMenuData.ts) · sb=2 useQuery=2 mut=1 (árvore 14 arq.) |
| `/lead-scoring`<br><sub>AppRoutes.tsx:147</sub> | `src/pages/LeadScoring.tsx`<br>lazyPages.ts:69 | — | ✅ | menu (sidebarMenuData.ts) · sb=3 useQuery=2 mut=3 (árvore 12 arq.) |
| `/multichannel`<br><sub>AppRoutes.tsx:148</sub> | `src/pages/Multichannel.tsx`<br>lazyPages.ts:70 | — | ✅ | menu (sidebarMenuData.ts) · sb=3 useQuery=3 mut=2 (árvore 17 arq.) |
| `/email-tracking`<br><sub>AppRoutes.tsx:149</sub> | `src/pages/EmailTracking.tsx`<br>lazyPages.ts:71 | — | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 9 arq.) |
| `/automacoes`<br><sub>AppRoutes.tsx:150</sub> | `src/pages/Automacoes.tsx`<br>lazyPages.ts:72 | — | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 13 arq.) · **uso medido: 1 views** (page_analytics) |
| `/conversational-intelligence`<br><sub>AppRoutes.tsx:151</sub> | `src/pages/ConversationalIntelligenceHub.tsx`<br>lazyPages.ts:73 | — | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=0 (árvore 9 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/revenue-intelligence`<br><sub>AppRoutes.tsx:152</sub> | `src/pages/RevenueIntelligence.tsx`<br>lazyPages.ts:76 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 6 arq.) |
| `/revenue-forecast`<br><sub>AppRoutes.tsx:153</sub> | `src/pages/RevenueForecast.tsx`<br>lazyPages.ts:79 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=2 useQuery=2 mut=1 (árvore 9 arq.) |
| `/revenue-forecast-v2`<br><sub>AppRoutes.tsx:154</sub> | `src/pages/RevenueForecastV2.tsx`<br>lazyPages.ts:80 | admin ou manager | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=0 (árvore 7 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/abm`<br><sub>AppRoutes.tsx:155</sub> | `src/pages/AccountBasedSelling.tsx`<br>lazyPages.ts:81 | — | ⬛ | **SEM link/menu em todo src/** · sb=1 useQuery=1 mut=1 (árvore 12 arq.) |
| `/workflow-builder`<br><sub>AppRoutes.tsx:156</sub> | `src/pages/AutomationBuilder.tsx`<br>lazyPages.ts:88 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 11 arq.) · **uso medido: 1 views** (page_analytics) |
| `/automacao-inteligente`<br><sub>AppRoutes.tsx:157</sub> | `src/pages/AutomacaoInteligente.tsx`<br>lazyPages.ts:91 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=3 useQuery=2 mut=3 (árvore 11 arq.) |
| `/coaching-inteligente`<br><sub>AppRoutes.tsx:158</sub> | `src/pages/CoachingInteligente.tsx`<br>lazyPages.ts:172 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=3 useQuery=2 mut=2 (árvore 14 arq.) |
| `/orcamentos`<br><sub>AppRoutes.tsx:161</sub> | `src/pages/Orcamentos.tsx`<br>lazyPages.ts:96 | — | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 16 arq.) |
| `/assinatura-digital`<br><sub>AppRoutes.tsx:162</sub> | `src/pages/AssinaturaDigital.tsx`<br>lazyPages.ts:97 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 14 arq.) |
| `/fornecedores`<br><sub>AppRoutes.tsx:163</sub> | `src/pages/Fornecedores.tsx`<br>lazyPages.ts:100 | admin ou manager | ⬛ | **SEM link/menu em todo src/** · sb=0 useQuery=0 mut=0 (árvore 12 arq.) |
| `/comparador-precos`<br><sub>AppRoutes.tsx:164</sub> | `src/pages/ComparadorPrecos.tsx`<br>lazyPages.ts:101 | admin ou manager | ⬛ | **SEM link/menu em todo src/** · sb=2 useQuery=2 mut=2 (árvore 12 arq.) |
| `/comissoes`<br><sub>AppRoutes.tsx:165</sub> | `src/pages/Comissoes.tsx`<br>lazyPages.ts:104 | — | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 10 arq.) |
| `/agenda`<br><sub>AppRoutes.tsx:166</sub> | `src/pages/Agenda.tsx`<br>lazyPages.ts:105 | — | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=3 mut=2 (árvore 13 arq.) |
| `/admin/comissoes`<br><sub>AppRoutes.tsx:167</sub> | `src/pages/AdminComissoes.tsx`<br>lazyPages.ts:106 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 12 arq.) |
| `/admin/regras-comissao`<br><sub>AppRoutes.tsx:168</sub> | `src/pages/CommissionRules.tsx`<br>lazyPages.ts:110 | admin ou manager | ✅ | link src/pages/AdminComissoes.tsx:119 · sb=2 useQuery=2 mut=2 (árvore 13 arq.) |
| `/admin/premiacoes`<br><sub>AppRoutes.tsx:169</sub> | `src/pages/AdminPremiacoes.tsx`<br>lazyPages.ts:111 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=2 useQuery=2 mut=1 (árvore 13 arq.) |
| `/admin/premiacoes/auditoria`<br><sub>AppRoutes.tsx:170</sub> | `src/pages/AdminAuditoriaPremiacoes.tsx`<br>lazyPages.ts:112 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=2 useQuery=2 mut=1 (árvore 8 arq.) |
| `/admin/fila-tarefas-automaticas`<br><sub>AppRoutes.tsx:171</sub> | `src/pages/AdminFilaTarefasAutomaticas.tsx`<br>lazyPages.ts:113 | admin ou manager | ⬛ | **SEM link/menu em todo src/** · sb=1 useQuery=0 mut=1 (árvore 7 arq.) |
| `/admin/regras-inatividade`<br><sub>AppRoutes.tsx:172</sub> | `src/pages/AdminRegrasInatividade.tsx`<br>lazyPages.ts:114 | admin ou manager | ⬛ | **SEM link/menu em todo src/** · sb=1 useQuery=1 mut=1 (árvore 9 arq.) |
| `/admin/alertas-churn`<br><sub>AppRoutes.tsx:173</sub> | `src/pages/AdminAlertasChurn.tsx`<br>lazyPages.ts:115 | admin ou manager | ⬛ | **SEM link/menu em todo src/** · sb=1 useQuery=1 mut=1 (árvore 10 arq.) |
| `/admin/alertas-churn/historico`<br><sub>AppRoutes.tsx:174</sub> | `src/pages/AdminHistoricoAlertasChurn.tsx`<br>lazyPages.ts:116 | admin ou manager | 🟨 | link src/pages/AdminAlertasChurn.tsx:186 · sb=2 useQuery=2 mut=0 (árvore 11 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/admin/supressao-emails`<br><sub>AppRoutes.tsx:175</sub> | `src/pages/AdminSupressaoEmails.tsx`<br>lazyPages.ts:117 | admin ou manager | ⬛ | **SEM link/menu em todo src/** · sb=8 useQuery=7 mut=2 (árvore 30 arq.) |
| `/minhas-premiacoes`<br><sub>AppRoutes.tsx:176</sub> | `src/pages/MinhasPremiacoes.tsx`<br>lazyPages.ts:118 | — | ✅ | menu (sidebarMenuData.ts) · sb=2 useQuery=2 mut=1 (árvore 9 arq.) |
| `/aprovacoes`<br><sub>AppRoutes.tsx:178</sub> | `src/pages/ApprovalWorkflowsPage.tsx`<br>lazyPages.ts:107 | — | ✅ | menu (sidebarMenuData.ts) · sb=2 useQuery=2 mut=2 (árvore 14 arq.) |
| `/webhooks`<br><sub>AppRoutes.tsx:179</sub> | `src/pages/WebhooksPage.tsx`<br>lazyPages.ts:119 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=2 useQuery=1 mut=1 (árvore 17 arq.) |
| `/audit-logs`<br><sub>AppRoutes.tsx:180</sub> | `src/pages/AuditLogsPage.tsx`<br>lazyPages.ts:120 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 10 arq.) |
| `/sla-tracking`<br><sub>AppRoutes.tsx:181</sub> | `src/pages/SLATrackingPage.tsx`<br>lazyPages.ts:121 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 10 arq.) |
| `/lead-routing`<br><sub>AppRoutes.tsx:182</sub> | `src/pages/LeadRoutingPage.tsx`<br>lazyPages.ts:122 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 8 arq.) |
| `/workflows`<br><sub>AppRoutes.tsx:183</sub> | `src/pages/WorkflowsPage.tsx`<br>lazyPages.ts:123 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 11 arq.) · Math.random() cosmético em WorkflowsPage.tsx:125 (posição de nó) · **uso medido: 2 views** (page_analytics) |
| `/analytics`<br><sub>AppRoutes.tsx:186</sub> | `src/pages/Analytics.tsx`<br>lazyPages.ts:126 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=16 useQuery=17 mut=2 (árvore 53 arq.) |
| `/analytics/abc`<br><sub>AppRoutes.tsx:187</sub> | `src/pages/ABCAnalysisPage.tsx`<br>lazyPages.ts:185 | admin ou manager | 🟨 | link src/components/analytics/ABCAnalysis.tsx:110 · sb=1 useQuery=1 mut=0 (árvore 8 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/analytics/closing-time`<br><sub>AppRoutes.tsx:188</sub> | `src/pages/ClosingTimePage.tsx`<br>lazyPages.ts:186 | admin ou manager | 🟨 | link src/components/analytics/ClosingTimeChart.tsx:108 · sb=1 useQuery=1 mut=0 (árvore 8 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/analytics/deal-velocity`<br><sub>AppRoutes.tsx:189</sub> | `src/pages/DealVelocityPage.tsx`<br>lazyPages.ts:187 | admin ou manager | 🟨 | link src/components/analytics/DealVelocityChart.tsx:91 · sb=1 useQuery=1 mut=0 (árvore 8 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/analytics/evolution`<br><sub>AppRoutes.tsx:190</sub> | `src/pages/EvolutionCurvesPage.tsx`<br>lazyPages.ts:190 | admin ou manager | 🟨 | link src/components/competitive/EvolutionChart.tsx:61 · sb=1 useQuery=1 mut=0 (árvore 6 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/analytics/objections`<br><sub>AppRoutes.tsx:191</sub> | `src/pages/ObjectionsLibraryPage.tsx`<br>lazyPages.ts:193 | admin ou manager | ✅ | link src/components/analytics/ObjectionsLibrary.tsx:224 · sb=1 useQuery=1 mut=1 (árvore 13 arq.) |
| `/analytics/win-loss`<br><sub>AppRoutes.tsx:192</sub> | `src/pages/WinLossAnalysisPage.tsx`<br>lazyPages.ts:182 | admin ou manager | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=0 (árvore 7 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/relatorios`<br><sub>AppRoutes.tsx:193</sub> | `src/pages/Relatorios.tsx`<br>lazyPages.ts:127 | admin ou manager | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=0 (árvore 11 arq.) · **uso medido: 1 views** (page_analytics) · somente leitura — nenhuma mutação/persistência na árvore |
| `/bi-vendedor`<br><sub>AppRoutes.tsx:194</sub> | `src/pages/BIVendedor.tsx`<br>lazyPages.ts:128 | — | ⬛ | **SEM link/menu em todo src/** · sb=2 useQuery=3 mut=0 (árvore 17 arq.) |
| `/bi-sdr`<br><sub>AppRoutes.tsx:195</sub> | `src/pages/BISDR.tsx`<br>lazyPages.ts:130 | — | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=0 (árvore 13 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/bi-closer`<br><sub>AppRoutes.tsx:196</sub> | `src/pages/BICloser.tsx`<br>lazyPages.ts:131 | — | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=0 (árvore 14 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/bi-gestor`<br><sub>AppRoutes.tsx:197</sub> | `src/pages/BIGestor.tsx`<br>lazyPages.ts:129 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=9 useQuery=10 mut=1 (árvore 33 arq.) |
| `/relatorio-atividades`<br><sub>AppRoutes.tsx:198</sub> | `src/pages/RelatorioAtividades.tsx`<br>lazyPages.ts:132 | admin ou manager | ⬛ | **SEM link/menu em todo src/** · sb=1 useQuery=1 mut=0 (árvore 18 arq.) |
| `/relatorios-email`<br><sub>AppRoutes.tsx:199</sub> | `src/pages/RelatoriosEmail.tsx`<br>lazyPages.ts:135 | — | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 11 arq.) |
| `/analytics/emails`<br><sub>AppRoutes.tsx:200</sub> | `src/pages/EmailAnalyticsPage.tsx`<br>lazyPages.ts:136 | admin ou manager | ⬛ | **SEM link/menu em todo src/** · sb=1 useQuery=1 mut=0 (árvore 8 arq.) |
| `/relatorios-executivos`<br><sub>AppRoutes.tsx:201</sub> | `src/pages/RelatoriosExecutivos.tsx`<br>lazyPages.ts:139 | admin ou manager | 🟨 | link src/components/intelligence/IntelligenceCommandBar.tsx:30 · sb=1 useQuery=1 mut=0 (árvore 7 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/relatorios-agendados`<br><sub>AppRoutes.tsx:202</sub> | `src/pages/ScheduledReports.tsx`<br>lazyPages.ts:142 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=4 useQuery=4 mut=3 (árvore 19 arq.) |
| `/relatorios-custom`<br><sub>AppRoutes.tsx:203</sub> | `src/pages/CustomReports.tsx`<br>lazyPages.ts:145 | — | ✅ | link src/pages/CustomReports.tsx:36 · sb=2 useQuery=2 mut=1 (árvore 16 arq.) |
| `/relatorios-custom/:id`<br><sub>AppRoutes.tsx:204</sub> | `src/pages/CustomReports.tsx`<br>lazyPages.ts:145 | — | ✅ | link src/pages/CustomReports.tsx:36 · sb=2 useQuery=2 mut=1 (árvore 16 arq.) |
| `/roi`<br><sub>AppRoutes.tsx:205</sub> | `src/pages/ROIDashboard.tsx`<br>lazyPages.ts:146 | admin ou manager | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=0 (árvore 10 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/forecast`<br><sub>AppRoutes.tsx:206</sub> | `src/pages/ForecastPonderado.tsx`<br>lazyPages.ts:147 | admin ou manager | 🟨 | menu (sidebarMenuData.ts) · sb=2 useQuery=1 mut=0 (árvore 8 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/previsao-demanda`<br><sub>AppRoutes.tsx:207</sub> | `src/pages/PrevisaoDemanda.tsx`<br>lazyPages.ts:150 | admin ou manager | ⬛ | **SEM link/menu em todo src/** · sb=1 useQuery=1 mut=1 (árvore 10 arq.) |
| `/inteligencia-preditiva`<br><sub>AppRoutes.tsx:208</sub> | `src/pages/InteligenciaPreditiva.tsx`<br>lazyPages.ts:166 | — | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=0 (árvore 13 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/inteligencia-compras`<br><sub>AppRoutes.tsx:209</sub> | `src/pages/PurchaseIntelligence.tsx`<br>lazyPages.ts:169 | — | 🟦 | menu (sidebarMenuData.ts) · sb=0 useQuery=0 mut=0 (árvore 6 arq.) · sem nenhuma chamada supabase/useQuery em 2 níveis de imports |
| `/deal-intelligence`<br><sub>AppRoutes.tsx:210</sub> | `src/pages/DealIntelligence.tsx`<br>lazyPages.ts:176 | — | ✅ | menu (sidebarMenuData.ts) · sb=6 useQuery=6 mut=6 (árvore 24 arq.) |
| `/win-loss-intelligence`<br><sub>AppRoutes.tsx:211</sub> | `src/pages/WinLossIntelligence.tsx`<br>lazyPages.ts:179 | — | ✅ | menu (sidebarMenuData.ts) · sb=24 useQuery=23 mut=8 (árvore 89 arq.) |
| `/revops`<br><sub>AppRoutes.tsx:212</sub> | `src/pages/RevOpsHub.tsx`<br>lazyPages.ts:175 | admin ou manager | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=0 (árvore 9 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/inteligencia`<br><sub>AppRoutes.tsx:213</sub> | `src/pages/Intelligence.tsx`<br>lazyPages.ts:196 | — | 🟦 | menu (sidebarMenuData.ts) · sb=0 useQuery=0 mut=0 (árvore 7 arq.) · sem nenhuma chamada supabase/useQuery em 2 níveis de imports |
| `/funil`<br><sub>AppRoutes.tsx:214</sub> | `src/pages/FunnelAnalysis.tsx`<br>lazyPages.ts:151 | — | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=0 (árvore 8 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/ferramentas/bi`<br><sub>AppRoutes.tsx:215</sub> | `src/pages/BusinessIntelligencePage.tsx`<br>lazyPages.ts:197 | admin ou manager | 🟨 | menu (sidebarMenuData.ts) · sb=4 useQuery=4 mut=0 (árvore 22 arq.) · **DADO FICTÍCIO** src/lib/bi/mockData.ts:1-29 (MacBook Pro M3, Dell XPS 15, sazonalidade senoidal) via useIndustryTrends.ts:10,20,28,72,73 e useClientBI.ts:39-45; useClientVsIndustry.ts:39 `client: 85, // Mock` |
| `/relatorios/vendas`<br><sub>AppRoutes.tsx:216</sub> | `src/pages/SalesReportPage.tsx`<br>lazyPages.ts:332 | autenticado (explícito) | 🟨 | link src/pages/SalesReportPage.tsx:87 · sb=1 useQuery=1 mut=0 (árvore 22 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/relatorios/funil`<br><sub>AppRoutes.tsx:217</sub> | `src/pages/FunnelReportPage.tsx`<br>lazyPages.ts:152 | admin ou manager | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=0 (árvore 9 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/relatorios/cohort`<br><sub>AppRoutes.tsx:218</sub> | `src/pages/CohortReportPage.tsx`<br>lazyPages.ts:153 | admin ou manager | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=0 (árvore 8 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/top-produtos`<br><sub>AppRoutes.tsx:219</sub> | `src/pages/TopProductsRanking.tsx`<br>lazyPages.ts:155 | — | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 7 arq.) |
| `/evolucao-precos`<br><sub>AppRoutes.tsx:220</sub> | `src/pages/PriceEvolution.tsx`<br>lazyPages.ts:158 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=2 useQuery=2 mut=2 (árvore 9 arq.) |
| `/metricas-categoria`<br><sub>AppRoutes.tsx:221</sub> | `src/pages/CategoryMetrics.tsx`<br>lazyPages.ts:159 | — | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=0 (árvore 4 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/benchmarking`<br><sub>AppRoutes.tsx:222</sub> | `src/pages/HistoricalBenchmark.tsx`<br>lazyPages.ts:160 | — | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=0 (árvore 5 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/health-score`<br><sub>AppRoutes.tsx:223</sub> | `src/pages/ClientHealthScore.tsx`<br>lazyPages.ts:163 | — | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=0 (árvore 6 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/customer-success`<br><sub>AppRoutes.tsx:224</sub> | `src/pages/CustomerSuccessHub.tsx`<br>lazyPages.ts:288 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=3 useQuery=2 mut=2 (árvore 11 arq.) |
| `/sales-enablement`<br><sub>AppRoutes.tsx:225</sub> | `src/pages/SalesEnablementHub.tsx`<br>lazyPages.ts:291 | — | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 13 arq.) |
| `/pricing-intelligence`<br><sub>AppRoutes.tsx:226</sub> | `src/pages/PricingIntelligenceHub.tsx`<br>lazyPages.ts:294 | admin ou manager | 🟨 | menu (sidebarMenuData.ts) · sb=0 useQuery=1 mut=0 (árvore 9 arq.) · **DADO FICTÍCIO** src/components/pricing/DiscountOptimizer.tsx:23 "Mock elasticity logic" |
| `/territory-optimization`<br><sub>AppRoutes.tsx:227</sub> | `src/pages/TerritoryOptimizationHub.tsx`<br>lazyPages.ts:297 | admin ou manager | 🟨 | menu (sidebarMenuData.ts) · sb=0 useQuery=1 mut=0 (árvore 8 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/customer-success-360`<br><sub>AppRoutes.tsx:228</sub> | `src/pages/CustomerSuccess360.tsx`<br>lazyPages.ts:300 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=3 useQuery=2 mut=2 (árvore 11 arq.) |
| `/competencias`<br><sub>AppRoutes.tsx:229</sub> | `src/pages/Competencias.tsx`<br>lazyPages.ts:324 | — | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=0 (árvore 8 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/ranking`<br><sub>AppRoutes.tsx:232</sub> | `src/pages/RankingCompetitivo.tsx`<br>lazyPages.ts:202 | — | ✅ | menu (sidebarMenuData.ts) · sb=3 useQuery=3 mut=1 (árvore 18 arq.) |
| `/gamificacao/badges`<br><sub>AppRoutes.tsx:233</sub> | `src/pages/BadgesGalleryPage.tsx`<br>lazyPages.ts:214 | — | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=0 (árvore 11 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/perfil-gamer`<br><sub>AppRoutes.tsx:234</sub> | `src/pages/GamifiedProfilePage.tsx`<br>lazyPages.ts:211 | — | ⬛ | **SEM link/menu em todo src/** · sb=2 useQuery=2 mut=0 (árvore 12 arq.) |
| `/arena`<br><sub>AppRoutes.tsx:235</sub> | `src/pages/ArenaCompetitiva.tsx`<br>lazyPages.ts:205 | — | ✅ | menu (sidebarMenuData.ts) · sb=2 useQuery=2 mut=1 (árvore 8 arq.) |
| `/race-arena`<br><sub>AppRoutes.tsx:236</sub> | `src/pages/RaceArenaHub.tsx`<br>lazyPages.ts:208 | — | ✅ | menu (sidebarMenuData.ts) · sb=9 useQuery=8 mut=5 (árvore 26 arq.) |
| `/race-arena/closer`<br><sub>AppRoutes.tsx:237</sub> | `src/pages/RaceArenaCloser.tsx`<br>lazyPages.ts:209 | — | 🟦 | link src/pages/admin/RaceArenaAdmin.tsx:40 · sb=0 useQuery=0 mut=0 (árvore 1 arq.) · sem nenhuma chamada supabase/useQuery em 2 níveis de imports |
| `/race-arena/sdr`<br><sub>AppRoutes.tsx:238</sub> | `src/pages/RaceArenaSDR.tsx`<br>lazyPages.ts:210 | — | 🟦 | link src/pages/admin/RaceArenaAdmin.tsx:43 · sb=0 useQuery=0 mut=0 (árvore 1 arq.) · sem nenhuma chamada supabase/useQuery em 2 níveis de imports |
| `/race-arena/garage`<br><sub>AppRoutes.tsx:239</sub> | `src/pages/RaceArenaGarage.tsx`<br>lazyPages.ts:221 | — | ✅ | link src/components/race/RaceArenaHeader.tsx:131 · sb=3 useQuery=3 mut=2 (árvore 11 arq.) |
| `/race-arena/career`<br><sub>AppRoutes.tsx:240</sub> | `src/pages/RaceArenaCareer.tsx`<br>lazyPages.ts:222 | — | ✅ | link src/pages/RaceArenaHub.tsx:237 · sb=2 useQuery=2 mut=1 (árvore 8 arq.) |
| `/admin/race-arena`<br><sub>AppRoutes.tsx:241</sub> | `src/pages/admin/RaceArenaAdmin.tsx`<br>lazyPages.ts:217 | admin | ✅ | menu (sidebarMenuData.ts) · sb=7 useQuery=6 mut=3 (árvore 15 arq.) |
| `/desafios`<br><sub>AppRoutes.tsx:242</sub> | `src/pages/DesafiosSemanais.tsx`<br>lazyPages.ts:223 | — | ✅ | menu (sidebarMenuData.ts) · sb=4 useQuery=4 mut=3 (árvore 18 arq.) |
| `/desafios-diarios`<br><sub>AppRoutes.tsx:243</sub> | `src/pages/HistoricoDesafiosDiarios.tsx`<br>lazyPages.ts:226 | — | ⬛ | **SEM link/menu em todo src/** · sb=3 useQuery=3 mut=2 (árvore 11 arq.) |
| `/victory-feed`<br><sub>AppRoutes.tsx:244</sub> | `src/pages/VictoryFeedPage.tsx`<br>lazyPages.ts:229 | — | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 9 arq.) |
| `/competitive-seasons`<br><sub>AppRoutes.tsx:245</sub> | `src/pages/CompetitiveSeasonsAdmin.tsx`<br>lazyPages.ts:230 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 7 arq.) |
| `/team-activity`<br><sub>AppRoutes.tsx:246</sub> | `src/pages/TeamActivityFeed.tsx`<br>lazyPages.ts:233 | — | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=0 (árvore 6 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/vendedores`<br><sub>AppRoutes.tsx:249</sub> | `src/pages/Vendedores.tsx`<br>lazyPages.ts:238 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=7 useQuery=7 mut=6 (árvore 34 arq.) |
| `/metas`<br><sub>AppRoutes.tsx:250</sub> | `src/pages/Metas.tsx`<br>lazyPages.ts:239 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=2 useQuery=3 mut=1 (árvore 20 arq.) |
| `/metas-atividades`<br><sub>AppRoutes.tsx:251</sub> | `src/pages/MetasAtividades.tsx`<br>lazyPages.ts:240 | — | ✅ | menu (sidebarMenuData.ts) · sb=6 useQuery=6 mut=5 (árvore 39 arq.) · Math.random() cosmético em MetasAtividades.tsx:56-86 (confete) |
| `/times`<br><sub>AppRoutes.tsx:252</sub> | `src/pages/Times.tsx`<br>lazyPages.ts:241 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=2 useQuery=2 mut=2 (árvore 23 arq.) |
| `/territorios`<br><sub>AppRoutes.tsx:253</sub> | `src/pages/Territorios.tsx`<br>lazyPages.ts:242 | — | ⬛ | **SEM link/menu em todo src/** · sb=1 useQuery=1 mut=0 (árvore 9 arq.) |
| `/estoque`<br><sub>AppRoutes.tsx:254</sub> | `src/pages/Estoque.tsx`<br>lazyPages.ts:243 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=2 useQuery=2 mut=1 (árvore 13 arq.) |
| `/nps`<br><sub>AppRoutes.tsx:255</sub> | `src/pages/NPSDashboard.tsx`<br>lazyPages.ts:244 | — | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 9 arq.) |
| `/deduplicacao`<br><sub>AppRoutes.tsx:256</sub> | `src/pages/Deduplication.tsx`<br>lazyPages.ts:245 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 10 arq.) |
| `/importar-exportar`<br><sub>AppRoutes.tsx:257</sub> | `src/pages/ImportExport.tsx`<br>lazyPages.ts:246 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=2 useQuery=2 mut=2 (árvore 7 arq.) |
| `/onboarding-tracking`<br><sub>AppRoutes.tsx:258</sub> | `src/pages/OnboardingTracking.tsx`<br>lazyPages.ts:247 | — | 🟦 | menu (sidebarMenuData.ts) · sb=0 useQuery=0 mut=0 (árvore 8 arq.) · **DADO FICTÍCIO + SEM PERSISTÊNCIA** OnboardingTracking.tsx:37 "Local state — can be migrated to DB later"; :41-68 "Empresa Alpha"/"Corp Beta" · sem nenhuma chamada supabase/useQuery em 2 níveis de imports |
| `/gatilhos-inatividade`<br><sub>AppRoutes.tsx:259</sub> | `src/pages/InactivityTriggers.tsx`<br>lazyPages.ts:250 | admin ou manager | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=0 (árvore 7 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/bitrix24`<br><sub>AppRoutes.tsx:260</sub> | `src/pages/Bitrix24.tsx`<br>lazyPages.ts:253 | admin ou manager | ✅ | link src/components/admin/AdminQuickLinks.tsx:46 · sb=1 useQuery=1 mut=1 (árvore 10 arq.) |
| `/assistente`<br><sub>AppRoutes.tsx:263</sub> | `src/pages/Assistente.tsx`<br>lazyPages.ts:256 | — | ✅ | menu (sidebarMenuData.ts) · sb=5 useQuery=4 mut=4 (árvore 15 arq.) |
| `/meu-assistente`<br><sub>AppRoutes.tsx:264</sub> | `src/pages/MeuAssistente.tsx`<br>lazyPages.ts:257 | — | ✅ | menu (sidebarMenuData.ts) · sb=6 useQuery=4 mut=3 (árvore 17 arq.) |
| `/perguntar`<br><sub>AppRoutes.tsx:265</sub> | `src/pages/AskAnything.tsx`<br>lazyPages.ts:259 | — | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=0 mut=0 (árvore 9 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/busca-inteligente`<br><sub>AppRoutes.tsx:266</sub> | `src/pages/SmartSearch.tsx`<br>lazyPages.ts:258 | — | 🟦 | menu (sidebarMenuData.ts) · sb=0 useQuery=0 mut=0 (árvore 8 arq.) · sem nenhuma chamada supabase/useQuery em 2 níveis de imports |
| `/busca`<br><sub>AppRoutes.tsx:267</sub> | `src/pages/SemanticSearch.tsx`<br>lazyPages.ts:260 | — | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=0 mut=0 (árvore 7 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/agentes`<br><sub>AppRoutes.tsx:268</sub> | `src/pages/AIAgents.tsx`<br>lazyPages.ts:261 | — | ✅ | menu (sidebarMenuData.ts) · sb=4 useQuery=4 mut=2 (árvore 19 arq.) |
| `/notificacoes`<br><sub>AppRoutes.tsx:269</sub> | `src/pages/Notificacoes.tsx`<br>lazyPages.ts:262 | — | ✅ | menu (sidebarMenuData.ts) · sb=9 useQuery=7 mut=5 (árvore 32 arq.) |
| `/configuracoes`<br><sub>AppRoutes.tsx:270</sub> | `src/pages/Configuracoes.tsx`<br>lazyPages.ts:263 | — | ✅ | menu (sidebarMenuData.ts) · sb=21 useQuery=19 mut=15 (árvore 59 arq.) |
| `/admin`<br><sub>AppRoutes.tsx:273</sub> | `src/pages/AdminDashboard.tsx`<br>lazyPages.ts:266 | admin | ✅ | menu (sidebarMenuData.ts) · sb=14 useQuery=12 mut=7 (árvore 39 arq.) · **uso medido: 1 views** (page_analytics) |
| `/admin/conexoes`<br><sub>AppRoutes.tsx:274</sub> | `src/pages/admin/AdminConexoesPage.tsx`<br>lazyPages.ts:303 | admin | ✅ | link src/components/admin/AdminQuickLinks.tsx:39 · sb=19 useQuery=16 mut=9 (árvore 48 arq.) · **uso medido: 1 views** (page_analytics) |
| `/admin/v4-callbacks`<br><sub>AppRoutes.tsx:275</sub> | `src/pages/admin/AdminV4CallbacksPage.tsx`<br>lazyPages.ts:306 | admin | ✅ | link src/components/admin/AdminQuickLinks.tsx:40 · sb=3 useQuery=2 mut=3 (árvore 18 arq.) |
| `/admin/quote-sync-inbound`<br><sub>AppRoutes.tsx:276</sub> | `src/pages/admin/AdminQuoteSyncInboundPage.tsx`<br>lazyPages.ts:309 | admin | ⬛ | **SEM link/menu em todo src/** · sb=3 useQuery=2 mut=2 (árvore 10 arq.) |
| `/admin/quote-conversions`<br><sub>AppRoutes.tsx:277</sub> | `src/pages/admin/AdminQuoteConversionsPage.tsx`<br>lazyPages.ts:312 | admin | 🟨 | link src/components/admin/AdminQuickLinks.tsx:68 · sb=1 useQuery=1 mut=0 (árvore 7 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/admin/platform-slo`<br><sub>AppRoutes.tsx:278</sub> | `src/pages/admin/AdminPlatformSLOPage.tsx`<br>lazyPages.ts:315 | admin | 🟨 | link src/components/admin/AdminQuickLinks.tsx:62 · sb=1 useQuery=1 mut=0 (árvore 4 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/admin/web-vitals`<br><sub>AppRoutes.tsx:279</sub> | `src/pages/admin/AdminWebVitalsPage.tsx`<br>lazyPages.ts:318 | admin | 🟨 | link src/components/admin/AdminQuickLinks.tsx:74 · sb=1 useQuery=1 mut=0 (árvore 7 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/admin/telemetria`<br><sub>AppRoutes.tsx:280</sub> | `src/pages/AdminTelemetria.tsx`<br>lazyPages.ts:268 | admin ou manager | ✅ | menu (sidebarMenuData.ts) · sb=2 useQuery=1 mut=1 (árvore 30 arq.) |
| `/admin/comercial`<br><sub>AppRoutes.tsx:281</sub> | `src/pages/admin/AdminComercial.tsx`<br>lazyPages.ts:321 | admin ou manager | ✅ | link src/components/admin/AdminQuickLinks.tsx:32 · sb=1 useQuery=1 mut=1 (árvore 12 arq.) |
| `/usage-analytics`<br><sub>AppRoutes.tsx:282</sub> | `src/pages/UsageAnalytics.tsx`<br>lazyPages.ts:269 | admin | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=0 (árvore 4 arq.) · **DADO FICTÍCIO** UsageAnalytics.tsx:74 `login_count: Math.floor(Math.random()*50)+10`; UsageAnalytics.tsx:42-48 comentário diz "Page views from route_analytics" mas agrega `sales.status` |
| `/feature-flags`<br><sub>AppRoutes.tsx:283</sub> | `src/pages/FeatureFlagsAdmin.tsx`<br>lazyPages.ts:270 | admin | ✅ | menu (sidebarMenuData.ts) · sb=2 useQuery=2 mut=1 (árvore 11 arq.) |
| `/seguranca`<br><sub>AppRoutes.tsx:284</sub> | `src/pages/SecurityDashboard.tsx`<br>lazyPages.ts:273 | admin | 🟨 | menu (sidebarMenuData.ts) · sb=3 useQuery=3 mut=3 (árvore 9 arq.) · **DADO FICTÍCIO** src/components/security/GeoBlockingMap.tsx:9 mapa SVG fake |
| `/admin/tarefas`<br><sub>AppRoutes.tsx:285</sub> | `src/pages/AdminTasksPage.tsx`<br>lazyPages.ts:267 | admin | ⬛ | **SEM link/menu em todo src/** · sb=3 useQuery=2 mut=3 (árvore 10 arq.) |
| `/admin/webhooks-dead-letters`<br><sub>AppRoutes.tsx:286</sub> | `src/pages/admin/WebhooksDeadLettersAdmin.tsx`<br>lazyPages.ts:276 | admin | ✅ | link src/components/admin/AdminQuickLinks.tsx:123 · sb=9 useQuery=9 mut=4 (árvore 28 arq.) |
| `/admin/webhooks-timeline`<br><sub>AppRoutes.tsx:287</sub> | `src/pages/admin/WebhookTimelinePage.tsx`<br>lazyPages.ts:279 | admin | 🟨 | link src/components/admin/AdminQuickLinks.tsx:56 · sb=1 useQuery=1 mut=0 (árvore 9 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/admin/webhooks-alert-history`<br><sub>AppRoutes.tsx:288</sub> | `src/pages/admin/WebhookAlertHistoryPage.tsx`<br>lazyPages.ts:282 | admin | ⬛ | **SEM link/menu em todo src/** · sb=3 useQuery=3 mut=1 (árvore 10 arq.) |
| `/admin/webhooks-alert-settings`<br><sub>AppRoutes.tsx:289</sub> | `src/pages/admin/WebhookAlertSettingsPage.tsx`<br>lazyPages.ts:285 | admin | ⬛ | **SEM link/menu em todo src/** · sb=1 useQuery=1 mut=1 (árvore 9 arq.) |
| `/admin/retry-test-status`<br><sub>AppRoutes.tsx:290</sub> | `src/pages/RetryTestStatusPage.tsx`<br>lazyPages.ts:328 | admin | ✅ | link src/pages/RetryTestStatusPage.tsx:138 · sb=1 useQuery=1 mut=1 (árvore 8 arq.) |
| `/meus-pedidos/:id`<br><sub>AppRoutes.tsx:293</sub> | `src/pages/OrderDetailPage.tsx`<br>lazyPages.ts:331 | autenticado (explícito) | 🟨 | link src/pages/OrderDetailPage.tsx:39 · sb=1 useQuery=1 mut=0 (árvore 13 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/acompanhamento-pedidos`<br><sub>AppRoutes.tsx:296</sub> | `src/pages/AcompanhamentoPedidos.tsx`<br>lazyPages.ts:333 | autenticado (explícito) | 🟨 | menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=0 (árvore 9 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/acompanhamento-pedidos/:id`<br><sub>AppRoutes.tsx:297</sub> | `src/pages/AcompanhamentoPedidoDetalhe.tsx`<br>lazyPages.ts:334 | autenticado (explícito) | 🟨 | link src/components/layout/sidebar/sidebarMenuData.ts:42 · sb=1 useQuery=1 mut=0 (árvore 11 arq.) · somente leitura — nenhuma mutação/persistência na árvore |
| `/acesso-negado`<br><sub>AppRoutes.tsx:300</sub> | `src/pages/AccessDenied.tsx`<br>lazyPages.ts:27 | — | ✅ | redirect src/components/auth/ProtectedRoute.tsx:19 · sb=1 useQuery=1 mut=1 (árvore 3 arq.) |
| `*`<br><sub>AppRoutes.tsx:301</sub> | `src/pages/NotFound.tsx`<br>lazyPages.ts:26 | — | ✅ | rota de sistema (404) — src/pages/NotFound.tsx |

---

## 2. Páginas órfãs (não referenciadas por nenhuma rota nem por nenhum import)

Método: `find src/pages -name '*.tsx'` (174) menos todos os alvos de `from '@/pages/…'` **e** `from './…'` em todo `src/`.

| Arquivo | Linhas | Prova |
|---|---|---|
| `src/pages/ConversationalIntelligence.tsx` | 319 | O nome `ConversationalIntelligence` **aparece** em `AppRoutes.tsx:151`, mas o símbolo vem de `lazyPages.ts:73-75`, que importa **outro** arquivo: `import('@/pages/ConversationalIntelligenceHub')`. `grep -rn "@/pages/ConversationalIntelligence'\|'./ConversationalIntelligence'" src/` → **0 ocorrências**. Página completa (uploader, transcrição, diarização) sem nenhum consumidor. |
| `src/pages/RaceArena.tsx` | 3 | Re-export legado (`export { default } from './RaceArenaHub'`). `lazyPages.ts:208` importa `@/pages/RaceArenaHub` **diretamente**. `grep -rn "@/pages/RaceArena'" src/` → 0. (O hit `src/components/race/index.ts:1` refere-se a `src/components/race/RaceArena`, arquivo diferente.) |
| `src/pages/Index.test.tsx` | 181 | Arquivo de teste, não é página. Listado só para fechar o denominador 174. |

**Falsos positivos que verifiquei e descartei:** `src/pages/RaceArenaView.tsx` **não** é órfã — é importada por caminho relativo em `RaceArenaCloser.tsx:1` e `RaceArenaSDR.tsx:1`.

**Conclusão:** apenas **2 páginas órfãs reais** (`ConversationalIntelligence.tsx`, `RaceArena.tsx`) de 173 páginas. O `src/pages/` está muito mais limpo do que o número de rotas mortas sugere — o desperdício está na **navegação**, não nos arquivos.

---

## 3. Rotas inalcançáveis pela navegação (20)

Arquivos de menu/navegação que inspecionei integralmente:
- `src/components/layout/sidebar/sidebarMenuData.ts` (310 linhas) — **a única fonte do menu lateral**; consumido por `src/components/organisms/AppSidebar.tsx:42` (`getMainItems`/`getGroupedItems`/`systemItems`/`adminOnlyItems`), que é renderizado via `src/components/organisms/RoleAwareSidebar.tsx` → `src/components/templates/MainLayout.tsx:106`.
- `src/components/command/CommandPalette.tsx` (25 rotas, montado em `src/App.tsx:112`)
- `src/components/mobile/MobileDrawer.tsx`, `src/components/mobile/MobileNavigation.tsx` — **nenhuma URL literal**; não adicionam alcance
- `src/components/keyboard/NavigationHud.tsx` — **nenhuma URL**
- `src/hooks/useVoiceNavigation.ts:18-30` — só 4 rotas (`/dashboard`, `/vendas`, `/clientes`, `/pipeline`)
- `src/components/admin/AdminQuickLinks.tsx:32-80` — 19 links, renderizado em `src/pages/AdminDashboard.tsx:156`

| Rota | Página | Observação |
|---|---|---|
| `/abm` | `src/pages/AccountBasedSelling.tsx` | Duplicata funcional de `/engagement/abm` (`AccountBasedEngagement`), essa sim no menu (`sidebarMenuData.ts:67,132`) |
| `/fornecedores` | `src/pages/Fornecedores.tsx` | Só aparece em mapas de *prefetch*/título: `navigation/NavLink.tsx:37`, `hooks/useMobileNavigation.ts:34` — não são links |
| `/comparador-precos` | `src/pages/ComparadorPrecos.tsx` | Só em `navigation/Breadcrumbs.tsx:70` (mapa de rótulos) |
| `/bi-vendedor` | `src/pages/BIVendedor.tsx` | Só em `navigation/NavLink.tsx:17` (prefetch). Menu tem `/bi-sdr`, `/bi-closer`, `/bi-gestor` — o "BI Vendedor" ficou de fora |
| `/territorios` | `src/pages/Territorios.tsx` | Só em `analytics/RouteTracker.tsx:36` (mapa de títulos) |
| `/previsao-demanda` | `src/pages/PrevisaoDemanda.tsx` | Só em `hooks/useMobileNavigation.ts:35` (mapa de títulos) |
| `/relatorio-atividades` | `src/pages/RelatorioAtividades.tsx` | Zero ocorrências fora de `src/routes/` |
| `/analytics/emails` | `src/pages/EmailAnalyticsPage.tsx` | Zero ocorrências |
| `/perfil-gamer` | `src/pages/GamifiedProfilePage.tsx` | Zero ocorrências. Menu só tem `/gamificacao/badges` |
| `/desafios-diarios` | `src/pages/HistoricoDesafiosDiarios.tsx` | Zero ocorrências |
| `/admin/alertas-churn` | `src/pages/AdminAlertasChurn.tsx` | Zero ocorrências → arrasta junto `/admin/alertas-churn/historico`, que só é linkada de dentro dela (`AdminAlertasChurn.tsx:186`) — **morta por transitividade** |
| `/admin/fila-tarefas-automaticas` | `src/pages/AdminFilaTarefasAutomaticas.tsx` | Zero ocorrências |
| `/admin/regras-inatividade` | `src/pages/AdminRegrasInatividade.tsx` | Zero ocorrências (menu tem `/gatilhos-inatividade`, outra página) |
| `/admin/supressao-emails` | `src/pages/AdminSupressaoEmails.tsx` | Zero ocorrências (árvore de 30 arquivos com dados reais, inacessível) |
| `/admin/tarefas` | `src/pages/AdminTasksPage.tsx` | Zero ocorrências; não está em `adminOnlyItems` (`sidebarMenuData.ts:273-288`) nem em `AdminQuickLinks` |
| `/admin/quote-sync-inbound` | `src/pages/admin/AdminQuoteSyncInboundPage.tsx` | Zero ocorrências (as irmãs `/admin/quote-conversions`, `/admin/v4-callbacks`, `/admin/conexoes` estão em `AdminQuickLinks.tsx:68,40,39`) |
| `/admin/webhooks-alert-history` | `src/pages/admin/WebhookAlertHistoryPage.tsx` | Zero ocorrências |
| `/admin/webhooks-alert-settings` | `src/pages/admin/WebhookAlertSettingsPage.tsx` | Zero ocorrências |
| `/race-arena/tv` | `src/pages/RaceArenaTV.tsx` | Única menção é telemetria interna (`RaceArenaTV.tsx:113`), não um link |
| `/race-arena/spectator/:seasonId` | `src/pages/RaceSpectator.tsx` | Zero ocorrências — rota pública sem gerador de link |

### Link quebrado detectado
`src/components/command/CommandPalette.tsx:268` → `navigate('/desafios-semanais')`. **Essa rota não existe.** A rota real é `/desafios` (`AppRoutes.tsx:242`). O item "Desafios" da paleta de comandos cai em `NotFound` (`AppRoutes.tsx:301`).

### Rotas que só têm entrada frágil (não estão em nenhum menu)
- `/follow-up` (`AppRoutes.tsx:138`) — só alcançável por deep-link de resultado da busca semântica: `src/components/semantic/semanticSearchHelpers.ts:30` . A sub-rota `/follow-up/audit` tem link próprio (`src/components/follow-up/FollowUpHeader.tsx:50`) mas depende de chegar antes em `/follow-up`.
- `/analytics/closing-time`, `/analytics/deal-velocity`, `/analytics/evolution`, `/analytics/objections` — só via botão "expandir" dentro dos widgets: `analytics/ClosingTimeChart.tsx:108`, `analytics/DealVelocityChart.tsx:91`, `competitive/EvolutionChart.tsx:61`, `analytics/ObjectionsLibrary.tsx:224`.
- `/vendedor/:id` — só por template literal: `src/pages/Vendedores.tsx:212`, `components/vendedores/RankingGridItem.tsx:82`, `components/coaching/CoachingIntelligenceHub.tsx:149`, `VictoryFeedPage.tsx:109,167`.

---

## 4. Guardas de rota / RBAC

**Uma única implementação:** `src/components/auth/ProtectedRoute.tsx` (76 linhas).

| Mecanismo | Onde |
|---|---|
| Sessão | `ProtectedRoute.tsx:21` `useAuth()`; `:54-56` sem `user` → `<Navigate to="/auth" state={{from: location}}>` |
| Papel | `ProtectedRoute.tsx:22` `useUserRoles()` → `currentUserRole`, `isAdminOrManager` |
| admin **ou** manager | `ProtectedRoute.tsx:59-62`, via prop `requireAdminOrManager` |
| papel específico | `ProtectedRoute.tsx:65-73`, via prop `requiredRole` (aceita array; `:67` usa `.some(role => currentUserRole?.role === role)`) |
| Destino de negação | `ProtectedRoute.tsx:19` `fallbackPath = "/acesso-negado"` → rota em `AppRoutes.tsx:300` |
| Auditoria | `ProtectedRoute.tsx:28-46` insere em `access_denied_logs` (`user_id`, `attempted_path`, `user_role`, `required_role`, `user_agent`). **Medido em produção: 4 linhas na tabela.** |
| Estado de carregamento | `ProtectedRoute.tsx:49-51` — só bloqueia em `isLoadingCurrentRole` se a rota exigir papel (`needsRoleCheck`, `:25`) |

**Aplicação nas rotas** (`AppRoutes.tsx:70-78`): dois wrappers memoizados, `<Admin>` e `<Manager>`. Contagem sobre `AppRoutes.tsx`:
- `<Admin>` (requiredRole="admin"): **17** rotas
- `<Manager>` (requireAdminOrManager): **64** rotas
- `<ProtectedRoute>` explícito adicional (redundante — já estão dentro do `<ProtectedRoute>` de `:101`): 5 rotas (`/race-arena/tv`, `/relatorios/vendas`, `/meus-pedidos/:id`, `/acompanhamento-pedidos`, `/acompanhamento-pedidos/:id`)
- Sem role explícito (só autenticação global de `:101`): as demais
- **Fora de qualquer proteção:** `/auth` (`:85`), `/reset-password` (`:86`), `/embed/report/:token` (`:89`), `/race-arena/spectator/:seasonId` (`:95`)

### Achados de RBAC
1. **Guarda duplicada em 8 páginas.** Além do wrapper na rota, a própria página re-monta `<ProtectedRoute>`: `CoachingInteligente.tsx:7`, `CustomerSuccessHub.tsx:7`, `CustomerSuccess360.tsx:7`, `AutomacaoInteligente.tsx:7`, `AdminTasksPage.tsx:7` (`requiredRole="admin"`), etc. Funciona, mas é dobrado.
2. **A visibilidade do menu não é RBAC.** `AppSidebar.tsx:325` só esconde `adminOnlyItems` quando `userType === 'admin'`; itens `<Manager>` (ex.: `/analytics`, `/relatorios`, `/metas`) aparecem para qualquer papel e só são barrados no `ProtectedRoute`. O usuário vê o item, clica e é jogado em `/acesso-negado`.
3. **`RaceArenaTV` (`AppRoutes.tsx:92`) usa `<ProtectedRoute>` sem role** — qualquer autenticado abre a TV com dados de ranking.
4. **RBAC é 100% client-side.** A garantia real depende de RLS no Supabase — **fora do meu escopo**, ver o relatório de banco.

---

## 5. Contagem por classificação (denominador = 174 rotas)

| Classificação | Rotas | % |
|---|---|---|
| ✅ IMPLEMENTADO_TOTAL | **97** | 55,7% |
| 🟨 IMPLEMENTADO_PARCIAL | **48** | 27,6% |
| 🟦 SUGERIDO_OU_INICIADO | **9** | 5,2% |
| ⬛ MORTO_OU_ABANDONADO | **20** | 11,5% |
| **Total** | **174** | 100% |

Decomposição do 🟨 (48): **8** por dado fictício confirmado, **40** por serem somente leitura (zero mutação em toda a árvore de 2 níveis) — para páginas de relatório isso pode ser o comportamento correto; marquei 🟨 porque a regra exige persistência e eu não podia provar intenção.

Decomposição do 🟦 (9):

| Rota | Página | Por quê |
|---|---|---|
| `/onboarding-tracking` | `OnboardingTracking.tsx` | `useState` puro; comentário `:37` "Local state — can be migrated to DB later"; clientes fictícios `:41-68` |
| `/docs` | `Docs.tsx` (224 linhas) | Documentação estática |
| `/calendario` | `Calendario.tsx` | Wrapper de `components/calendar/ActivityCalendar` — meu probe de 2 níveis não achou supabase/useQuery na árvore; **não confirmei manualmente** |
| `/playbooks` | `Playbooks.tsx` | idem (`components/playbooks/PlaybooksManager`); a página usa `usePlaybooks()` só para `isLoading` (`Playbooks.tsx:9`) |
| `/inteligencia-compras` | `PurchaseIntelligence.tsx` | wrapper de `components/purchase-intelligence/PurchaseIntelligenceHub` |
| `/inteligencia` | `Intelligence.tsx` | wrapper de `components/intelligence/IntelligenceCockpit` |
| `/busca-inteligente` | `SmartSearch.tsx` | usa `useSemanticSearch` (hook próprio) — probe não alcançou a camada |
| `/race-arena/closer` | `RaceArenaCloser.tsx` (4 linhas) | wrapper de `./RaceArenaView` (importe relativo, fora do alcance do probe) — **na prática tem dados reais** (`RaceArenaView.tsx`: sb=11, q=9) |
| `/race-arena/sdr` | `RaceArenaSDR.tsx` (4 linhas) | idem |

> Aviso: os 🟦 são o grupo **menos confiável** desta auditoria. 6 dos 9 são wrappers finos cuja camada de dados pode estar 3+ níveis abaixo. Só `/onboarding-tracking` e `/docs` estão confirmados por leitura direta.

---

## 6. Dados fictícios encontrados (com `arquivo:linha`)

### Críticos — número de negócio falso exibido como real

| # | Local | O que |
|---|---|---|
| 1 | `src/lib/bi/mockData.ts:1-29` | `MOCK_CLIENT_STATS` (LTV R$125.000, ticket R$2.450, 5 pedidos com datas fixas) + `getMockIndustryTrends()` retornando **"MacBook Pro M3", "Dell XPS 15", "Monitor LG 34\" Curved", "Cadeira Herman Miller"** — produtos que não são do ramo de brindes promocionais + `getMockSeasonality()` gerando 12 meses de receita com `Math.sin`/`Math.cos` |
| 2 | `src/hooks/bi/useIndustryTrends.ts:10,20,28` | retorna os dados falsos sempre que faltar ramo, houver <3 empresas ou nenhum produto |
| 3 | `src/hooks/bi/useIndustryTrends.ts:72-73` | sazonalidade senoidal falsa quando dados reais são "insuficientes" |
| 4 | `src/hooks/bi/useClientBI.ts:27,39,40,45` | ticket médio, recência e "últimos pedidos" caem no mock |
| 5 | `src/hooks/bi/useClientVsIndustry.ts:39` | `client: 85, // Mock client value for now` — o benchmark "cliente vs setor" tem o lado do cliente cravado em 85 |
| 6 | `src/pages/FollowUpAudit.tsx:77-99` + `:121` | `mockLogs` com os leads inventados **"Mariana Oliveira"** e **"Ricardo Santos"**; `:121` faz `return [...mockLogs, ...(data \|\| [])]` — **sempre** mistura falso com real, mesmo com o banco respondendo |
| 7 | `src/pages/UsageAnalytics.tsx:74` | `login_count: Math.floor(Math.random() * 50) + 10, // Placeholder` — contagem de login aleatória por vendedor, redesenhada a cada render |
| 8 | `src/pages/UsageAnalytics.tsx:42-48` | comentário diz "Page views from route_analytics", mas a query é `supabase.from('sales').select('status')` — o gráfico "páginas mais vistas" na verdade mostra **status de vendas**. Ironia: `page_analytics` (a tabela real, alimentada por `lib/analytics.ts:92`) existe e tem dados |
| 9 | `src/components/sdr/SDRConversationInsights.tsx:6-18` | sentimento (65% positivo / 25% neutro / 10% negativo) e objeções ("Preço muito alto" 14, "Sem tempo" 9, …) totalmente hardcoded. Renderizado em `src/components/sdr/SDRDashboard.tsx:364` → rota `/sdr` |
| 10 | `src/components/sales/cadence/EliteCadenceAnalytics.tsx:55` | `efficiencyScore: 88, // Mock score for overall engine` → rota `/cadencias` (`src/pages/Cadencias.tsx:344`) |
| 11 | `src/components/pricing/DiscountOptimizer.tsx:23` | `// Mock elasticity logic` → rota `/pricing-intelligence` (`components/pricing/PricingIntelligenceHub.tsx:309`) |
| 12 | `src/components/security/GeoBlockingMap.tsx:9` | mapa mundi com `d: 'M150,150 L180,150 …'` — "Mock paths, in reality would be full world SVG" → rota `/seguranca` |
| 13 | `src/pages/OnboardingTracking.tsx:41-68` | clientes fictícios **"Empresa Alpha"** e **"Corp Beta"** como estado inicial; nada persiste |

### Cosméticos (aleatoriedade de UI, não de negócio) — não desclassificam a rota

| Local | O que |
|---|---|
| `src/pages/WorkflowsPage.tsx:125` | posição inicial de nó no canvas |
| `src/pages/MetasAtividades.tsx:56,57,59,61,86` | confete e emoji de celebração |
| `src/pages/Auth.tsx`, `Index.tsx`, `Pipeline.tsx`, `Notificacoes.tsx`, `Orcamentos.tsx`, `QuoteCadencesPage.tsx`, `RaceArenaHub.tsx`, `RaceArenaTV.tsx`, `Vendedores.tsx`, `Docs.tsx` | `Math.random()` em animação/partícula (detectado pelo probe como `rnd>=1`; **não abri um a um** — ver item (d)) |

### Componente morto com dados falsos
`src/components/profile/ProfilePerformanceCard.tsx:17-35` — "Nível 42 / Elite Ranger / Win Rate 68%" hardcoded, comentário `// Mock data for high-fidelity feel`. `grep -rn "ProfilePerformanceCard" src/` → **só o próprio arquivo**. Não é renderizado em lugar nenhum.

### Buscas que voltaram limpas
- `grep -rnE "//\s*(TODO|FIXME|HACK|XXX)" src/pages/` → **0 ocorrências**
- `grep -rniE "em breve|coming soon|não implementado" src/pages/` → **0** (todos os hits de `placeholder` são `placeholder=` de `<Input>`/`<SelectValue>`)

---

## 7. Uso real medido no banco de produção

`SELECT route, count(*), count(DISTINCT salesperson_id), max(created_at) FROM page_analytics GROUP BY route`
(tabela alimentada por `src/lib/analytics.ts:92`, via `components/analytics/RouteTracker.tsx` montado em `components/templates/MainLayout.tsx:89`)

| Rota | Views | Usuários | Último acesso |
|---|---|---|---|
| `/dashboard/visao-geral` | 29 | 1 | 2026-08-04 |
| `/dashboard/performance` | 28 | 1 | 2026-08-04 |
| `/` | 8 | 1 | 2026-08-04 |
| `/workflows` | 2 | 1 | 2026-08-04 |
| `/dashboard/competicao` | 1 | 1 | 2026-08-04 |
| `/dashboard/inteligencia` | 1 | 1 | 2026-08-04 |
| `/admin/conexoes` | 1 | 1 | 2026-08-04 |
| `/automacoes` | 1 | 1 | 2026-08-15 |
| `/pipeline` | 1 | 1 | 2026-07-23 |
| `/relatorios` | 1 | 1 | 2026-08-04 |
| `/workflow-builder` | 1 | 1 | 2026-08-15 |
| `/admin` | 1 | 1 | 2026-07-23 |

**Total: 75 linhas, 2 usuários distintos, 12 rotas de 174 (6,9%), janela 23/07/2026 → 15/08/2026.**
Para contraste, no mesmo banco: `salespeople` = 18, `sales` = 954, `clients` = 100, `access_denied_logs` = 4.

Leitura honesta: **não há tráfego real de usuários neste app**. O front-end tem 174 rotas e 37.193 linhas de páginas, e a telemetria registra 75 pageviews de 2 pessoas em 3 semanas. Isso não prova que as rotas estão quebradas — prova que **não há como afirmar "em uso" para 162 delas**.

---

## 8. O que eu NÃO consegui verificar

1. **Se as páginas realmente renderizam.** Não executei build, não rodei a aplicação, não abri navegador. Todas as classificações são de análise estática + consulta ao banco.
2. **Camada de dados abaixo do 2º nível de imports.** Meu probe resolve `page → @/components|@/pages` e depois `→ @/components|@/hooks`. Imports relativos (`./Foo`) e o 3º nível em diante ficaram fora. Isso afeta principalmente os 9 🟦 — 6 deles são wrappers finos que quase certamente têm dados reais mais fundo (`/race-arena/closer` e `/race-arena/sdr` eu **sei** que têm, via `RaceArenaView.tsx`).
3. **Se as 40 rotas 🟨 "somente leitura" deveriam persistir algo.** Zero mutação pode ser correto (relatório) ou uma lacuna (formulário que não salva). Não abri as 40.
4. **Todos os `Math.random()` do repositório.** Verifiquei os 7 de `src/pages/` linha a linha. Os detectados dentro das árvores de componentes (`rnd>=1` no probe) eu **não** classifiquei individualmente entre cosmético e dado de negócio.
5. **Se as 20 rotas ⬛ são intencionais.** Algumas podem ser acessadas por bookmark, por link externo, ou estar aguardando entrada de menu. Só posso afirmar: **nenhum código em `src/` navega até elas**.
6. **Se `access_denied_logs` (4 linhas) reflete tentativas reais** ou testes — não inspecionei as linhas.
7. **RLS / segurança de verdade.** O RBAC aqui é 100% client-side. Se as políticas do Supabase não espelharem `requiredRole`/`requireAdminOrManager`, a proteção é decorativa. **Fora do meu escopo** — precisa do relatório de banco de dados.
8. **Rotas dinâmicas com parâmetro.** `/dashboard/:section` aceita qualquer string; não enumerei quais `section` o `Index.tsx` de fato trata (o menu usa 6: `visao-geral`, `performance`, `analises`, `competicao`, `inteligencia`, `engajamento` — `sidebarMenuData.ts:176-181`).
9. **Se `/relatorios-custom` e `/relatorios-custom/:id` (mesmo componente, `AppRoutes.tsx:203-204`) divergem em comportamento.** Não li o `CustomReports.tsx` inteiro.
