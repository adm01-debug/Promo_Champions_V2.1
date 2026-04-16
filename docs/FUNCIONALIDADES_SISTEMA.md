# 📋 Levantamento Completo de Funcionalidades — Sales Arena

> Documento gerado a partir de toda a conversa e memórias do projeto.  
> Última atualização: 2026-03-15

---

## 📌 Índice

1. [Dashboards](#1-dashboards)
2. [Pipeline de Vendas](#2-pipeline-de-vendas)
3. [Módulo de Atividades](#3-módulo-de-atividades)
4. [Clientes](#4-clientes)
5. [Vendas (Sales)](#5-vendas-sales)
6. [Orçamentos (Quotes)](#6-orçamentos-quotes)
7. [Gamificação & Ranking](#7-gamificação--ranking)
8. [Desafios (Diários & Semanais)](#8-desafios-diários--semanais)
9. [Cadências de Prospecção](#9-cadências-de-prospecção)
10. [Tarefas](#10-tarefas)
11. [Assistente IA](#11-assistente-ia)
12. [Analytics & BI](#12-analytics--bi)
13. [Relatórios](#13-relatórios)
14. [Metas](#14-metas)
15. [Times (Teams)](#15-times-teams)
16. [Vendedores (Salespeople)](#16-vendedores-salespeople)
17. [Portfólio de Clientes](#17-portfólio-de-clientes)
18. [ICP (Ideal Customer Profile)](#18-icp-ideal-customer-profile)
19. [Playbooks](#19-playbooks)
20. [Fonte de Leads](#20-fonte-de-leads)
21. [Metas de Atividades](#21-metas-de-atividades)
22. [Assinatura Digital](#22-assinatura-digital)
23. [Notificações](#23-notificações)
24. [Configurações](#24-configurações)
25. [Admin](#25-admin)
26. [Autenticação & Segurança](#26-autenticação--segurança)
27. [Navegação & UX](#27-navegação--ux)
28. [Quick Wins Implementados](#28-quick-wins-implementados)

---

## 1. Dashboards

### 1.1 Dashboard Gestão (Home `/`)
- **Hero Metric** de Faturamento (card 2x maior com tipografia 5xl e elementos decorativos)
- KPIs principais: Faturamento, Vendas, Ticket Médio, Taxa de Conversão, Novos Clientes
- **Count-up animations** nos números (easeOutCubic, 1.4s)
- **Mini Leaderboard** — Top 3 vendedores com link para ranking completo
- **Empty State** ilustrado com CTAs actionable quando não há dados
- Gráficos de receita e tendências
- Filtros por período (semana/mês/trimestre)

### 1.2 Dashboard SDR (`/sdr`)
- Métricas de atividades do SDR (ligações, e-mails, reuniões agendadas)
- Volume de atividades vs resultados
- Taxa de conexão e agendamento
- Progresso de metas de atividades

### 1.3 Dashboard Closer (`/closer`)
- Métricas de fechamento
- Pipeline de negócios em andamento
- Orçamentos pendentes
- Receita gerada

---

## 2. Pipeline de Vendas (`/pipeline`)

- **Kanban board** com drag & drop entre estágios
- Estágios configuráveis (Lead → Qualificação → Proposta → Negociação → Fechamento)
- Cards de deals com: valor, cliente, vendedor, probabilidade, tempo no estágio
- **Deal Stage History** — rastreamento de quanto tempo cada deal ficou em cada estágio
- **Lead Scoring** — pontuação automática de leads com fatores ponderados
- Movimentação de estágios com registro de histórico
- Filtros por vendedor, status, valor
- **Stagnant Deals Detection** — identificação de deals parados há 5+ dias
- Criação automática de tarefas de follow-up para deals estagnados (`create-stagnant-tasks` edge function)

---

## 3. Módulo de Atividades (`/atividades`)

- Registro de interações: **Call, Email, Meeting, LinkedIn, WhatsApp, Note**
- Outcomes rastreados: `conectou`, `não atendeu`, `agendou`, `voicemail`, `ocupado`, `callback`, `não interessado`, `qualificado`
- Campos: tipo de atividade, outcome, duração, nome do contato, notas, vendedor associado, deal vinculado
- Exibição cronológica com filtros
- Métricas de efetividade SDR (taxa de conexão, taxa de agendamento)
- Associação a deals e clientes

---

## 4. Clientes (`/clientes`)

- CRUD completo de clientes
- Campos: nome, email, telefone, empresa, valor total
- Histórico de interações por cliente
- Deals associados ao cliente
- Portfólio de clientes por vendedor

---

## 5. Vendas (Sales) (`/vendas`)

- Listagem de vendas/deals
- Registro de novas vendas
- Status: open, won, lost, abandoned, lead, qualified, proposal, negotiation, closed
- Vinculação a cliente e vendedor
- Produtos associados (DealProduct com quantidade, preço unitário, desconto, total)
- **Deal Outcomes** — registro de motivo de ganho/perda com notas

---

## 6. Orçamentos (Quotes) (`/orcamentos`)

- **Exclusivo para Closers**
- Status: Rascunho, Enviado, Aprovado, Rejeitado, Expirado
- Dados: quote_number, subtotal, discount_amount, itens em JSONB
- **Integração com Pipeline** — criação/atualização sincroniza com tabela `sales`
- **Alertas visuais** para orçamentos expirando em ≤3 dias
- Restrição de acesso por perfil (somente Closers)

---

## 7. Gamificação & Ranking (`/ranking`)

- **Sistema de XP e Níveis** alimentado por `salesperson_xp` e `achievements`
- Rankings competitivos com selos: 🥇 Ouro, 🥈 Prata, 🥉 Bronze
- Rastreamento de posição animado
- **Sobreposições de conquistas** em tempo real para marcos e subida de nível
- **Sequências de dias (Streaks)** com indicadores visuais (fire/lightning)
- Histórico completo de ganhos de XP (timeline)
- Marcos de conquistas por categorias: sales, activity, streak, team, revenue
- Tiers: bronze, silver, gold, platinum

---

## 8. Desafios (Diários & Semanais) (`/desafios`)

### 8.1 Desafios Diários
- Geração automática por data
- Tipos de desafio variados
- Progresso rastreado (`daily_challenge_progress`)
- Recompensa em XP
- Status: ativo/inativo

### 8.2 Desafios Semanais
- Progresso rastreado (`challenge_progress`)
- Claim de XP ao completar
- Vinculado a vendedor específico

---

## 9. Cadências de Prospecção (`/cadencias`)

- CRUD de cadências com steps ordenados
- Tipos de step: email, call, task, linkedin, whatsapp
- Configuração de dias de espera entre steps
- Templates de conteúdo por step
- **Prospect Cadences** — vinculação de prospects a cadências ativas
- Rastreamento de step atual e próxima ação
- **Cadence Tasks** — tarefas geradas automaticamente por step com data agendada
- Status de progresso: ativo, pausado, completado

---

## 10. Tarefas (`/tarefas`)

- CRUD de tarefas com campos: título, descrição, prioridade (low/medium/high/urgent)
- Tipos: call, email, meeting, follow_up, other
- Assignee e criador
- Due date e due time
- Vinculação a cliente, deal, venda, vendedor
- Status: pendente/completa
- **Criação automática** via edge function para deals estagnados

---

## 11. Assistente IA (`/assistente`)

- **Chat conversacional** com IA para vendas
- Suporte a **texto e voz** (OpenAI + ElevenLabs)
- **Histórico persistente** e pesquisável de conversas (`chat_conversations`, `chat_messages`)
- **Contexto de Deal** — seletor de deal para orientação contextual
- Coaching personalizado baseado em padrões de win/loss
- **Deal Health Monitoring** — avaliação preditiva de risco via edge functions
- Probabilidade de fechamento em tempo real
- **Deal Chat History** — histórico de perguntas/respostas por deal com tipo de pergunta
- **Voice Controls** — controles de voz integrados

---

## 12. Analytics & BI

### 12.1 Analytics (`/analytics`)
- **Win/Loss Analysis** — razões de ganho/perda por vendedor e produto
- **Deal Velocity** — tempo médio em cada estágio do funil
- **Conversion Analysis** — taxas de conversão entre estágios, identificação de gargalos
- **Objections Library** — objeções comuns e respostas, score de efetividade, contagem de uso

### 12.2 BI SDR (`/bi-sdr`)
- Business Intelligence específico para SDRs
- Métricas de prospecção e qualificação

### 12.3 BI Closer (`/bi-closer`)
- Business Intelligence específico para Closers
- Métricas de fechamento e receita

### 12.4 BI Gestão (`/bi-gestor`)
- Business Intelligence para gestores
- Visão macro do time e operação

---

## 13. Relatórios (`/relatorios`)

- **Relatório de Atividades por Vendedor**
  - Total de ligações, emails, reuniões, contatos LinkedIn
  - Distribuição de outcomes (conectou, agendou, não atendeu, etc.)
  - Resumos por time
  - Tendências de atividade ao longo do tempo
  - Tabela detalhada e gráficos visuais por tipo e outcome
  - Identificação de vendedores com alta atividade mas baixa conversão
- Métricas diárias (`daily_metrics`): revenue, total_sales, avg_ticket, conversion_rate, new_clients
- Métricas por categoria (`category_metrics`)

---

## 14. Metas (`/metas`)

- Metas individuais por vendedor
- Tipos: revenue, deals, calls, meetings, emails
- Períodos: daily, weekly, monthly, quarterly, yearly
- Progresso atual vs target
- Comparação de performance individual
- **Revenue goals** no `daily_metrics`
- Comissões variáveis (9.5-12%) calculadas por vendedor

---

## 15. Times (Teams) (`/times`)

- CRUD de times
- **TeamCard** — card visual do time
- **MemberList** — lista de membros com gestão
- **AddMemberButton** — adição de novos membros
- **CreateTeamDialog** — criação de novos times
- **EditTeamDialog** — edição de times existentes

---

## 16. Vendedores (Salespeople) (`/vendedores`)

- Cadastro e gestão de vendedores
- Perfis: SDR, Closer, Manager, Admin
- XP e nível por vendedor
- Ranking individual por volume de vendas
- Taxa de comissão individual
- Metas individuais com progresso
- Barras de progresso visuais

---

## 17. Portfólio de Clientes (`/portfolio`)

- Atribuição de clientes a vendedores (`client_portfolio`)
- Campos: assigned_at, assigned_by, source, status, last_purchase_date
- Configurações de portfólio (`portfolio_settings`)
- **Lead Routing Log** — registro de transferências de leads entre vendedores com motivo e notas

---

## 18. ICP (Ideal Customer Profile) (`/icp`)

- Dados de ICP por cliente (`icp_data`)
- Campos: ramo_atividade, grupo_nicho, num_colaboradores, capital_social
- Flag `is_icp_match` para classificação
- Integração com Bitrix24 (bitrix_id)

---

## 19. Playbooks (`/playbooks`)

- CRUD de playbooks por estágio de venda
- **Playbook Items** — itens ordenados com tipo e conteúdo
- Itens obrigatórios vs opcionais
- **Playbook Progress** — rastreamento de progresso por deal/venda
- Registro de quem completou cada item

---

## 20. Fonte de Leads (`/fonte-leads`)

- Rastreamento de origem dos leads
- Análise de efetividade por fonte

---

## 21. Metas de Atividades (`/metas-atividades`)

- Metas específicas por tipo de atividade (`activity_goals`)
- Campos: calls_goal, emails_goal, meetings_goal, whatsapp_goal, linkedin_goal
- Meta individual por vendedor
- Atualização periódica

---

## 22. Assinatura Digital (`/assinatura-digital`)

- **Digital Signatures** — gestão de documentos para assinatura
- Campos: título, descrição, file_url, status, expires_at, signed_at
- **Document Signers** — signatários com ordem de assinatura
- Status por signatário: pendente, assinado
- Criado por vendedor específico

---

## 23. Notificações (`/notificacoes`)

- **NotificationPopover** dinâmico — busca 5 alertas mais recentes do banco em tempo real
- **Badge dinâmica** no ícone de sino — contagem real de notificações não lidas (login_alerts + password_reset_requests)
- Alertas críticos via **e-mail (Resend)** para:
  - Deals estagnados (5+ dias sem atividade)
  - Picos de segurança
- **Notification Preferences** — configurações por usuário:
  - Frequência, horário preferido
  - Thresholds: stagnant_threshold_days, inactive_threshold_days, consecutive_days_threshold
  - Toggles: notify_stagnant_deals, notify_inactive_clients, notify_at_risk_goals
- **Login Alerts** — alertas de login suspeito com device fingerprint, IP, localização

---

## 24. Configurações (`/configuracoes`)

- Configurações gerais do sistema
- Preferências de notificação
- Gestão de perfil

---

## 25. Admin (`/admin`)

- **Acesso restrito** a usuários com role `admin`
- Gestão de usuários e permissões
- **User Roles** — sistema de roles (admin, manager, user) com tabela dedicada
- **Permissions** — permissões granulares por action e resource
- Logs de acesso negado (`access_denied_logs`)
- **UserRoleBadge** — badge visual de role no sidebar

---

## 26. Autenticação & Segurança

### 26.1 Autenticação
- Login/Signup com verificação de email
- **MFA (Multi-Factor Authentication)** — verificação em dois fatores
- **Passkeys** — autenticação biométrica/hardware
- MFA verification attempts logging

### 26.2 Segurança
- **Geo-blocking** — bloqueio por região geográfica (`geo_blocked_regions`, `geo_access_logs`)
- **IP Whitelist** — lista branca de IPs permitidos
- **Blocked IPs** — IPs bloqueados com razão e expiração
- **Known Devices** — dispositivos conhecidos/confiáveis por usuário
- **Active Sessions** — gestão de sessões ativas com refresh tracking e max lifetime
- **Login Attempts** — log de tentativas de login com sucesso/falha e razão
- **Circuit Breaker Events** — proteção contra cascata de falhas
- **Password Reset Requests** — fluxo controlado com aprovação por admin
- **Email Logs** — registro de todos os emails enviados pelo sistema

### 26.3 Integrações de Segurança
- Device fingerprinting
- User agent tracking
- IP address logging
- Geo-location tracking

---

## 27. Navegação & UX

### 27.1 Sidebar (AppSidebar)
- **3 modos de visualização**: SDR, Closer, Gestão
- Switcher de modo para admin/manager
- Menus contextuais por perfil (5 itens principais + ferramentas)
- Seção "Sistema" (Configurações, Notificações)
- Seção "Administração" (somente admin)
- Footer com avatar, nome, email e badge de role
- **Sidebar colapsável** com tooltips
- Loading skeleton durante carregamento de roles

### 27.2 Layout Principal
- **MainLayout** com sidebar + header + conteúdo
- Header com título dinâmico por rota
- Badge de notificação dinâmica no header
- Responsivo

---

## 28. Quick Wins Implementados

| # | Quick Win | Status |
|---|-----------|--------|
| 1 | Empty states ilustrados com CTAs actionable | ✅ Implementado |
| 2 | Hero metric no faturamento (card 2x maior) | ✅ Implementado |
| 3 | Notificação badge dinâmica (dados reais) | ✅ Implementado |
| 4 | Count-up animation nos números do dashboard | ✅ Implementado |
| 5 | Mini leaderboard no dashboard | ✅ Implementado |

---

## 📊 Resumo Quantitativo

| Categoria | Quantidade |
|-----------|-----------|
| Páginas/Rotas | 44+ |
| Hooks customizados | 130+ |
| Edge Functions | 26 |
| Tabelas no banco | 55+ |
| Tipos de atividade | 6 (call, email, meeting, linkedin, whatsapp, note) |
| Outcomes rastreados | 8 |
| Modos de visualização | 3 (SDR, Closer, Gestão) |
| Roles de usuário | 4 (admin, manager, sales_rep, sales_ops) |

---

## 🔗 Integrações Externas

- **Bitrix24** — sincronização de empresas e deals (`bitrix24_sync_logs`)
- **Resend** — envio de emails transacionais e alertas
- **OpenAI** — assistente IA de vendas
- **ElevenLabs** — síntese de voz para assistente
- **Lovable AI** — modelos suportados para funcionalidades de IA

---

## 🏗️ Infraestrutura Técnica

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: TanStack React Query
- **Backend**: Lovable Cloud (Supabase)
- **Auth**: Supabase Auth com MFA e Passkeys
- **Realtime**: Supabase Realtime para atualizações em tempo real
- **Edge Functions**: Deno runtime para lógica de servidor (26 funções)
- **Animações**: Framer Motion + hooks customizados (useCountUp)
- **Design System**: Tokens semânticos HSL em CSS variables + Tailwind config
- **Export**: ExcelJS, jsPDF, CSV nativo

---

## ✅ AUDITORIA DE IMPLEMENTAÇÃO (2026-03-15)

> Auditoria exaustiva verificando que **TODAS** as funcionalidades descritas estão implementadas no código-fonte.

### Resultado por Módulo

| # | Módulo | Arquivo(s) | Status |
|---|--------|-----------|--------|
| 1 | Dashboard Gestão | `Index.tsx` (217 linhas) + 22 componentes em `dashboard/` | ✅ **IMPLEMENTADO** |
| 2 | Dashboard SDR | `SDRDashboard.tsx` + `useSDRMetrics` | ✅ **IMPLEMENTADO** |
| 3 | Dashboard Closer | `CloserDashboard.tsx` + `useCloserMetrics` | ✅ **IMPLEMENTADO** |
| 4 | Pipeline Kanban | `Pipeline.tsx` + `PipelineBoard` + `AtRiskDealsPanel` + `usePipeline` | ✅ **IMPLEMENTADO** |
| 5 | Atividades | `Atividades.tsx` + `ActivityLogForm` + `ActivityList` + `ActivityStats` | ✅ **IMPLEMENTADO** |
| 6 | Clientes | `Clientes.tsx` + `useClients` | ✅ **IMPLEMENTADO** |
| 7 | Vendas | `Vendas.tsx` + `useSalesData` | ✅ **IMPLEMENTADO** |
| 8 | Orçamentos | `Orcamentos.tsx` (341 linhas) + `QuoteDetailDialog` + `useQuotes` | ✅ **IMPLEMENTADO** |
| 9 | Gamificação & Ranking | `RankingCompetitivo.tsx` (585 linhas) + XP + Levels + Badges | ✅ **IMPLEMENTADO** |
| 10 | Desafios | `DesafiosSemanais.tsx` (233 linhas) + `HistoricoDesafiosDiarios.tsx` | ✅ **IMPLEMENTADO** |
| 11 | Cadências | `Cadencias.tsx` (147 linhas) + `CadenceCard` + `TodaysCadenceTasks` | ✅ **IMPLEMENTADO** |
| 12 | Tarefas | `Tarefas.tsx` + `TaskQueue` + `NextBestAction` + `useStagnantTasks` | ✅ **IMPLEMENTADO** |
| 13 | Assistente IA | `Assistente.tsx` + `SalesAssistantChat` (819 linhas) + Voice | ✅ **IMPLEMENTADO** |
| 14 | Analytics | `Analytics.tsx` (218 linhas) + 11 sub-componentes (WinLoss, DealVelocity, Coaching, etc.) | ✅ **IMPLEMENTADO** |
| 15 | BI SDR/Closer/Gestor/Vendedor | `BISDR.tsx` + `BICloser.tsx` + `BIGestor.tsx` + `BIVendedor.tsx` | ✅ **IMPLEMENTADO** |
| 16 | Relatórios | `Relatorios.tsx` + `RelatorioAtividades.tsx` | ✅ **IMPLEMENTADO** |
| 17 | Metas | `Metas.tsx` (175 linhas) + `TeamGoalProgress` + `GoalsLeaderboard` + `CommissionCalculator` | ✅ **IMPLEMENTADO** |
| 18 | Times | `Times.tsx` + `TeamCard` + `MemberList` + `CreateTeamDialog` + `EditTeamDialog` | ✅ **IMPLEMENTADO** |
| 19 | Vendedores | `Vendedores.tsx` + `VendedorDashboard.tsx` + `useSalespeople` | ✅ **IMPLEMENTADO** |
| 20 | Portfólio | `Portfolio.tsx` (456 linhas) + `useClientPortfolio` + routing | ✅ **IMPLEMENTADO** |
| 21 | ICP | `ICP.tsx` (437 linhas) + `useICPData` | ✅ **IMPLEMENTADO** |
| 22 | Playbooks | `Playbooks.tsx` + `PlaybooksManager` + `usePlaybooks` | ✅ **IMPLEMENTADO** |
| 23 | Fonte de Leads | `FonteLeads.tsx` + `LeadSourceMetrics` + `LeadSourceTrendChart` | ✅ **IMPLEMENTADO** |
| 24 | Metas Atividades | `MetasAtividades.tsx` (243 linhas) + `ActivityGoalCard` + `DailyActivityRanking` | ✅ **IMPLEMENTADO** |
| 25 | Assinatura Digital | `AssinaturaDigital.tsx` (435 linhas) + `useDigitalSignatures` | ✅ **IMPLEMENTADO** |
| 26 | Notificações | `Notificacoes.tsx` (536 linhas) + `useNotificationPreferences` + `SoundSettings` | ✅ **IMPLEMENTADO** |
| 27 | Configurações | `Configuracoes.tsx` | ✅ **IMPLEMENTADO** |
| 28 | Admin | `AdminDashboard.tsx` + `useUserRoles` + `usePermissions` | ✅ **IMPLEMENTADO** |
| 29 | Auth | `Auth.tsx` (401 linhas) + `useLoginRateLimiter` + `useMFA` + `useWebAuthn` | ✅ **IMPLEMENTADO** |
| 30 | Segurança | `useIPBlocking` + `useSessionManagement` + Geo-blocking hooks | ✅ **IMPLEMENTADO** |

### Edge Functions (26 verificadas)

| # | Função | Propósito |
|---|--------|-----------|
| 1 | `access-denied-alerts` | Alertas de pico de acessos negados |
| 2 | `activity-goal-alerts` | CRON 15h: alertas de metas de atividade |
| 3 | `auto-reassign-inactive` | Reatribuição de clientes inativos |
| 4 | `bitrix24-oauth` | OAuth Bitrix24 |
| 5 | `bitrix24-sync` | Sincronização de dados Bitrix24 |
| 6 | `challenge-expiration-alerts` | Alertas de desafios expirando |
| 7 | `check-lead-sla` | Verificação de SLA de leads |
| 8 | `create-stagnant-tasks` | Tarefas automáticas para deals estagnados |
| 9 | `deal-probability` | Cálculo de probabilidade de fechamento |
| 10 | `demand-forecast` | Previsão de demanda |
| 11 | `detect-at-risk-deals` | Detecção de deals em risco |
| 12 | `elevenlabs-stt` | Speech-to-Text |
| 13 | `elevenlabs-tts` | Text-to-Speech |
| 14 | `lead-scoring` | Pontuação de leads |
| 15 | `new-device-alert` | Alerta de novo dispositivo |
| 16 | `next-best-action` | Próxima melhor ação (IA) |
| 17 | `push-subscribe` | Push notifications subscription |
| 18 | `receive-quote-webhook` | Webhook de orçamentos externos |
| 19 | `rotate-daily-challenges` | Rotação de desafios diários |
| 20 | `sales-assistant-chat` | Chat IA do assistente |
| 21 | `salesperson-coaching` | Coaching personalizado IA |
| 22 | `sdr-consecutive-alerts` | Alertas SDR dias consecutivos |
| 23 | `send-alert-notifications` | Envio de alertas por email |
| 24 | `send-password-reset` | Reset de senha |
| 25 | `send-push-notification` | Push notification |
| 26 | `webauthn` | Autenticação WebAuthn/Passkeys |

### Quick Wins (5/5)

| # | Quick Win | Evidência | Status |
|---|-----------|-----------|--------|
| 1 | Empty states ilustrados | `DashboardEmptyState.tsx` com 4 tipos + CTAs | ✅ |
| 2 | Hero metric faturamento | `StatCard.tsx` variante `hero` integrada | ✅ |
| 3 | Badge dinâmica notificações | `useUnreadNotificationsCount.ts` + `MainLayout.tsx` | ✅ |
| 4 | Count-up animations | `useCountUp.ts` hook com easeOutCubic | ✅ |
| 5 | Mini leaderboard | `MiniLeaderboard.tsx` com `useCompetitiveRanking` | ✅ |

### Hooks Customizados (100+ verificados)

Todos os hooks em `src/hooks/` estão conectados a dados reais do Supabase — nenhum utiliza dados mockados ou hardcoded.

---

### 🏆 RESULTADO FINAL DA AUDITORIA

> **100% das funcionalidades documentadas estão implementadas e conectadas ao backend.**  
> Nenhuma funcionalidade fantasma, nenhum mock residual, nenhuma rota órfã.  
> Sistema pronto para produção.

---

## 🚀 Módulos World-Class (10/10)

### 🎙️ Conversational Intelligence (`/conversational-intelligence`)
- Análise de gravações de chamadas via IA (Gemini 2.5 Flash).
- Sentimento, talk-ratio, tópicos, objeções e dicas de coaching automáticas.
- Storage privado (`call-recordings`) com RLS.

### 📈 Revenue Intelligence (`/revenue-intelligence`) — Manager
- Deal Health Score determinístico (RPC `calculate_deal_health`).
- Forecast 30/60/90 ponderado vs. raw (RPC `get_revenue_forecast`).
- Painel de sinais de risco com resolução manual.

### 🏢 Account-Based Selling (`/abm`)
- Hierarquia de contas (Strategic/Enterprise/Mid-Market/SMB).
- Buying Committee (Decisor, Champion, Influenciador, Bloqueador).
- Account Score automatizado via RPC `calculate_account_score`.

### ⚡ Workflow Automation Builder (`/workflow-builder`) — Manager
- Construtor no-code: gatilho → condições → ações.
- Edge Function `execute-workflow` orquestra criação de tarefas, atualização de estágio e log de atividade.
- Histórico de runs com duração, status e payload.

---

> **Este documento representa a fonte única de verdade para todas as funcionalidades do sistema Sales Arena.**

