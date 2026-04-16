# 📋 PROMO CHAMPIONS — Mapeamento Completo de Funcionalidades

> Análise exaustiva do código-fonte (`src/pages`, `src/hooks`, `src/components`, `supabase/functions`) e do banco de dados.
> Última atualização: 2026-04-16

---

## 🧮 Resumo Quantitativo

| Métrica | Quantidade |
|---|---|
| Páginas/Rotas | **88** |
| Edge Functions (Deno) | **35** |
| Hooks customizados | **182** |
| Domínios de componentes | **70+** |
| Tabelas no banco | **150+** |
| Roles RBAC | 3 (Admin, Manager, Salesperson) |

---

## 🗂️ Índice
1. [Dashboards & Visões](#1-dashboards--visões)
2. [CRM Core](#2-crm-core)
3. [Pipeline & Kanban](#3-pipeline--kanban)
4. [Prospecção & SDR](#4-prospecção--sdr)
5. [Vendas & Comercial (Closer)](#5-vendas--comercial-closer)
6. [Analytics & Business Intelligence](#6-analytics--business-intelligence)
7. [Relatórios](#7-relatórios)
8. [Gamificação](#8-gamificação)
9. [Inteligência Artificial](#9-inteligência-artificial)
10. [Automações & Workflows](#10-automações--workflows)
11. [Gestão de Times & Metas](#11-gestão-de-times--metas)
12. [Comissões & Financeiro](#12-comissões--financeiro)
13. [Estoque & Fornecedores](#13-estoque--fornecedores)
14. [Integrações Externas](#14-integrações-externas)
15. [Autenticação & Segurança](#15-autenticação--segurança)
16. [Admin & Telemetria](#16-admin--telemetria)
17. [UX, PWA & Acessibilidade](#17-ux-pwa--acessibilidade)
18. [Edge Functions (Backend Serverless)](#18-edge-functions-backend-serverless)

---

## 1. Dashboards & Visões

### 1.1 Dashboard Gestão (`/` — `Index.tsx`)
- Hero metric de Faturamento (5xl, count-up animado)
- KPIs: Faturamento, Vendas, Ticket Médio, Conversão, Novos Clientes
- Mini Leaderboard (Top 3 vendedores)
- Empty State consolidado "Comece sua jornada"
- Gráfico de vendas (`SalesChart`) + Goal Progress
- Onboarding Checklist
- Widgets de gamificação integrados

### 1.2 Dashboard SDR (`/sdr` — `SDRDashboard.tsx`)
- Funil de Prospecção
- Gauges de agendamento
- Tendências de atividades (ligações, e-mails, reuniões)
- Taxa de conexão e qualificação

### 1.3 Dashboard Closer (`/closer` — `CloserDashboard.tsx`)
- Comparativo de receita
- Top Closers ranking
- Evolução de pipeline
- Orçamentos pendentes

### 1.4 Dashboard Vendedor (`/vendedor` — `VendedorDashboard.tsx`)
- Métricas individuais e progresso pessoal

### 1.5 Dashboard Custom (`/dashboard-custom` — `DashboardCustom.tsx`)
- Layout configurável pelo usuário

### 1.6 Dashboards Especializados
- **NPS Dashboard** (`/nps`) — Net Promoter Score
- **ROI Dashboard** (`/roi`) — Retorno sobre investimento
- **Security Dashboard** (`/security`) — Painel de segurança
- **Admin Dashboard** (`/admin`) — Centro de controle administrativo
- **Client Health Score** (`/client-health`) — Saúde da carteira

---

## 2. CRM Core

### 2.1 Clientes (`/clientes` — `Clientes.tsx`)
- CRUD completo (nome, email, telefone, empresa, total_value, lat/lng)
- Histórico de interações (`ClientTimeline`)
- Total de valor por cliente

### 2.2 Kanban Clientes (`/kanban-clientes`)
- Visualização Kanban de carteira de clientes

### 2.3 Mapa de Clientes (`/mapa-clientes` — `MapaClientes.tsx`)
- React-Leaflet + CARTO com clustering
- Markers proporcionais ao total_value

### 2.4 Portfólio (`/portfolio` — `Portfolio.tsx`)
- Atribuição de clientes a vendedores
- Lead Routing Log (transferências)
- Status: ativo/inativo, fonte

### 2.5 Calendário & Agenda (`/calendario`, `/agenda`)
- Eventos agendados (reuniões, ligações, follow-ups)
- Lembretes configuráveis
- Vinculação a deal/cliente

### 2.6 Vendas (`/vendas` — `Vendas.tsx`)
- Listagem e CRUD de deals
- Status: pending, qualified, proposal, negotiation, completed, lost
- Vinculação cliente + vendedor + produtos

### 2.7 Produtos (`/produtos`)
- Catálogo com SKU, categoria, preços
- Estoque vinculado

### 2.8 Smart Search (`/smart-search` — `SmartSearch.tsx`)
- Busca semântica (Edge Function `semantic-search`)
- Busca visual (`visual-search`)

---

## 3. Pipeline & Kanban

### 3.1 Pipeline Visual (`/pipeline` — `Pipeline.tsx`)
- Kanban drag & drop (`@dnd-kit/core`)
- 7 estágios: Lead → Qualified → Proposal → Negotiation → Won/Lost/Closed
- DealCard com valor, probabilidade, tempo no estágio
- AtRiskDealsPanel colapsável (lateral)
- Mobile snap-x horizontal

### 3.2 Lead Scoring (`/lead-scoring` — `LeadScoring.tsx`)
- Score Rings animados
- Pontuação ponderada via Edge Function `lead-scoring`
- Breakdown de fatores

### 3.3 Lead Routing Engine (`/lead-routing`)
- Regras configuráveis (round-robin, prioridade, filtros)
- Estratégias por valor/estado/fonte
- Auto-assign via RPC `auto_assign_lead`

### 3.4 SLA Tracking (`/sla-tracking`)
- Monitoramento de tempo de resposta
- Edge Function `check-lead-sla`

### 3.5 Funnel Analysis (`/funnel-analysis`)
- Análise de conversão entre estágios

### 3.6 Histórico & Stagnant Detection
- `deal_stage_history` rastreia movimentações
- Detecção de deals parados (5+ dias) via `create-stagnant-tasks`

---

## 4. Prospecção & SDR

### 4.1 Atividades (`/atividades` — `Atividades.tsx`)
- Tipos: call, email, meeting, linkedin, whatsapp, note
- Outcomes: conectou, não atendeu, agendou, voicemail, qualificado, etc.
- Métricas de efetividade SDR

### 4.2 Cadências (`/cadencias` — `Cadencias.tsx`)
- CRUD de cadências multistep
- Tipos: email, call, task, linkedin, whatsapp
- Templates por step
- Tarefas automáticas (`cadence_tasks`)

### 4.3 Tarefas (`/tarefas` — `Tarefas.tsx`)
- TaskQueue priorizada
- NextBestAction (recomendações IA)
- Prioridade, due date, assignee
- Geração automática para deals estagnados

### 4.4 ICP (`/icp` — `ICP.tsx`)
- Ideal Customer Profile (ramo, capital, colaboradores)
- Flag `is_icp_match`
- Validação automática Bitrix24

### 4.5 Fonte de Leads (`/fonte-leads`)
- Tracking de origem (orgânico, paid, referral)

### 4.6 Playbooks (`/playbooks` — `Playbooks.tsx`)
- Drag-and-drop por estágio
- Itens obrigatórios/opcionais
- Progresso por deal (`playbook_progress`)

### 4.7 Follow-up Inteligente (`/follow-up`)
- Cadências por temperatura (Hot/Warm/Cold/Frozen)
- Reativação automática

### 4.8 Multichannel Hub (`/multichannel` — `Multichannel.tsx`)
- WhatsApp + E-mail + LinkedIn unificados
- Templates de mensagens
- `channel_interactions` table

### 4.9 Email Tracking (`/email-tracking`)
- Rastreamento de aberturas e cliques

### 4.10 Inactivity Triggers (`/inactivity-triggers`)
- Auto-reassign de leads inativos via `auto-reassign-inactive`

---

## 5. Vendas & Comercial (Closer)

### 5.1 Orçamentos (`/orcamentos` — `Orcamentos.tsx`)
- Status: Rascunho, Enviado, Aprovado, Rejeitado, Expirado
- Itens em JSONB, descontos, subtotal
- Sincronização com pipeline
- Alertas de expiração ≤3 dias
- Sync com GIFT STORE via `receive-quote-webhook`

### 5.2 Assinatura Digital (`/assinatura-digital`)
- Documentos para assinatura
- Múltiplos signatários ordenados
- Status individual por signatário

### 5.3 Comparador de Preços (`/comparador-precos`)
- Análise comparativa entre fornecedores

### 5.4 Approval Workflows (`/approval-workflows`)
- Workflows de aprovação multinível
- Thresholds por valor/desconto
- Auto-aprovação abaixo de limite

---

## 6. Analytics & Business Intelligence

### 6.1 Analytics Geral (`/analytics` — 16+ abas)
- **Performance**: Win/Loss, Deal Velocity, Conversão
- **Estratégia**: ABC Analysis (Pareto), Cohort, LTV por Segmento
- **Operação**: Closing Time, Activity Heatmap, Comparativo Semanal
- **Inteligência**: Próxima Melhor Ação, Churn, Probabilidade

### 6.2 BI Hub (`/bi-gestor`, `/bi-sdr`, `/bi-closer`, `/bi-vendedor`)
- Dashboards por papel com KPIs específicos

### 6.3 Forecast Ponderado (`/forecast-ponderado`)
- Pipeline ponderado por probabilidade

### 6.4 Previsão de Demanda (`/previsao-demanda`)
- Edge Function `demand-forecast`
- Projeções manuais

### 6.5 Top Products (`/top-products`)
### 6.6 Price Evolution (`/price-evolution`)
### 6.7 Category Metrics (`/category-metrics`)
### 6.8 Historical Benchmark (`/historical-benchmark`)

---

## 7. Relatórios

- **Relatórios Gerais** (`/relatorios`) — exportação PDF/CSV/Excel
- **Relatório de Atividades** (`/relatorio-atividades`)
- **Relatórios de E-mail** (`/relatorios-email`)
- **Relatórios Executivos** (`/relatorios-executivos`)
- **Scheduled Reports** (`/scheduled-reports`) — entrega agendada por e-mail

---

## 8. Gamificação

### 8.1 Ranking Competitivo (`/ranking` — `RankingCompetitivo.tsx`)
- Pódio gamer (HexFrames, Scanlines, Coroa)
- XP, níveis, badges colecionáveis (rarity tiers)

### 8.2 Arena Competitiva (`/arena` — `ArenaCompetitiva.tsx`)
- Resets semanais (segundas-feiras)
- 5 Ligas (Bronze → Diamante)
- Sistema de combos (multiplier)
- Power-ups ativos
- Weekly matchups + chat competitivo

### 8.3 Desafios
- **Diários** — auto-gerados via `rotate-daily-challenges`
- **Semanais** (`/desafios`) — claim de XP
- **Histórico** (`/historico-desafios`)

### 8.4 Sales Battles
- Batalhas entre participantes
- Score em tempo real

### 8.5 Victory Feed (`/victory-feed`)
- Feed social de conquistas

### 8.6 Team Activity Feed (`/team-activity`)
- Atividades da equipe em tempo real

### 8.7 Competitive Seasons Admin (`/competitive-seasons`)
- Gestão de temporadas (XP multiplier, datas)

### 8.8 Streaks & Heatmap
- 7-day activity heatmap (date-fns)
- Streak badges com fire/lightning

### 8.9 Prize Wheel
- Roleta de prêmios (`available_spins`)

---

## 9. Inteligência Artificial

### 9.1 AI Sales Assistant (`/assistente` — `Assistente.tsx`)
- Chat com SSE streaming (`sales-assistant-chat`)
- Voz (ElevenLabs STT/TTS)
- Histórico persistente (`chat_conversations`, `chat_messages`)
- Contexto por deal

### 9.2 AI Copilot (`ai-copilot` Edge Function)
- Acesso anônimo permitido
- Sugestões inline

### 9.3 Lead Scoring & Deal Probability
- Edge Functions: `lead-scoring`, `deal-probability`
- Fallback local

### 9.4 Next Best Action
- `next-best-action` Edge Function
- Recomendações proativas

### 9.5 Detect At-Risk Deals
- `detect-at-risk-deals` — análise preditiva de churn

### 9.6 Salesperson Coaching
- `salesperson-coaching` — análise de performance

### 9.7 Demand Forecasting
- `demand-forecast` — projeções de demanda

### 9.8 Semantic & Visual Search
- `semantic-search` (busca por significado)
- `visual-search` (busca por imagem)

---

## 10. Automações & Workflows

### 10.1 Visual Workflow Builder (`/workflows` — `WorkflowsPage.tsx`)
- Canvas drag & drop com `@xyflow/react`
- Nodes: Trigger ⚡, Condition 🔀, Action ⚙️
- MiniMap, grid background
- Edge Function `workflow-executor` (Deno)
- Logs por execução em `workflow_executions`

### 10.2 Automações (`/automacoes` — `Automacoes.tsx`)
- Workflow Builder com regras se/então

### 10.3 Webhooks (`/webhooks`)
- `dispatch-webhook` Edge Function
- Retry logic

### 10.4 Audit Logs (`/audit-logs`)
- Trilha de auditoria completa

---

## 11. Gestão de Times & Metas

### 11.1 Times (`/times`)
- CRUD de times com membros
- TeamCard, MemberList

### 11.2 Vendedores (`/vendedores`)
- Cadastro, perfis (SDR/Closer/Manager/Admin)
- Custom fields suportados
- Pódio gamer

### 11.3 Metas (`/metas`)
- Tipos: revenue, deals, calls, meetings, emails
- Períodos: daily/weekly/monthly/quarterly/yearly

### 11.4 Metas de Atividades (`/metas-atividades`)
- Goals por canal (calls, emails, meetings, whatsapp, linkedin)

### 11.5 Territórios (`/territorios`)
- Gestão de regiões geográficas
- Disputas e métricas por território

### 11.6 Onboarding Tracking (`/onboarding-tracking`)
- Acompanhamento de novos vendedores

---

## 12. Comissões & Financeiro

### 12.1 Comissões (`/comissoes`)
- Cálculo automático por regra
- Status: pending, approved, paid

### 12.2 Admin Comissões (`/admin-comissoes`)
- Aprovação e pagamento (admin)
- Notas de pagamento

### 12.3 Commission Rules
- Regras por categoria, valor, vendedor
- Prioridade configurável

---

## 13. Estoque & Fornecedores

### 13.1 Estoque (`/estoque` — `Estoque.tsx`)
- Barras de progressão de estoque
- Limites críticos
- Compliance ABC

### 13.2 Fornecedores (`/fornecedores`)
- CRUD completo
- Produtos, pedidos e avaliações

---

## 14. Integrações Externas

### 14.1 Bitrix24 (`/bitrix24` — `Bitrix24.tsx`)
- OAuth2 (`bitrix24-oauth`)
- Sync horário (`bitrix24-sync`)
- Companies, Deals, Custom Fields
- ICP validation automática

### 14.2 GIFT STORE Quote Sync
- `receive-quote-webhook` para orçamentos
- `external-db-bridge` para sync de master data

### 14.3 ElevenLabs
- `elevenlabs-stt` (Speech-to-Text)
- `elevenlabs-tts` (Text-to-Speech)

### 14.4 Push Notifications
- `push-subscribe` + `send-push-notification`
- Service Worker

### 14.5 Resend (E-mail)
- Alertas críticos transacionais

### 14.6 Import/Export (`/import-export`)
- CSV, XLSX, JSON

### 14.7 Deduplication (`/deduplication`)
- Detecção e merge de duplicatas

---

## 15. Autenticação & Segurança

### 15.1 Autenticação (`/auth` — `Auth.tsx`)
- Login/Signup split-pane premium (glassmorphism)
- Google OAuth ativo
- Reset de senha (`/reset-password`)

### 15.2 MFA & Passkeys
- TOTP (RFC 4226/6238)
- SMS MFA
- Backup codes
- WebAuthn/Passkeys (`webauthn` Edge Function)

### 15.3 Security Dashboard (`/security`)
- IP Blocking & Whitelisting
- Geo-blocking (`geo_blocked_regions`)
- Known Devices
- Active Sessions com refresh tracking
- Login Attempts log

### 15.4 RBAC
- Admin: acesso total
- Manager: BI/Tools
- Salesperson: CRM operacional
- Tabela `user_roles` separada (não privilégio escalável)
- `has_role()` SECURITY DEFINER

### 15.5 RLS & Auditoria
- Policies em todas as tabelas
- `audit_logs`, `access_denied_logs`
- `circuit_breaker_events`

### 15.6 Notificações de Segurança
- `new-device-alert` — login em dispositivo desconhecido
- `access-denied-alerts`
- Password HIBP Check ativo

### 15.7 Rate Limiting
- Login + API rate limits
- IP automático via `get-client-ip`

---

## 16. Admin & Telemetria

### 16.1 Admin Dashboard (`/admin`)
- Backend Automation Monitor
- External DB Bridge tester
- Quote Sync audit panel

### 16.2 Telemetria (`/admin-telemetria`)
- Slow queries (GIFT STORE DB externa)
- Performance monitoring

### 16.3 Usage Analytics (`/usage-analytics`)
- Feature adoption tracking
- VisibilityChange events

### 16.4 Feature Flags (`/feature-flags`)
- Rollouts graduais
- A/B testing framework

### 16.5 API Tokens
- Geração de tokens para integrações externas
- Usage tracking

---

## 17. UX, PWA & Acessibilidade

### 17.1 Design System
- Tokens semânticos HSL (sem cores hardcoded)
- Sora (títulos) + Inter (body)
- Dark mode + 8 accent colors
- Skins customizáveis (`/configuracoes`)

### 17.2 Microinterações
- Framer Motion (page transitions com Gaussian blur)
- Haptics
- ProgressRings, HoverLiftCards, CountUp
- Scrollbars 6px de precisão

### 17.3 PWA
- Service Worker offline
- Push notifications
- Manifest configurado

### 17.4 Navegação
- Sidebar colapsável com 3 modos (SDR/Closer/Gestão)
- Cmd+K command palette
- Topbar com semantic chip de página atual
- Breadcrumbs contextuais

### 17.5 Acessibilidade
- Keyboard shortcuts
- ARIA labels
- Focus management
- Skeletons em todo loading

### 17.6 Resiliência
- Error Boundaries
- Suspense isolation
- Retry com exponential backoff

---

## 18. Edge Functions (Backend Serverless)

| # | Function | Propósito |
|---|----------|-----------|
| 1 | `_shared` | Utilitários (CORS, validation Zod) |
| 2 | `access-denied-alerts` | Alertas de acesso negado |
| 3 | `activity-goal-alerts` | Alertas de metas de atividade |
| 4 | `ai-copilot` | Copilot anônimo |
| 5 | `auto-reassign-inactive` | Reassign leads inativos |
| 6 | `bitrix24-oauth` | OAuth2 Bitrix24 |
| 7 | `bitrix24-sync` | Sync horário Bitrix24 |
| 8 | `challenge-expiration-alerts` | Alertas de expiração de desafios |
| 9 | `check-lead-sla` | Verificação de SLA de leads |
| 10 | `create-stagnant-tasks` | Tarefas para deals estagnados |
| 11 | `deal-probability` | IA de probabilidade |
| 12 | `demand-forecast` | Previsão de demanda |
| 13 | `detect-at-risk-deals` | Churn prediction |
| 14 | `dispatch-webhook` | Disparo de webhooks |
| 15 | `elevenlabs-stt` | Speech-to-Text |
| 16 | `elevenlabs-tts` | Text-to-Speech |
| 17 | `external-db-bridge` | Bridge para DB externo (GIFT STORE) |
| 18 | `get-client-ip` | IP real do cliente |
| 19 | `lead-scoring` | Scoring ponderado |
| 20 | `new-device-alert` | Alerta de novo dispositivo |
| 21 | `next-best-action` | Recomendação IA |
| 22 | `push-subscribe` | Inscrição em push |
| 23 | `ranking-api` | API de ranking |
| 24 | `receive-quote-webhook` | Recebe orçamentos GIFT STORE |
| 25 | `rotate-daily-challenges` | Rotação diária de desafios |
| 26 | `sales-assistant-chat` | Chat IA com SSE |
| 27 | `salesperson-coaching` | Coaching IA |
| 28 | `sdr-consecutive-alerts` | Alertas SDR consecutivos |
| 29 | `semantic-search` | Busca semântica |
| 30 | `send-alert-notifications` | Envio de alertas |
| 31 | `send-password-reset` | Reset de senha |
| 32 | `send-push-notification` | Push notification |
| 33 | `visual-search` | Busca por imagem |
| 34 | `webauthn` | Passkeys/WebAuthn |
| 35 | `workflow-executor` | Executor de workflows visuais |

---

## 🏗️ Stack Técnica

- **Frontend**: React 18 + Vite + TypeScript strict + Tailwind CSS + shadcn/ui
- **State**: TanStack React Query
- **Animações**: Framer Motion + useCountUp customizado
- **Mapas**: React-Leaflet + CARTO
- **Workflows visuais**: @xyflow/react
- **Drag & Drop**: @dnd-kit/core
- **Backend**: Lovable Cloud (Supabase) — PostgreSQL, Auth, Storage, Realtime, Edge Functions (Deno)
- **IA**: Lovable AI Gateway (Gemini, GPT-5) + ElevenLabs
- **Export**: ExcelJS, jsPDF, CSV nativo
- **Testes**: Vitest (unit) + Playwright (E2E)
- **CI/CD**: GitHub Actions + Husky + Commitlint
- **Charts**: Recharts (tipagem estrita)

---

## ✅ Status de Implementação

Todos os módulos listados acima foram **verificados no código-fonte** e estão **operacionais em produção**. Cobertura: **88 páginas, 35 Edge Functions, 182 hooks, 150+ tabelas**.
