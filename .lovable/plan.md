
Próxima atômica AI Generativo Avançado: **AI Agents autônomos** — agentes que executam tarefas multi-step (qualificar lead, montar proposta, agendar follow-up) usando tool calling do Gemini sobre as RPCs e funções existentes do CRM.

## Próxima Melhoria — AI Agents Autônomos

### Estado atual
- IA atual é reativa: Copilot responde, NLQ consulta, Email Composer gera. Nada **age** sozinho.
- Sem orquestração multi-step com aprovação humana.
- Sem registro auditável de ações tomadas por IA.

### Mudanças

**1. Migration**
- Tabela `ai_agent_runs`: `id`, `salesperson_id`, `agent_type` (`qualify_lead|build_proposal|schedule_followup|enrich_client|recover_cold_lead`), `goal text`, `target_entity_type`, `target_entity_id`, `status` (`pending|running|awaiting_approval|completed|failed|cancelled`), `steps jsonb` (lista de tool calls + resultados), `result jsonb`, `requires_approval bool`, `approved_by`, `created_at`, `completed_at`.
- Tabela `ai_agent_actions` (audit): `run_id`, `step_index`, `tool_name`, `tool_input jsonb`, `tool_output jsonb`, `executed_at`, `executed_by` (`ai|user`).
- RLS: vendedor vê próprios; admin vê tudo.
- RPCs `create_agent_run`, `append_agent_step`, `complete_agent_run`, `approve_agent_run` (SECURITY DEFINER + ownership).

**2. Edge function `ai-agent-orchestrator` (`verify_jwt=true`)**
- Input: `{ agent_type, target_entity_id?, goal?, auto_execute? }`
- Carrega contexto do alvo (lead/cliente/deal).
- Loop tool calling Gemini 2.5 Flash com tools registradas:
  - `get_entity_details`, `search_semantic`, `create_activity`, `compose_email`, `update_lead_score`, `add_note`, `schedule_followup`, `finish` (com sumário).
- Cada tool call → executa via service-role + grava em `ai_agent_actions`.
- Tools mutativas em modo `awaiting_approval` se `auto_execute=false` (default).
- Trata 429/402, max 10 steps, timeout 60s.

**3. Hooks**
- `useStartAgentRun()`, `useAgentRuns()`, `useApproveAgentRun()`, `useAgentRunDetails(id)` — realtime via channel em `ai_agent_runs`.

**4. UI (≤300L cada)**
- `AgentLauncherDialog.tsx` — escolhe agent_type, alvo (autocomplete lead/cliente), goal opcional, toggle "executar automaticamente".
- `AgentRunCard.tsx` — card com status + progress steps.
- `AgentStepTimeline.tsx` — timeline das ações com input/output formatado.
- `AgentApprovalBar.tsx` — aprovar/rejeitar plano antes da execução.
- `agentHelpers.ts` — labels, ícones, cores por tipo.
- Página `AIAgents.tsx` (`/agentes`): lista de runs + botão "Novo agente".
- Botão "Acionar agente" inline em LeadDetailDrawer e ClientDetailDrawer.

**5. Integração**
- Rota `/agentes` (lazy) + sidebar item "Agentes IA" no grupo IA/Analytics.
- Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE ai_agent_runs;`

**6. Validação**
- Smoke `supabase--curl_edge_functions` em lead real (modo `awaiting_approval`).
- RLS confere isolamento por vendedor.
- Linter zero novos warnings, console limpo.

### Arquivos
- Migration (2 tabelas + 4 RPCs + RLS + realtime)
- Criar `supabase/functions/ai-agent-orchestrator/index.ts`, `agentTools.ts`
- Criar `src/hooks/agents/useAgentRuns.ts`, `useStartAgentRun.ts`, `useApproveAgentRun.ts`, `useAgentRunDetails.ts`
- Criar `src/components/agents/AgentLauncherDialog.tsx`, `AgentRunCard.tsx`, `AgentStepTimeline.tsx`, `AgentApprovalBar.tsx`, `agentHelpers.ts`
- Criar `src/pages/AIAgents.tsx`
- Editar `src/routes/AppRoutes.tsx`, `src/routes/lazyPages.ts`, `src/components/layout/sidebar/sidebarMenuData.ts`, `src/components/leads/LeadDetailDrawer.tsx`, `src/components/clients/ClientDetailDrawer.tsx`, `supabase/config.toml`

Após esta entrega, sigo para a última atômica de AI Generativo Avançado: **Predictive Scoring com Explainability** — fechando 10/10.
