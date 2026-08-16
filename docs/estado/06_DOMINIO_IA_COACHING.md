# 06 — Domínio IA / Coaching / Inteligência Conversacional / Busca Semântica

**Data da auditoria:** 2026-08-16
**Método:** MEDIR, NÃO CONFIAR. Nenhuma afirmação abaixo vem de `docs/*.md`. Todo fato tem `arquivo:linha` lido de fato ou query SELECT executada no banco de produção via MCP.
**Repo:** `/home/user/promo-champions-v2.1` — React 18 + Vite + TS + Supabase.

---

## 1. RESPOSTA À PERGUNTA CENTRAL

> **As features de IA estão realmente ligadas a um provedor, ou são cascas?**

**Estão ligadas a um provedor real — o código não é casca.** O fio UI → hook → edge function → provedor HTTP existe e está completo em quase todas as features.

**Mas o fio morre na última etapa: nenhuma delas tem uso real em produção.** De **31 tabelas de destino** medidas neste domínio, **31 têm 0 linhas** e **0 inserções nos últimos 23 dias** — enquanto no mesmo período o CRM recebeu 1.090 inserções em `sales`, 2.456 em `activities` e 200 em `clients`.

O sistema de IA está construído, plugado e nunca foi usado.

---

## 2. PROVEDOR DE IA (item 1 do escopo)

**Provedor único para 30 das 31 funções de IA: Lovable AI Gateway** (proxy de modelos Google Gemini), lido do secret `LOVABLE_API_KEY`.

| Endpoint HTTP | Uso | Exemplo `arquivo:linha` |
|---|---|---|
| `https://ai.gateway.lovable.dev/v1/chat/completions` | LLM / chat / análise | `supabase/functions/ai-copilot/index.ts:201` |
| `https://ai.gateway.lovable.dev/v1/embeddings` | Embeddings vetoriais | `supabase/functions/semantic-index-entity/index.ts:70` |
| `https://api.elevenlabs.io/v1/text-to-speech/…` | Voz (TTS) | `supabase/functions/elevenlabs-tts/index.ts:61` |
| `https://api.elevenlabs.io/v1/speech-to-text` | Voz (STT) | `supabase/functions/elevenlabs-stt/index.ts:67` |

**Modelos declarados no código** (`grep -oE 'model:\s*"[^"]+"'` em `supabase/functions/*/index.ts`):

- `google/gemini-2.5-flash` — padrão, ~17 ocorrências
- `google/gemini-2.5-pro` — 1 ocorrência
- `google/gemini-3-flash-preview` — 1 ocorrência
- `google/text-embedding-004` — 2 ocorrências (`semantic-index-entity/index.ts:73`, `semantic-search-universal/index.ts:25`)

**NÃO há chamadas diretas a OpenAI nem a Anthropic** em nenhuma edge function do escopo. Nada de `api.openai.com` ou `api.anthropic.com`.

**Secrets lidos:**

| Secret | Lido em (exemplo) | Funções que dependem |
|---|---|---|
| `LOVABLE_API_KEY` | `supabase/functions/ai-agent-orchestrator/index.ts:9` | 30 |
| `ELEVENLABS_API_KEY` | `supabase/functions/elevenlabs-tts/index.ts:39` | 3 |

---

## 3. OS SECRETS EXISTEM? (item 2 do escopo) — `NAO_VERIFICADO`

**Status: `NAO_VERIFICADO`.**

Query executada (somente nomes, nunca valores):

```sql
select count(*) as n from vault.secrets;   -- resultado: n = 0
select name, created_at from vault.secrets order by name;  -- resultado: 0 linhas
```

`vault.secrets` está **vazio (0 linhas)** — a query rodou com sucesso, não foi negada por permissão.

**Por que isso NÃO prova que os secrets faltam:** no Supabase, secrets de Edge Function (`Deno.env.get(...)`) são variáveis de ambiente da plataforma de Functions, armazenadas **fora do banco Postgres**. Elas não aparecem em `vault.secrets`, que é o cofre pgsodium para uso de SQL. O vault vazio é o estado esperado mesmo com `LOVABLE_API_KEY` corretamente configurado.

Não existe superfície de leitura para essas variáveis a partir de SELECT, e o guard-rail deste trabalho é somente-leitura. Portanto:

- **`LOVABLE_API_KEY` existe?** `NAO_VERIFICADO` — só verificável no painel Supabase (Edge Functions → Secrets) ou invocando uma função, o que está fora do escopo somente-leitura.
- **`ELEVENLABS_API_KEY` existe?** `NAO_VERIFICADO` — mesmo motivo.

**Único secret verificável no banco**, e ele existe — mas é de autenticação de cron, não de IA:

```sql
select key, (value is not null and value <> '') as has_value from public._internal_secrets;
-- coaching_cron_secret | true
```

Usado em `supabase/functions/generate-coaching-actions/index.ts:49` para validar o header `X-Cron-Secret`. Tabela protegida por policy deny-all (`supabase/migrations/20260715184427_8e4ec70a-caf2-4a8d-9042-e26e29fa3a54.sql:6`).

**Evidência indireta e forte de que a IA nunca rodou:** independentemente de o secret existir, nenhuma tabela de destino recebeu uma única linha (seção 4). Se a chave estivesse configurada E as features fossem usadas, haveria linhas. Ou o secret falta, ou ninguém usa as features — em ambos os casos, o resultado em produção é o mesmo: zero.

---

## 4. AS TABELAS TÊM LINHAS? (item 3 do escopo) — TODAS ZERO

Query executada em `pg_stat_user_tables` (banco de produção). `n_tup_ins` = total de inserções desde o reset de estatísticas.

**Reset de estatísticas do banco: `2026-07-24`** (`select stats_reset from pg_stat_database`). Logo, os números abaixo cobrem uma janela de **23 dias**.

### Baseline de controle — o CRM ESTÁ vivo nessa mesma janela

| Tabela | `n_live_tup` | `n_tup_ins` (23d) |
|---|---:|---:|
| `activities` | 2.228 | **2.456** |
| `sales` | 954 | **1.090** |
| `clients` | 100 | **200** |
| `salespeople` | 18 | 23 |

O sistema é usado de verdade. Isso torna o resultado abaixo conclusivo, não um artefato de "banco novo".

### Tabelas de IA / Coaching / Semântica — 31 de 31 zeradas

| Tabela | `n_live_tup` | `n_tup_ins` (23d) | Tamanho |
|---|---:|---:|---|
| `semantic_index` | **0** | **0** | 1256 kB |
| `call_recordings` | 0 | 0 | 72 kB |
| `call_transcripts` | 0 | 0 | 24 kB |
| `call_insights` | 0 | 0 | 24 kB |
| `call_conversation_metrics` | 0 | 0 | 32 kB |
| `call_questions` | 0 | 0 | 32 kB |
| `call_question_analysis` | 0 | 0 | 40 kB |
| `call_objections` | 0 | 0 | 32 kB |
| `call_objection_analysis` | 0 | 0 | 24 kB |
| `call_sentiment_timeline` | 0 | 0 | 24 kB |
| `call_critical_moments` | 0 | 0 | 40 kB |
| `call_coaching_scorecards` | 0 | 0 | 40 kB |
| `call_recording_ingest_jobs` | 0 | 0 | 48 kB |
| `call_intelligence_triggers` | 0 | 0 | 24 kB |
| `call_metric_benchmarks` | 0 | 0 | 48 kB |
| `salesperson_coaching_aggregates` | 0 | 0 | 40 kB |
| `coaching_actions` | 0 | 0 | 32 kB |
| `coaching_opportunities` | 0 | 0 | 48 kB |
| `coaching_sessions` | 0 | 0 | 48 kB |
| `coaching_skill_benchmarks` | 0 | 0 | 24 kB |
| `skill_assessments` | 0 | 0 | 56 kB |
| `skill_development_tracks` | 0 | 0 | 48 kB |
| `competitor_mentions` | 0 | 0 | 32 kB |
| `competitors_registry` | 0 | 0 | 24 kB |
| `objection_library` | 0 | 0 | 40 kB |
| `conversation_analyses` | 0 | 0 | 64 kB |
| `ai_agent_runs` | 0 | 0 | 40 kB |
| `ai_agent_actions` | 0 | 0 | 24 kB |
| `ai_sales_insights` | 0 | 0 | 24 kB |
| `ai_narrative_cache` | 0 | 0 | 48 kB |
| `chat_conversations` | 0 | 0 | 24 kB |
| `personal_assistant_briefings` | 0 | 0 | 32 kB |
| `personal_assistant_nudges` | 0 | 0 | 32 kB |

Única tabela com config semeada: `coaching_scorecard_config` = **4 linhas** (configuração de pesos, não output de IA).

---

## 5. BUSCA SEMÂNTICA — O CANDIDATO A ✅ É **NEGADO**

O escopo apontava `public.semantic_index` (1256 kB) como raro candidato a ✅. **Medi e nego.**

```sql
select count(*) from public.semantic_index;                        -- 0
select count(*) from public.semantic_index where embedding is not null;  -- 0
```

**0 linhas. 0 embeddings. 0 inserções em 23 dias.**

**Os 1256 kB são overhead de índices vazios, não dados.** A tabela tem 6 índices (`pg_indexes`), incluindo um **ivfflat** para pgvector:

```
idx_semantic_index_embedding  ::  CREATE INDEX ... USING ivfflat (embedding ...)
semantic_index_entity_type_entity_id_key, idx_semantic_index_entity,
idx_semantic_index_salesperson, idx_semantic_index_content_hash, semantic_index_pkey
```

Um índice ivfflat pré-aloca listas de centroides; ele ocupa espaço mesmo com a tabela vazia. `pg_total_relation_size` soma tabela + índices, daí o 1256 kB enganoso.

**A infraestrutura está 100% pronta e nunca foi alimentada.** Schema correto (`embedding` do tipo pgvector, `content_hash` para dedupe, `source_updated_at`), e as 3 RPCs existem em produção:

| RPC | Assinatura |
|---|---|
| `match_semantic` | `(_query_embedding vector, _match_count integer, _entity_types text[])` |
| `upsert_semantic_entry` | `(_entity_type text, _entity_id uuid, _salesperson_id uuid, _content text, _embedding vector, _metadata jsonb)` |
| `get_semantic_coverage` | `()` |

### A contradição mais reveladora do domínio

A indexação **está plugada nos fluxos reais de escrita do CRM**:

- `src/hooks/sales/useSalesData.ts:29` → `useIndexEntity()`
- `src/hooks/crm/useClients.ts:26` e `:41` → `useIndexEntity()`
- `src/hooks/activities/useActivities.ts:426` → `useIndexEntity()`

Ou seja: cada venda, cliente e atividade criada **deveria** disparar `semantic-index-entity`. Houve **3.746 inserções** nessas 3 tabelas em 23 dias. O `semantic_index` recebeu **0**.

**A causa está no design fire-and-forget que engole todo erro** — `src/hooks/semantic/useIndexEntity.ts:9-16`:

```ts
const index = useCallback((entity_type: SemanticEntityType, entity_id: string) => {
  void supabase.functions
    .invoke("semantic-index-entity", { body: { entity_type, entity_id } })
    .catch((err) => {
      // Silent: indexing is best-effort
      console.warn("[semantic-index] failed", err);
    });
}, []);
```

E na edge function, `supabase/functions/semantic-index-entity/index.ts:97`:

```ts
if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");
```

Se `LOVABLE_API_KEY` não estiver configurada, a função lança erro, o `.catch` no cliente engole em `console.warn`, o usuário nunca vê nada, e 3.746 oportunidades de indexação viraram silêncio. **Este é o bug mais caro do domínio**: falha invisível por design, em produção, por 23 dias no mínimo.

---

## 6. QUEM CHAMA CADA EDGE FUNCTION

Verificado por grep em `src/` e `supabase/migrations/`.

**Nenhum cron job dispara IA.** `select jobname, schedule, command from cron.job` retorna 11 jobs — todos de limpeza, retenção, gamificação e alertas de campanha. Nenhum chama função de IA. A cadeia `generate-coaching-actions` tem autenticação por `X-Cron-Secret` preparada, mas **não existe cron agendado que a chame**.

**Órfã confirmada:** `elevenlabs-stt` — `grep -rn "elevenlabs-stt" src/ supabase/migrations/` retorna **zero resultados**. Deployada e inalcançável.

**Cascata central:** `src/hooks/conversational/useTranscribeRecording.ts` orquestra 10 funções em sequência a partir de um clique (linhas 9, 26, 32, 40, 48, 56, 65, 74, 84, 94). Como `call_recordings` tem 0 linhas, essa cascata inteira nunca executou.

---

## 7. TABELA DE VEREDITOS

| Funcionalidade | UI (arquivo:linha) | Edge function | Provedor IA + secret | Tabela | Linhas | Quem chama | Classificação | O que falta |
|---|---|---|---|---|---:|---|---|---|
| AI Copilot (FAB) | `src/components/copilot/AICopilotFab.tsx:21` | `ai-copilot` | Lovable Gateway · `LOVABLE_API_KEY` (`ai-copilot/index.ts:114,201`) | — (efêmero) | n/a | `src/hooks/ai/useAICopilot.ts:68,124,161` | 🟨 PARCIAL | Secret `NAO_VERIFICADO`; zero rastro de uso em produção |
| Sales Assistant Chat | `src/components/assistant/SalesAssistantChat.tsx:41` | `sales-assistant-chat` | Lovable Gateway · `LOVABLE_API_KEY` (`sales-assistant-chat/index.ts:371,376`) | `chat_conversations` | **0** | `src/hooks/sales/useSalesAssistant.ts` | 🟨 PARCIAL | Tabela vazia (0 ins/23d) |
| Assistente Pessoal (stream) | `src/components/assistant/PersonalAssistantDrawer.tsx:40` | `personal-assistant-stream` | Lovable Gateway · `LOVABLE_API_KEY` (`personal-assistant-stream/index.ts:319,328`) | `personal_assistant_briefings`, `personal_assistant_nudges` | **0 / 0** | `src/hooks/assistant/usePersonalAssistant.ts` | 🟨 PARCIAL | Ambas vazias |
| Agentes de IA (orquestrador) | `src/components/agents/AgentLauncherDialog.tsx:30` | `ai-agent-orchestrator` | Lovable Gateway · `LOVABLE_API_KEY` (`ai-agent-orchestrator/index.ts:9,117`) | `ai_agent_runs`, `ai_agent_actions` | **0 / 0** | `src/hooks/agents/useStartAgentRun.ts:18` | 🟨 PARCIAL | Nenhum run jamais registrado |
| Composição de e-mail por IA | `src/components/email/AIEmailComposerDialog.tsx:66` | `ai-email-composer` | Lovable Gateway · `LOVABLE_API_KEY` (`ai-email-composer/index.ts:120,185`) | — (retorna texto) | n/a | `useComposeEmail.ts`, `AIEmailDialog.tsx`, `useAIEmailComposer.ts` | 🟨 PARCIAL | Sem persistência; uso não comprovável |
| Upload de gravação | `src/components/conversational/CallRecordingUploader.tsx:14` | `process-call-recording-ingest` | **Sem IA** (só storage→DB, `index.ts:81`) | `call_recordings` | **0** | `src/hooks/conversational/useUploadCallRecording.ts` | 🟨 PARCIAL | Nenhuma gravação jamais enviada — bloqueia todo o resto |
| Transcrição de chamada | `src/components/conversational/TranscribeButton.tsx:14` | `transcribe-call-recording` | Lovable Gateway · `LOVABLE_API_KEY` (`index.ts:20,87`) | `call_transcripts` | **0** | `useTranscribeRecording.ts:9` | 🟨 PARCIAL | Sem input (0 gravações) |
| Diarização (quem falou) | `src/components/conversational/DiarizeButton.tsx:12` | `diarize-call-recording` | Lovable Gateway · `LOVABLE_API_KEY` (`index.ts:179,112`) | `call_transcripts` | **0** | `useDiarizeRecording.ts`, `useTranscribeRecording.ts` | 🟨 PARCIAL | Sem input |
| Resumo de chamada | `src/components/conversational/SummarizeButton.tsx:12` | `summarize-call-recording` | Lovable Gateway · `LOVABLE_API_KEY` (`index.ts:10,156`) | — (retorna texto) | n/a | `useSummarizeRecording.ts`, `useTranscribeRecording.ts:26` | 🟨 PARCIAL | Sem input |
| Análise de chamada | `src/pages/ConversationalIntelligence.tsx` (via `useCallRecordings`) | `analyze-call` | Lovable Gateway · `LOVABLE_API_KEY` (`index.ts:30,58`) | `call_insights` | **0** | `src/hooks/conversational/useCallRecordings.ts` | 🟨 PARCIAL | Tabela vazia |
| Análise de conversa | — (via pipeline-pulse e hooks) | `analyze-conversation` | Lovable Gateway · `LOVABLE_API_KEY` (`index.ts:19,52`) | `conversation_analyses` | **0** | `useAnalyzeConversation.ts`, `useQuickAction.ts:11` | 🟨 PARCIAL | Tabela vazia |
| Métricas de conversa | `src/components/conversational/metrics/ConversationMetricsCard.tsx:7` | `analyze-conversation-metrics` | **Sem provedor** — heurística pura (`index.ts:125` upsert direto) | `call_conversation_metrics` | **0** | `useConversationMetrics.ts`, `useTranscribeRecording.ts:65` | 🟨 PARCIAL | Não é IA (é regra determinística); tabela vazia |
| Qualidade de perguntas | `src/components/conversational/questions/QuestionQualityCard.tsx:9` | `analyze-question-quality` | **Sem provedor** — heurística (`index.ts:155,163`) | `call_questions`, `call_question_analysis` | **0 / 0** | `useQuestionAnalysis.ts`, `useTranscribeRecording.ts:74` | 🟨 PARCIAL | Não é IA; tabelas vazias |
| Tratamento de objeções | `src/components/conversational/objections/ObjectionHandlingCard.tsx:7` | `analyze-objection-handling` | **Sem provedor** — heurística (`index.ts:155,170,246`) | `call_objections`, `call_objection_analysis`, `objection_library` | **0 / 0 / 0** | `useObjectionAnalysis.ts`, `useTranscribeRecording.ts:84` | 🟨 PARCIAL | Não é IA; 3 tabelas vazias |
| Linha do tempo de sentimento | `src/components/conversational/SentimentTimelineChart.tsx:64` | `analyze-sentiment-timeline` | Lovable Gateway · `LOVABLE_API_KEY` (`index.ts:91,102`) | `call_sentiment_timeline` | **0** | `useSentimentTimeline.ts:27`, `useTranscribeRecording.ts:48` | 🟨 PARCIAL | Tabela vazia |
| Momentos críticos | `src/components/conversational/CriticalMomentsList.tsx:7` | `detect-critical-moments` | Lovable Gateway · `LOVABLE_API_KEY` (`index.ts:142,145`) | `call_critical_moments` | **0** | `useCriticalMoments.ts`, `useTranscribeRecording.ts:56` | 🟨 PARCIAL | Tabela vazia |
| Menções a concorrentes | `src/components/conversational/CompetitorMentionsCard.tsx:7` | `detect-competitor-mentions` | **Sem provedor** — match contra `competitors_registry` (`index.ts:81,152`) | `competitor_mentions`, `competitors_registry` | **0 / 0** | `useCompetitorMentions.ts:38`, `useTranscribeRecording.ts:32` | 🟨 PARCIAL | Não é IA; registry de concorrentes nem foi semeado |
| Hub de Intel. Conversacional | `src/components/conversational/ConversationalIntelligenceHub.tsx:55` | `conversational-intelligence` | **Sem provedor** — agrega `call_recordings`/`call_insights` (`index.ts:56,70`) | (leitura) | **0** | `src/hooks/useConversationalIntelligence.ts:48` (fetch direto) | 🟨 PARCIAL | Agrega tabelas vazias → dashboard sempre zerado |
| Scorecard de coaching | `src/components/conversational/coaching/CoachingScorecardCard.tsx:15` | `aggregate-coaching-scorecard` | **Sem provedor** — média ponderada (`index.ts:132,174`) | `call_coaching_scorecards`, `salesperson_coaching_aggregates` | **0 / 0** | `useCoachingScorecard.ts`, `useTranscribeRecording.ts:94` | 🟨 PARCIAL | Não é IA; depende de 6 tabelas todas vazias |
| Ações de coaching (extração) | `src/components/conversational/CoachingActionsList.tsx:28` | `extract-coaching-actions` | Lovable Gateway · `LOVABLE_API_KEY` (`index.ts:44,83`) | `coaching_actions` | **0** | `useCoachingActions.ts`, `useTranscribeRecording.ts:40` | 🟨 PARCIAL | Tabela vazia |
| Ações de coaching (geração) | — (só via `useAICopilot.ts:153`) | `generate-coaching-actions` | Lovable Gateway · `LOVABLE_API_KEY` (`index.ts:31,130`) | `coaching_actions` | **0** | `src/hooks/ai/useAICopilot.ts:153` | 🟦 SUGERIDO_OU_INICIADO | Auth por `X-Cron-Secret` pronta mas **sem cron agendado**; sem UI própria |
| Oportunidades de coaching | `src/components/coaching/opportunities/CoachingOpportunitySummary.tsx:6` | `detect-coaching-opportunities` | Lovable Gateway (opcional) · `LOVABLE_API_KEY` (`index.ts:125,129`) | `coaching_opportunities`, `coaching_skill_benchmarks` | **0 / 0** | `useCoachingOpportunities.ts` | 🟨 PARCIAL | Tabelas vazias |
| Análise de gaps de skill | `src/components/coaching/skills/SkillGapSummary.tsx:6` | `analyze-skill-gaps` | Lovable Gateway · `LOVABLE_API_KEY` (`index.ts:88,29`) | `skill_assessments`, `skill_development_tracks` | **0 / 0** | `useSkillGapAnalyzer.ts:106` | 🟨 PARCIAL | Tabelas vazias |
| Preparação de sessão | `src/components/coaching/sessions/SessionScheduleDialog.tsx:6` | `coaching-session-prep` | Lovable Gateway · `LOVABLE_API_KEY` (`index.ts:120,143`) | `coaching_sessions` | **0** | `useCoachingSessions.ts:58` | 🟨 PARCIAL | Nenhuma sessão jamais criada |
| Impacto do coaching | `src/components/coaching/impact/CoachingImpactTracker.tsx:47` | `coaching-impact-summary` | **Sem provedor** — lê `coaching_impact_metrics` (`index.ts:34`) | `coaching_impact_metrics` | **0** | `useCoachingImpact.ts` | 🟨 PARCIAL | Não é IA; fonte vazia |
| Hub de Coaching Intelligence | `src/components/coaching/CoachingIntelligenceHub.tsx:25` | `coaching-intelligence` | **Sem provedor** — agrega `sales`/`activities` (`index.ts:32-34`) | (leitura) | n/a | `src/hooks/useCoachingIntelligence.ts` | 🟨 PARCIAL | Não é IA — é agregação SQL rotulada de "intelligence" |
| Coaching por vendedor | `src/components/analytics/SalespersonCoaching.tsx:16` | `salesperson-coaching` | Lovable Gateway · `LOVABLE_API_KEY` (`index.ts:133,167`) | — (efêmero) | n/a | `useSalespersonCoaching.ts:41`, `CoachingComparison.tsx:22` | 🟨 PARCIAL | Secret `NAO_VERIFICADO`; sem persistência |
| Análise comportamental | `src/components/ai/BehavioralAnalysisDialog.tsx:38` | `behavioral-analysis` | Lovable Gateway · `LOVABLE_API_KEY` (`index.ts:35,49`) | `automation_runs` (log) | — | `src/hooks/useBehavioralAnalysis.ts:45` | 🟨 PARCIAL | Só loga execução; sem tabela de resultado |
| Busca semântica (universal) | `src/components/semantic/SemanticSearchDialog.tsx:24`, `CommandPalette.tsx:90` | `semantic-search-universal` | Lovable Gateway · embeddings `google/text-embedding-004` (`index.ts:22,86`) | `semantic_index` | **0** | `src/hooks/semantic/useSemanticSearch.ts:20` | 🟨 PARCIAL | **Índice vazio → toda busca retorna nada** |
| Indexação semântica | (automática, sem UI) | `semantic-index-entity` | Lovable Gateway · embeddings (`index.ts:70,73,96`) | `semantic_index` | **0** | `useSalesData.ts:29`, `useClients.ts:26,41`, `useActivities.ts:426` | 🟨 PARCIAL | **3.746 disparos potenciais → 0 linhas**; falha silenciosa em `useIndexEntity.ts:12-15` |
| Reindexação em lote | `src/components/admin/SemanticReindexPanel.tsx:22` | `semantic-reindex-batch` | Sem IA direta (chama `semantic-index-entity`, `index.ts:88`) | `semantic_index` | **0** | `src/hooks/semantic/useReindexBatch.ts` | 🟨 PARCIAL | Painel admin existe e nunca produziu linha |
| Cobertura semântica | `src/components/admin/SemanticReindexPanel.tsx:22` | `semantic-coverage` | **Sem provedor** — RPC `get_semantic_coverage` (44 linhas) | `semantic_index` | **0** | `src/hooks/semantic/useSemanticCoverage.ts:17` | 🟨 PARCIAL | Sempre reportará 0% de cobertura |
| Busca semântica de produtos | `src/pages/SmartSearch.tsx:45` | `semantic-search` | Lovable Gateway (parse da query) · `LOVABLE_API_KEY` (`index.ts:49,53`) | RPC `search_products_semantic` (`index.ts:145`) | — | `src/hooks/useSemanticSearch.ts:32` (fetch direto) | 🟨 PARCIAL | **Não usa embeddings** — LLM extrai keywords e cai em busca textual; rotulado "semantic" indevidamente |
| Busca visual | `src/components/search/VisualSearchButton.tsx:73` | `visual-search` | Lovable Gateway · visão + embeddings (`index.ts:26,33,143`) | `semantic_index` | **0** | fetch direto em `VisualSearchButton.tsx:73` | 🟨 PARCIAL | Depende do índice vazio |
| NLQ (pergunte em português) | `src/components/nlq/DashboardNLQWidget.tsx:12`, `src/pages/AskAnything.tsx` | `nlq-query` | Lovable Gateway · 2 passes (`index.ts:181,191,288`) | — (efêmero) | n/a | `src/hooks/nlq/useNLQ.ts:44` | 🟨 PARCIAL | Secret `NAO_VERIFICADO`; sem log de uso |
| Próxima melhor ação | `src/components/ai/NextBestActionCard.tsx:61` | `next-best-action` | Lovable Gateway · `LOVABLE_API_KEY` (`index.ts:9,292`) | — (efêmero, sem insert) | n/a | `src/hooks/useNextBestAction.ts:35` | 🟨 PARCIAL | Nada persistido → impossível auditar uso |
| Inteligência preditiva | `src/components/predictive/PredictiveIntelligenceDashboard.tsx:25` | `predictive-intelligence` | Lovable Gateway opcional · `LOVABLE_API_KEY` (`index.ts:177,180`) | — (efêmero) | n/a | `src/hooks/usePredictiveIntelligence.ts:55` | 🟨 PARCIAL | IA é opcional (`includeAI`); núcleo é SQL |
| Explicação de score | `src/components/lead-scoring/LeadScoreExplainCard.tsx:38`, `DealCard.tsx` | `predictive-scoring-explain` | Lovable Gateway · `LOVABLE_API_KEY` (`index.ts:90,102`) | — (efêmero) | n/a | `useLeadScoreExplanation.ts`, `useExplainBatch.ts:15` | 🟨 PARCIAL | Sem persistência |
| Sugestões de automação | `src/components/automation/AutomationIntelligenceHub.tsx:24` | `automation-suggestions` | **Sem provedor** — regras sobre `automation_workflows`/`sales` (`index.ts:33-35`) | (leitura) | n/a | `useAutomationIntelligence.ts:41` | 🟨 PARCIAL | Não é IA — é motor de regras |
| Voz — TTS (assistente) | `src/components/settings/AIAssistantSettings.tsx:18` | `elevenlabs-tts` | **ElevenLabs** · `ELEVENLABS_API_KEY` (`index.ts:39,61`) | — (áudio) | n/a | `AIAssistantSettings.tsx` | 🟨 PARCIAL | Secret `NAO_VERIFICADO` |
| Voz — TTS (chat) | `src/components/assistant/SalesAssistantChat.tsx` | `elevenlabs-voice` | **ElevenLabs** · `ELEVENLABS_API_KEY` (`index.ts:13,29`) | — (áudio) | n/a | `src/hooks/useElevenLabsVoice.ts` | 🟨 PARCIAL | Secret `NAO_VERIFICADO` |
| Voz — STT | **nenhuma** | `elevenlabs-stt` | **ElevenLabs** · `ELEVENLABS_API_KEY` (`index.ts:39,67`) | — | n/a | **NINGUÉM** — 0 refs em `src/` e `supabase/migrations/` | ⬛ MORTO_OU_ABANDONADO | Função órfã deployada; nenhum chamador existe |

---

## 8. CONTAGEM POR CLASSIFICAÇÃO

Denominador: **42 funcionalidades** avaliadas (41 edge functions do escopo + a indexação semântica automática, que não tem UI própria mas é fio distinto).

| Classificação | Qtd | % | Leitura |
|---|---:|---:|---|
| ✅ IMPLEMENTADO_TOTAL | **0 / 42** | 0,0 % | Nenhuma feature de IA tem uso real comprovado no banco |
| 🟨 PARCIAL | **40 / 42** | 95,2 % | Código completo, provedor plugado, tabela vazia ou sem persistência |
| 🟦 SUGERIDO_OU_INICIADO | **1 / 42** | 2,4 % | `generate-coaching-actions` — cron preparado, nunca agendado |
| ⬛ MORTO_OU_ABANDONADO | **1 / 42** | 2,4 % | `elevenlabs-stt` — órfã, zero chamadores |

**Corte transversal — IA de verdade vs. rótulo "IA":**

| Natureza | Qtd | Funções |
|---|---:|---|
| Chamam LLM/embeddings de fato | **30 / 42** | Lovable Gateway (Gemini) |
| Chamam ElevenLabs (voz) | **3 / 42** | `elevenlabs-tts`, `-voice`, `-stt` |
| **Não chamam provedor algum** (heurística/SQL com nome de IA) | **9 / 42** | `analyze-conversation-metrics`, `analyze-question-quality`, `analyze-objection-handling`, `detect-competitor-mentions`, `conversational-intelligence`, `aggregate-coaching-scorecard`, `coaching-intelligence`, `coaching-impact-summary`, `automation-suggestions`, `semantic-coverage` |

---

## 9. VEREDITO

**1. Não são cascas — mas também não estão em produção.** O código é substancial e honesto: 30 funções fazem chamadas HTTP reais a um provedor real (Lovable AI Gateway/Gemini), com prompts preenchidos, validação de entrada, timeout (`fetchWithTimeout`) e tratamento de erro. Não encontrei uma única resposta de IA hardcoded, prompt vazio ou `Math.random()` fingindo score neste domínio.

**2. O veredito é sobre USO, não sobre CÓDIGO.** Pela regra de ouro (*pronto = em produção com uso real*), **zero features atingem ✅**. 31 tabelas de destino, 31 zeradas, 0 inserções em 23 dias, num banco que recebeu 3.746 inserções de CRM no mesmo período.

**3. O gargalo raiz é `call_recordings` = 0.** Doze funções (transcrição, diarização, resumo, sentimento, momentos críticos, perguntas, objeções, concorrentes, métricas, scorecard, ações de coaching) dependem de uma gravação existir. Nenhuma jamais foi enviada. Todo o pilar de Conversational Intelligence está bloqueado por um único pré-requisito não atendido.

**4. A busca semântica é o achado mais grave** — e o candidato a ✅ é **negado com dado**. Não é falta de integração: `useIndexEntity` já está plugado em vendas, clientes e atividades; as RPCs pgvector existem; o índice ivfflat existe. Mesmo assim, 0 linhas. O `try/catch` silencioso de `src/hooks/semantic/useIndexEntity.ts:12-15` transforma qualquer falha (provavelmente `LOVABLE_API_KEY` ausente, `semantic-index-entity/index.ts:97`) em um `console.warn` invisível. **É uma falha silenciosa por design, rodando em produção há pelo menos 23 dias.** Corrigir isto é o item de maior alavancagem do domínio: destrava busca semântica, busca visual e cobertura de uma vez.

**5. Nove funções vendem "IA" e entregam heurística.** `coaching-intelligence` agrega `sales`+`activities` com SQL; `aggregate-coaching-scorecard` faz média ponderada; `automation-suggestions` é motor de regras; `detect-competitor-mentions` faz match de string. São implementações legítimas — mas o nome promete um provedor que o código não usa. `semantic-search` (produtos) é o caso mais enganoso: usa LLM só para extrair keywords e depois cai em busca textual via `search_products_semantic` — **sem nenhum embedding**.

**6. Nada é automático.** Zero dos 11 cron jobs dispara IA. Toda a IA é sob demanda, por clique. Combinado com a ausência de gravações e a falha silenciosa de indexação, o resultado é um domínio que só produz output se um humano clicar — e ninguém clicou.

---

## 10. O QUE NÃO CONSEGUI VERIFICAR

| # | Item | Motivo |
|---|---|---|
| 1 | **Se `LOVABLE_API_KEY` existe** | `NAO_VERIFICADO`. Secrets de Edge Function vivem na plataforma Supabase Functions, fora do Postgres. `vault.secrets` retornou 0 linhas (query bem-sucedida, não negada), mas isso é o estado esperado de qualquer forma — o vault pgsodium não é onde essas variáveis ficam. Só verificável no painel Supabase ou invocando a função (fora do escopo somente-leitura). |
| 2 | **Se `ELEVENLABS_API_KEY` existe** | Mesmo motivo do item 1. |
| 3 | **Se as edge functions estão deployadas** | Li o código-fonte em `supabase/functions/`. Não verifiquei o estado de deploy no projeto — exigiria API de management, fora do guard-rail SELECT. |
| 4 | **Logs de invocação das edge functions** | Não acessíveis por SELECT no banco. Não sei se as funções foram chamadas e falharam, ou nunca foram chamadas. **A distinção importa**: no primeiro caso o problema é o secret; no segundo, é adoção. O `n_tup_ins=0` prova apenas que nada foi gravado. |
| 5 | **Histórico anterior a 2026-07-24** | `pg_stat_database.stats_reset = 2026-07-24`. Os contadores `n_tup_ins` cobrem 23 dias. Não posso afirmar "nunca houve linha desde sempre" — apenas "nenhuma linha em 23 dias, período em que o CRM recebeu 3.746 inserções". `n_live_tup=0` em todas confirma que, se algo existiu antes, foi apagado sem deixar rastro. |
| 6 | **Custo real gasto com o provedor** | Não há tabela de billing/uso de tokens no schema. Impossível medir se houve qualquer chamada faturada. |
| 7 | **Comportamento em runtime dos prompts** | Li o texto dos prompts no código, mas não executei nenhuma função. Não posso atestar qualidade das respostas, só que os prompts não estão vazios. |

---

*Auditoria somente-leitura. Nenhum arquivo do projeto foi alterado exceto este. Nenhum valor de secret foi impresso — apenas nomes.*
