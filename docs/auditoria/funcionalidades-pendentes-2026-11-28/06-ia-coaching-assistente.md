# IA, coaching e assistente

[Voltar ao índice](README.md)

74 itens não implementados, parciais ou não verificáveis neste domínio.

## Não implementado (12)

### F1091 · Shared playbooks com versionamento

- **Tipo:** Componente
- **O que os docs afirmam:** Falta playbooks compartilhados versionados.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:142`
- **O que falta:** Criar tabela playbook_versions (playbook_id, version, snapshot jsonb, created_by, created_at) com RLS + updated_at, trigger/função que grava versão a cada alteração de playbooks/playbook_items, e UI de histórico/restauração no hub de playbooks.
- **Evidência:** Banco real: tables/public/playbooks.md colunas :19-24 = id, stage, title, description, created_at, updated_at — sem coluna de versão; ls tables/public| grep playbook → expansion_playbooks, playbook_items, playbook_progress, playbooks (nenhuma playbook_versions). grep -rn "playbook_versions\\|playbook_version" src supabase → 0 resultados. \| CONTESTADO pelo cético (PARCIAL): Playbooks compartilhados existem: tables/public/playbooks.md:7 (RLS sim), policy 'Authenticated users can read playbooks' SELECT USING true (:80), e escrita restrita a admin/gestor. Leitura no front: src/hooks/sales/useSalesEnablement.ts:70-90 (usePlaybooks com from('playbooks') e playbook_items). UI: SalesEnablementHub.tsx:396, pipeline/DealPlaybookModal.tsx:42, pipeline/DealCard.tsx:96, playbooks/PlaybookCard.tsx:29,44 (useDuplicatePlaybook). O versionamento não existe: as colunas de playbooks.md não têm versão, nã…
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F1097 · Voice notes com transcrição

- **Tipo:** Componente
- **O que os docs afirmam:** Falta notas de voz transcritas.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:118`
- **O que falta:** Gravador de áudio (MediaRecorder) em atividade/nota, upload para bucket privado, função de transcrição deployada (na allowlist deploy.yml:144) e texto transcrito salvo na atividade (coluna/tabela com RLS).
- **Evidência:** ausente: grep -rn 'MediaRecorder\\|getUserMedia' src/ → 0 resultados; grep -rni 'voice_note\\|voiceNote\\|nota de voz\\|audio_note' src/ supabase/functions → 0. O que existe é SpeechRecognition do browser para navegação/assistente por voz (src/hooks/useVoiceNavigation.ts:50-69, src/hooks/useElevenLabsVoice.ts:200) e transcrição apenas de gravações de chamada já enviadas como arquivo (src/hooks/conversational/useTranscribeRecording.ts:10 → transcribe-call-recording, que está fora da allowlist .github/workflows/deploy.yml:144). docs/GAPS_CLASSE_MUNDIAL.md:118 continua listando como gap.| cético: Confirmado. ausente: grep -rln 'MediaRecorder\\|getUserMedia' src → 0 resultados; grep -rli 'voice_note\\|voicenote\\|nota de voz\\|audio_note\\|voice-note' src supabase → 0. SpeechRecognition só aparece em src/hooks/useVoiceNavigation.ts e src/hooks/useElevenLabsVoice.ts (navegação/assistente por…

### F1101 · Decisão reprocess_confidence=0.4 a formalizar

- **Tipo:** Doc/config
- **O que os docs afirmam:** Formalizar decisão reprocess_confidence=0.4 (decisão de negócio avulsa).
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:284-284`
- **O que falta:** O dono decide a regra (limiar de confiança para reprocessar), ela é documentada e um consumidor é implementado (constante/coluna lida por diarize-call-recording ou process-call-recording-ingest).
- **Evidência:** ausente: grep -rn reprocess_confidence src supabase scripts → 0 resultados; única ocorrência é docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:286 ('Aguarda operador'). Nenhuma função ou constante consome o valor 0.4 (grep '0\.4' em diarize-call-recording e process-call-recording-ingest → 0).| cético: Busca em todo o repo: grep -rn 'reprocess_confidence\\|reprocessConfidence\\|REPROCESS_CONF' → só docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:286 ('Aguarda operador'). Nenhum limiar 0.4 de confiança em functions ou src (grep -rnE 'confidence.{0,40}0\.4' → 0). Também não aparece em tables.md nem functions.md do banco real.

### F3593 · Extração de stakeholders única

- **Tipo:** Edge function
- **O que os docs afirmam:** Duas extrações de stakeholders.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:136`
- **O que falta:** Falta consolidar as duas extrações em uma única function.
- **Evidência:** pasta supabase/functions/extract-stakeholders/index.ts ausente| cético: A unificação não foi feita. Continuam existindo duas functions separadas: supabase/functions/extract-deal-stakeholders (invocada em src/hooks/deal-intelligence/useDealStakeholders.ts:143) e supabase/functions/extract-committee-from-call (invocada em src/hooks/deal-intelligence/useCommitteeCoverage.ts:163).

### F1113 · Health-check de secrets de IA (LOVABLE_API_KEY, ELEVENLABS_API_KEY)

- **Tipo:** Edge function
- **O que os docs afirmam:** NÃO VERIFICÁVEL: cofre fora do repo; função health existe em config.toml:77.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:174`
- **O que falta:** Endpoint protegido (admin) que diga se LOVABLE_API_KEY e ELEVENLABS_API_KEY existem (só booleano, nunca o valor), incluído na allowlist.
- **Evidência:** supabase/functions/health/index.ts:17-27 retorna apenas {status, version, timestamp}; comentário :4-7 'Sem auth e sem acesso a banco'. ausente: grep 'LOVABLE_API_KEY\\|ELEVENLABS_API_KEY' supabase/functions/health/ → 0. config.toml:88-89 registra health com verify_jwt=false, mas health está FORA da allowlist deploy.yml:144.| cético: supabase/functions/health/index.ts:17-22 retorna só {status, version, timestamp}, e :4-7 diz 'Sem auth e sem acesso a banco'. ausente: grep -rn '!!Deno.env.get\\|Boolean(Deno.env.get' supabase/functions → 0 (nenhuma função reporta presença de env). health também está fora da allowlist de deploy.yml:144.

### F1122 · Gravação automática de reuniões Zoom/Meet/Teams

- **Tipo:** Integração externa
- **O que os docs afirmam:** zoom/meet/graph.microsoft = 0; ingestão só por upload (useUploadCallRecording) e gravação Twilio.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:78`
- **O que falta:** Nenhum conector Zoom/Meet/Teams existe. Seria preciso edge function OAuth + webhook de gravação (ex.: zoom-recording-webhook) na allowlist deploy.yml:144, gravando em call_recording_ingest_jobs.
- **Evidência:** ausente: grep -rniE 'zoom\.us\|api\.zoom\|graph\.microsoft\|meet\.google\|google ?meet\|microsoft ?teams' src supabase scripts .github → 0 resultados. Única ingestão é upload manual: src/hooks/conversational/useUploadCallRecording.ts:40-49 (storage call-recordings) e :62-67 (insert call_recording_ingest_jobs); bucket existe (snapshot storage.md:8).
- **Revisão:** sem contestação cética concluída.

### F1126 · Integrações Zoom/Meet/Teams

- **Tipo:** Integração externa
- **O que os docs afirmam:** Não iniciadas.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:214`
- **O que falta:** Integração inexistente; mesma lacuna de F1122.
- **Evidência:** ausente: grep -rniE 'zoom\.us\|api\.zoom\|graph\.microsoft\|meet\.google\|microsoft ?teams' src supabase scripts .github → 0 resultados; ls supabase/functions| grep -iE 'zoom\|meet\|teams' → 0. Doc docs/GAPS_CLASSE_MUNDIAL.md:29,56 lista como gap.
- **Revisão:** sem contestação cética concluída.

### F1145 · Medição de consumo ElevenLabs

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Sem medição de consumo.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:137`
- **O que falta:** Criar tabela (ex.: ai_usage_logs com provider, chars, voice_id, salesperson_id, RLS) e gravar por chamada em elevenlabs-voice/index.ts; expor em Admin.
- **Evidência:** ausente: grep -nE 'eleven\|tts_usage\|voice_usage\|ai_usage\|api_usage' snapshot tables.md → 0 tabelas de consumo. supabase/functions/elevenlabs-voice/index.ts (a function chamada pela UI, useElevenLabsVoice.ts:125) não registra consumo (grep -iE 'usage\|consum\|credit\|insert' → 0). Só elevenlabs-tts/index.ts:82 tem ctx.log('tts_generate', {text_len}) — log efêmero, e elevenlabs-tts não tem chamador em src (grep → 0).
- **Revisão:** sem contestação cética concluída.

### F1150 · LMS integrado (cursos, certificações)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Falta LMS.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:194`
- **O que falta:** Criar tabelas de cursos/módulos/progresso/certificações com RLS, hooks e página roteada com progresso por vendedor e emissão de certificado (pode reaproveitar skill_development_tracks como trilha).
- **Evidência:** ausente: ls tables/public/| grep -iE 'course\|certif\|lms\|learning\|lesson\|curso' → 0 resultados; grep -rln -iE '\bcourses?\b\|certifications?\|lms' src/ (excl. types.ts) → só falsos positivos de telemetria (TelemetryTopOffenders.tsx, TelemetryCharts.tsx, useGhostCar.ts); grep -iE 'course\|certif\|training' src/routes/AppRoutes.tsx → 0 resultados. O mais próximo é sales_enablement_assets com categoria 'training' (SalesEnablementHub.tsx:75), sem progresso nem certificação. \| cético: Confirmado: ls tables/public \| grep -iE 'course\|certif\|lms\|lesson\|quiz\|academ' → 0 resultados; grep -rn -iE 'quiz\|certif' src/components/enablement → 0. O artefato mais próximo é public.skill_development_tracks (tables/public/skill_development_tracks.md: skill, current_level, target_level, milestones jsonb, ai_plan) exibido em src/components/coaching/skills/SkillTrackCards.tsx, mas é plano de desenv…

### F1153 · Simulação de ROI de IA

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Backlog crítico: demonstrar valor financeiro gerado pelas automações de IA (prioridade alta).
- **Fontes:** `docs/auditoria_enterprise_v5.md:70`
- **O que falta:** Criar tabela de uso/custo de IA por chamada (ver F1162), hook e página/aba de ROI de IA roteada comparando custo de tokens vs. valor gerado (deals influenciados por next-best-action, coaching etc.).
- **Evidência:** Única página ROI é de vendedores: src/pages/ROIDashboard.tsx (rota /roi AppRoutes.tsx:672-675, menu 'ROI Vendedores' sidebarMenuData.ts:283) com src/hooks/dashboard/useROIDashboard.ts:53-77 lendo salespeople/sales/activities — nada sobre IA. ausente: grep -rln -iE 'ROI de IA\|AI ROI\|aiRoi\|ai_roi\|ai_usage_events\|ai_usage' src/ supabase/functions → 0 resultados; ls tables/public/| grep -iE 'ai_usage\|ai_cost\|token\|llm\|roi' → só api_tokens/embedded_report_tokens (não relacionados). docs/auditoria_enterprise_v5.md:70 registra como backlog. \| CONTESTADO pelo cético (PARCIAL): Existe artefato de ROI de automações com sugestões de IA, roteado e com dado real: rota /automacao-inteligente (src/routes/AppRoutes.tsx:389-392, menu sidebarMenuData.ts:329) → src/pages/AutomacaoInteligente.tsx:3,9 → src/components/automation/AutomationIntelligenceHub.tsx:63,84 ('sugestões com IA, ROI em tempo …
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3610 · Wrapper callAI único em _shared com withRetry + circuit breaker para 46 functions de IA

- **Tipo:** Service/lib
- **O que os docs afirmam:** Doc aponta 46 functions de IA sem breaker nem retry; ação: helper callAI em _shared migrando os 46 call sites.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:290,295,576`
- **O que falta:** Criar o wrapper callAI em _shared combinando ai-gateway.ts, withRetry e circuit-breaker, e migrar as ~45 functions de IA para ele.
- **Evidência:** arquivo callAI ausente em src/| cético: O mecânico procurou em src/ (lugar errado), mas o veredito se mantém no lugar certo: não há callAI em supabase/functions/_shared (grep -rn 'callAI' supabase/functions/_shared → 0). supabase/functions/_shared/ai-gateway.ts:4-9 só centraliza a URL (importado por 39 index.ts), sem retry nem breaker. _shared/retry.ts e _shared/circuit-breaker.ts existem, mas das 45 functions que chamam o gateway de IA só forecast-narrative/index.ts:7 usa withRetry e nenhuma usa o circuit breaker. Há callAI/callAi locais e duplicados (ai-agent-orchestrator/index.ts:124, analyze-stage-conversion/index.ts:53).

### F3611 · Log mínimo de uso para saídas efêmeras de IA

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** NÃO INICIADO: sem tabela de log (copilot, email composer, NBA, predictive, scoring-explain, salesperson-coaching).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:179`
- **O que falta:** Tabela ai_usage_log (com RLS e updated_at) e gravação de cada chamada nas functions copilot, email composer, NBA, predictive, scoring-explain e salesperson-coaching.
- **Evidência:** tabela/view "ai_usage_log" ausente do banco real (tables.md, views.md)| cético: Nenhuma tabela de log de uso de IA no banco real: tables.md só tem ai_agent_actions, ai_agent_runs, ai_narrative_cache e ai_sales_insights (linhas 21-24), nenhuma de uso/chamada; grep -rln 'ai_usage\|ai_call_log\|ai_request_log\|llm_usage' supabase/functions src → 0. As functions citadas não gravam nada: ai-copilot, ai-email-composer, next-best-action, predictive-intelligence e salesperson-coaching têm 0 .insert/.upsert; predictive-scoring-explain só faz upsert em lead_score_explanations (index.ts:212), que é resultado e não log de uso.

## Parcial (57)

### F1076 · Botão "Ver Timeline" do RelationshipHealthGraph

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Doc: botão sem ação.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:107-107`
- **O que falta:** Dar onClick real ao 'Ver Timeline' (RelationshipHealthGraph.tsx:306), abrindo as atividades do stakeholder ou do deal, ou remover o botão.
- **Evidência:** src/components/deal-intelligence/committee/RelationshipHealthGraph.tsx:306-311: `<Button size="sm" ...><Search/> Ver Timeline</Button>` sem onClick/asChild/Link — botão morto permanece. Componente montado em src/pages/DealIntelligence.tsx:22,101 → AppRoutes.tsx:703 (/deal-intelligence).| cético: Confirmado: src/components/deal-intelligence/committee/RelationshipHealthGraph.tsx:306-311 tem <Button size="sm" className=...><Search/> Ver Timeline</Button>, sem onClick, asChild nem Link.

### F1080 · Botões/comandos sem handler real em ImprovementPlan

- **Tipo:** Ação/botão
- **O que os docs afirmam:** A auditoria confirmou botões/comandos visíveis sem handler real no módulo ImprovementPlan.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:234-234`
- **O que falta:** Dar handler real ao botão (ImprovementPlan.tsx:215), por exemplo criar tarefas a partir dos itens do plano, ou remover o botão.
- **Evidência:** src/components/competitive/ImprovementPlan.tsx:215-217: `<Button ...>Iniciar Transformação Digital</Button>` sem onClick — botão morto. Montado em src/pages/ArenaCompetitiva.tsx:62,373 → AppRoutes.tsx:807 (/arena).| cético: Confirmado: src/components/competitive/ImprovementPlan.tsx:215-217 tem <Button className=...><Sparkles/> Iniciar Transformação Digital</Button>, sem onClick. O componente está montado em src/pages/ArenaCompetitiva.tsx:62,373.

### F1082 · Botões/comandos sem handler real em IntelligenceSettings

- **Tipo:** Ação/botão
- **O que os docs afirmam:** A auditoria confirmou botões/comandos visíveis sem handler real no módulo IntelligenceSettings.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:234-234`
- **O que falta:** Persistir as preferências (Select e Switch) e implementar 'Salvar' e 'Resetar', ou marcar o dialog como 'em breve'.
- **Evidência:** src/components/purchase-intelligence/IntelligenceSettings.tsx: `<Switch defaultChecked />` :101 sem onCheckedChange, botões 'Resetar' :105-107 e 'Salvar Alterações' :108-110 sem onClick; grep -c "useState\\|useMutation\\|supabase\\|onValueChange\\|onCheckedChange" → 0 — nada é persistido. Montado em PurchaseIntelligenceHub.tsx:23,97 → src/pages/PurchaseIntelligence.tsx:7 → AppRoutes.tsx:701.| cético: Confirmado em src/components/purchase-intelligence/IntelligenceSettings.tsx: <Select defaultValue="realtime"> (:77) sem onValueChange, <Switch defaultChecked /> (:101) sem onCheckedChange, e os Buttons 'Resetar' (:105-107) e 'Salvar Alterações' (:108-110) sem onClick. O dialog está montado em PurchaseIntelligenceHub.tsx:23,97.

### F1094 · UI useDealChatHistory: timeline de coaching no detalhe do deal

- **Tipo:** Componente
- **O que os docs afirmam:** Falta timeline de coaching no detalhe do deal para useDealChatHistory (UI atual: 4 imports).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:56`
- **O que falta:** Montar a timeline de coaching (DealChatHistory) no card ou drawer do deal em /vendas (SaleHUDCard) ou em /deal-intelligence.
- **Evidência:** Hook usado: src/components/assistant/SalesAssistantChat.tsx:18 importa useDealChatHistory; componente src/components/assistant/DealChatHistory.tsx montado em DealPreviewCard.tsx:27,279 → SalesAssistantChat.tsx:21,309 → src/pages/Assistente.tsx → AppRoutes.tsx:946. Porém grep -rn "useDealChatHistory\\|DealChatHistory" src/pages/DealIntelligence.tsx src/components/deal-intelligence → 0 resultados: não há timeline de coaching no detalhe do deal, só dentro do assistente.| cético: DealChatHistory (src/components/assistant/DealChatHistory.tsx:34-50) tem estados de loading e vazio, lê deal_chat_history (useDealChatHistory.ts:34-35) e só é importado em DealPreviewCard.tsx:27, dentro do assistente. Não há tela de detalhe do deal: AppRoutes.tsx:1117-1120 redireciona /vendas/:id para /vendas. grep DealChatHistory em src/pages/DealIntelligence.tsx e em src/components/deal-intelligence → 0 resultado…

### F1095 · UI useNextBestAction: card persistente em todas as telas operacionais

- **Tipo:** Componente
- **O que os docs afirmam:** Falta card persistente em todas as telas operacionais para useNextBestAction (UI atual: 2 imports).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:58`
- **O que falta:** Card compacto de Next Best Action no MainLayout ou nas telas /vendas, /clientes e /atividades, com loading, erro e vazio.
- **Evidência:** useNextBestAction é importado por 4 componentes (grep -rln "from '@/hooks/useNextBestAction'" src): ai/NextBestActionCard.tsx (montado em src/pages/VendedorDashboard.tsx), race/NextRaceActionCard.tsx (src/pages/RaceArenaHub.tsx), tasks/NextBestAction.tsx e dashboard/widgets/AISalesCoachWidget.tsx (DashboardCustom, AppRoutes.tsx:258); NextBestActionPanel em src/pages/DealIntelligence.tsx. grep -rn "NextBestAction" src/components/layout → 0: não há card persistente no layout/telas operacionais (Vendas, Clientes, Atividades).| cético: useNextBestAction é importado só por NextBestActionCard (VendedorDashboard.tsx:27), tasks/NextBestAction (Tarefas.tsx:3), race/NextRaceActionCard e AISalesCoachWidget. grep 'NextBestAction' em src/components/templates, src/components/layout, src/pages/Vendas.tsx, Clientes.tsx e Atividades.tsx → 0 resultados. Não há card persistente.

### F3573 · Agendamento (cron) generate-coaching-actions (2 afirmações nos docs)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** NÃO INICIADO: X-Cron-Secret sem cron; 0 refs em migrations.| cron.job tem 11 jobs, nenhum chama função de IA; generate-coaching-actions tem auth X-Cron-Secret mas não há cron.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:175`, `docs/estado/06_DOMINIO_IA_COACHING.md:206-208`
- **O que falta:** Não há cron periódico, só disparo por trigger, e call_recordings está vazia em produção. Não verifiquei se public._internal_secrets tem 'coaching_cron_secret' e 'functions_base_url'. Sem essas chaves o trigger só emite WARNING (trigger_auto_coaching_on_recording:34) e não chama a function.
- **Evidência:** Não existe job pg_cron: grep -i coaching cron.md → 0 resultados. A function está deployada: allowlist em .github/workflows/deploy.yml:144, item 63 = generate-coaching-actions. O disparo acontece por evento, com dois triggers no banco real em public.call_recordings: triggers.md:64 (trg_auto_coaching_after_summary → trigger_auto_coaching_on_recording) e triggers.md:65 (trg_recording_generate_coaching). Os corpos fazem net.http_post para '/generate-coaching-actions' com X-Cron-Secret lido de public._internal_secrets: functions/public/trigger_auto_coaching_on_recording__12ae32cb1ec02d01.sql:29-43 e trg_recording_generate_coaching__12ae32cb1ec02d01.sql:22-34. O handler valida X-Cron-Secret contra coaching_cron_secret em supabase/functions/generate-coaching-actions/index.ts:49-65.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3574 · Agendamento (cron) semantic-reindex-batch (2 afirmações nos docs)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** semantic-reindex-batch é edge batch sem cron e sem auth de cron; não tem invoke nenhum (nunca roda).| NÃO VERIFICÁVEL/provável NÃO INICIADO: reindex só pelo painel admin SemanticReindexPanel.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:167`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:173`
- **O que falta:** Falta deployar semantic-reindex-batch (hoje o painel manual recebe 404 em produção). Falta criar um job em pg_cron com auth de cron, ou decidir que o reindex é só manual. Falta popular semantic_index.
- **Evidência:** Sem agendamento: grep -i 'semantic\|reindex' cron.md → 0 resultados. Sem auth de cron: grep -ci cron supabase/functions/semantic-reindex-batch/index.ts → 0. A function está fora da allowlist: .github/workflows/deploy.yml:144 não contém semantic-reindex-batch. O único gatilho é manual: src/hooks/semantic/useReindexBatch.ts:26 invoca 'semantic-reindex-batch', e SemanticReindexPanel está montado em src/pages/AdminDashboard.tsx:29,207. A tabela public.semantic_index existe com RLS (tables.md:325).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3575 · Cron de cleanup_expired_narrative_cache

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Limpeza de cache de narrativa sem cron nem chamador.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:89,177`
- **O que falta:** Falta o cron.schedule chamando public.cleanup_expired_narrative_cache() (migration e job em pg_cron).
- **Evidência:** A função existe no banco real: functions.md:129 (public.cleanup_expired_narrative_cache, retorna integer, grant service_role). O corpo faz DELETE FROM public.ai_narrative_cache WHERE expires_at < now() (functions/public/cleanup_expired_narrative_cache__12ae32cb1ec02d01.sql). A tabela existe com RLS (tables.md:23). Não há agendamento: grep -i narrative cron.md → 0 resultados. Não há chamador: grep -rn cleanup_expired_narrative_cache src supabase/functions → só types.ts. Nas migrations aparece apenas a criação e o grant (20260712222949:45, 20260831130000:645-647).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F1100 · Camada IA/coaching: análise/diarização de chamadas, copiloto, forecast, BI por papel, NLQ

- **Tipo:** Doc/config
- **O que os docs afirmam:** ARCHITECTURE descreve análise/diarização de chamadas, coaching intelligence, copiloto/assistente, forecast e BI por papel (BISDR/BICloser/BIVendedor/BIGestor) e busca semântica (NLQ).
- **Fontes:** `docs/ARCHITECTURE.md:44-46`
- **O que falta:** Colocar nlq-query, process-call-recording-ingest e transcribe-call-recording/summarize-call-recording na allowlist deploy.yml:144, liberando vagas (ex.: ai-copilot órfã), ou tirar /perguntar e o cron. Confirmar LOVABLE_API_KEY nos secrets.
- **Evidência:** BI por papel: rotas /bi-vendedor, /bi-sdr, /bi-closer, /bi-gestor em src/routes/AppRoutes.tsx:622-626; useBISDR.ts:86-106 lê sales/activities reais. Busca semântica: /busca AppRoutes.tsx:950, semantic-search NA allowlist. Coaching: useCoachingIntelligence.ts:36 → coaching-intelligence NA allowlist. Chamadas: analyze-call (useCallRecordings.ts:180) e diarize-call-recording (useDiarizeRecording.ts:9) NA allowlist. Lacunas: nlq-query FORA da allowlist deploy.yml:144 embora /perguntar (AppRoutes.tsx:948) a invoque em src/hooks/nlq/useNLQ.ts:53; ai-copilot FORA da allowlist e sem chamador (grep 'ai-copilot' src/ → 0); process-call-recording-ingest FORA da allowlist mas cron a cada minuto a invoca (cron.md:29 process-call-recording-ingest-1min); transcribe-call-recording e summarize-call-recording FORA da allowlist. Chave LOVABLE_API_KEY: NÃO VERIFICADO (cofre fora do repo).| cético: Confirma…

### F1102 · Feature flag ai_copilot liga PersonalAssistantDrawer (personal-assistant-stream)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc: MainLayout.tsx:81 depende de `feature_flags` (`ai_copilot`); useRaceSmartNotifications.ts:38 idem; edge `ai-copilot` sem chamador, drawer usa `personal-assistant-stream`.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:170-170`
- **O que falta:** Remover supabase/functions/ai-copilot (órfã) ou dar a ela um chamador. Opcional: criar a linha ai_copilot em feature_flags para deixar o estado explícito.
- **Evidência:** src/components/templates/MainLayout.tsx:81 useFeatureGate('ai_copilot') e :213-217 monta <PersonalAssistantDrawer/>; src/hooks/useFeatureFlags.ts:110 fallback=true (ligado por padrão sem linha). Banco: feature_flags tem RLS e 1 linha (contexto/supabase/stats.md:148), seed é race_smart_notifications (migrations.md:637) → não há linha ai_copilot, estado = default ligado. Drawer invoca personal-assistant-stream (src/hooks/assistant/usePersonalAssistant.ts:12,28,50 SSE) que ESTÁ na allowlist deploy.yml:144. useRaceSmartNotifications.ts:36 usa race_smart_notifications, não ai_copilot (doc incorreta). ai-copilot: sem chamador (grep src/ → 0) e FORA da allowlist — nem usada nem removida.| cético: Confirmado. src/components/templates/MainLayout.tsx:81 chama useFeatureGate('ai_copilot') e :213-217 monta <PersonalAssistantDrawer/>. src/hooks/useFeatureFlags.ts:110-117 usa fallback=true, ou seja, …

### F1105 · Rotulagem de funções heurísticas como regras (não "IA")

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE (rótulo): metrics, question-quality, objection-handling, competitor-mentions, coaching-intelligence, automation-suggestions, coaching-impact.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:178`
- **O que falta:** Trocar 'IA' por 'regras'/'análise automática' nos textos da UI (CoachingIntelligenceHub.tsx:77 e cards relacionados), ou ligar essas funções ao gateway.
- **Evidência:** Confirmado heurístico: grep LOVABLE em coaching-intelligence, analyze-objection-handling, analyze-conversation-metrics, analyze-question-quality, detect-competitor-mentions, automation-suggestions, coaching-impact-summary → 0 resultados. Docs já rotulam: docs/estado/06_DOMINIO_IA_COACHING.md:233-247 ('Sem provedor — heurística'). UI ainda rotula como IA: src/components/coaching/CoachingIntelligenceHub.tsx:77 'priorização automática por IA' (hook coaching-intelligence sem provedor). Sidebar/menus mantêm 'Inteligência de Chamadas' (sidebarMenuData.ts:151).| cético: Confirmado. Nenhum dos 7 index.ts (coaching-intelligence, analyze-objection-handling, analyze-conversation-metrics, analyze-question-quality, detect-competitor-mentions, automation-suggestions, coaching-impact-summary) tem referência a LOVABLE, ai-gateway ou callAI (grep → none). A UI ainda chama de IA: src/components/coaching/…

### F1109 · Webhook externo twilio-call-status ausente do config.toml (verify_jwt=true por padrão)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Função com papel "callback Twilio" não está em supabase/config.toml, logo fica com verify_jwt=true e rejeitaria 401 chamadores externos sem JWT Supabase. Doc marca como pendente de correção.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:67-77`
- **O que falta:** Colocar as 3 funções Twilio na allowlist deploy.yml:144, ou declarar o módulo inativo e esconder o click-to-call.
- **Evidência:** Gap do doc já corrigido: supabase/config.toml:79-80 `[functions.twilio-call-status] verify_jwt = false`; função valida X-Twilio-Signature (supabase/functions/twilio-call-status/index.ts:3,113,121-131 → 401 invalid_signature). Porém twilio-call-status, twilio-call-twiml e twilio-click-to-call NÃO estão na allowlist .github/workflows/deploy.yml:144 → não deployadas em produção.| cético: supabase/config.toml:79-80 tem [functions.twilio-call-status] verify_jwt = false, e a assinatura é validada em supabase/functions/twilio-call-status/index.ts:129-131 (401 invalid_signature). Mas twilio-call-status, twilio-call-twiml e twilio-click-to-call estão FORA da allowlist de deploy.yml:144 (conferido), e mesmo assim src/hooks/dialer/useClickToCall.ts:46 invoca twilio-click-to-call. Nenhuma doc registra que o Twilio foi desligado de propósito (docs/agentes/mapa-do-sistema.md:76 ainda o lista como int…

### F1110 · Webhook externo twilio-call-twiml ausente do config.toml (verify_jwt=true por padrão)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Função com papel "callback Twilio (retorna TwiML)" não está em supabase/config.toml, logo fica com verify_jwt=true e rejeitaria 401 chamadores externos sem JWT Supabase. Doc marca como pendente de correção.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:67-78`
- **O que falta:** Mesma ação de F1109: entrar na allowlist ou declarar o Twilio inativo.
- **Evidência:** Gap do doc já corrigido: supabase/config.toml:82-83 `[functions.twilio-call-twiml] verify_jwt = false`; assinatura validada em supabase/functions/twilio-call-twiml/index.ts:3,112,118-128 (401 invalid_signature). URL é montada por twilio-click-to-call/index.ts:204. As três funções Twilio estão FORA da allowlist deploy.yml:144.| cético: supabase/config.toml:82-83 tem [functions.twilio-call-twiml] verify_jwt = false, e a assinatura é validada em supabase/functions/twilio-call-twiml/index.ts:11,126-127. A função está FORA da allowlist de deploy.yml:144.

### F1111 · AI agents autônomos (respondem leads sozinhos)

- **Tipo:** Edge function
- **O que os docs afirmam:** Falta agentes IA autônomos.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:170`
- **O que falta:** Deployar ai-agent-orchestrator, criar um gatilho inbound (webhook WhatsApp/email ou cron) que inicie a execução com auto_execute e enviar a resposta pelo canal, com log em ai_agent_actions.
- **Evidência:** Existe supabase/functions/ai-agent-orchestrator/index.ts (SYSTEM_PROMPT 'agente de vendas autônomo' :110; requires_approval/auto_execute só admin-manager :183-197), hooks src/hooks/agents/useStartAgentRun.ts:22 e useApproveAgentRun.ts:17, página /agentes (src/routes/AppRoutes.tsx:951 → AIAgents.tsx), tabelas ai_agent_runs/ai_agent_actions com RLS (tables/public/ai_agent_runs.md) e 0 linhas (stats.md:177). Mas: ai-agent-orchestrator FORA da allowlist deploy.yml:144 (não deployada), sem cron (cron.md → 0), e nenhum gatilho inbound chama IA (whatsapp-inbound-webhook sem LOVABLE, também fora da allowlist). Não há agente que responda lead sozinho.| cético: Existem supabase/functions/ai-agent-orchestrator, os hooks src/hooks/agents/useStartAgentRun.ts:18 e useApproveAgentRun.ts:13 (invoke), a rota /agentes (src/routes/AppRoutes.tsx:951) e as tabelas ai_agent_runs/ai_agent_actions com RLS (tab…

### F3576 · B8 ai-hardening prompt injection (PR #268)

- **Tipo:** Edge function
- **O que os docs afirmam:** LEDGER: EM VOO, PR #268 OPEN fix/hermes-908799-prompt-injection-ai-fns.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/LEDGER_EXECUCAO_2026-10-14.md:17`
- **O que falta:** Das 6 functions endurecidas, só sales-assistant-chat está deployada. As outras 5 estão fora da allowlist de deploy.yml:144. As demais functions de IA não receberam a delimitação instrução/dado: grep -rln untrusted supabase/functions → só sales-assistant-chat. O ledger que mostra a PR como 'EM VOO/OPEN' está desatualizado.
- **Evidência:** A PR #268 foi mergeada: commit 485ac7bf0 (14/10/2026) é ancestral de HEAD (git merge-base --is-ancestor → ok). Mensagem: 'fix(auth): separa instrução de dado nas functions de IA e restringe papéis/auto_execute (A5 + #18) (#268)'. Ela tocou ai-agent-orchestrator, ai-copilot, generate-loss-coaching, run-retry-tests, sales-assistant-chat e stress-test-contracts. A delimitação está viva em supabase/functions/sales-assistant-chat/index.ts:351-385 (untrustedDataBlock, <dados_vendedor>, regra 'DADO não confiável'). sales-assistant-chat está na allowlist (deploy.yml:144, item 90).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3577 · Detecção de momentos-chave (preço, concorrente, objeção, próximo passo)

- **Tipo:** Edge function
- **O que os docs afirmam:** Falta detecção automática de momentos-chave em calls.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:32`
- **O que falta:** A cadeia automática depende de transcribe-call-recording, que está fora da allowlist (deploy.yml:144). Em produção, então, a detecção só roda pelo botão manual e se já houver transcript. call_recordings está vazia, então nunca rodou. Também não há trigger nem cron no banco chamando detect-critical-moments.
- **Evidência:** A detecção existe em supabase/functions/detect-critical-moments/index.ts. O enum moment_type (linhas 33-43) cobre objection, price_mention, competitor, next_step e outros, com timestamp_sec. A function grava em call_critical_moments (linhas 183-202). Ela ESTÁ na allowlist (deploy.yml:144, item 40), o que corrige o cético. A tabela existe com RLS (tables.md:55; tables/public/call_critical_moments.md:7). Na UI, src/hooks/conversational/useCriticalMoments.ts:73 invoca a function. O botão manual está em CriticalMomentsList.tsx:20, montado via RecordingSummaryDrawer.tsx:117 → ConversationalIntelligenceHub.tsx:541. O feed CriticalMomentsFeed está em src/pages/BIGestor.tsx:466. O disparo automático fica em useTranscribeRecording.ts:61, encadeado após a transcrição.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3578 · Edge function ai-agent-orchestrator (16 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Só com aprovação humana (parcial); auto_execute=false.| ai-agent-orchestrator exige aprovação humana (requires_approval); existe /agentes. \| Dialog em AgentLauncherDialog.tsx:30 via useStartAgentRun.ts:18. Edge function ai-agent-orchestrator; Lovable Gateway (index.ts:9,117). Nenhum run registrado. \| .from('leads') em ai-agent-orchestrator/index.ts:300 aponta para tabela inexistente. \| L531 P: ai-agent-orchestrator/index.ts:177-181. \| Com auto_execute=true, add_note/schedule_followup/update_lead_score executam via service role sem clamp 0-100 nem checagem de propriedade. \| Conjunto de edge functions do assistente/copilot de vendas. \| Catálogo API.md lista a edge function `ai-agent-orc…
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:214`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:79`, `docs/estado/06_DOMINIO_IA_COACHING.md:223`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:100`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:275`, `docs/auditoria/RELATORIO_FALHAS.md:531-535` e mais 10
- **O que falta:** Falta deployar a function (fora da allowlist, então o front recebe 404). Falta trocar a relação 'leads' por uma tabela existente. Falta validar runs gravando em ai_agent_runs e ai_agent_actions.
- **Evidência:** supabase/functions/ai-agent-orchestrator/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: supabase/functions/ai-agent-orchestrator/index.ts existe e está FORA da allowlist (deploy.yml:144). Ao contrário do que diz o veredito inicial, não é órfã: src/hooks/agents/useStartAgentRun.ts:22 e useApproveAgentRun.ts:17 invocam 'ai-agent-orchestrator'. O index.ts:294 faz .from('leads'), e public.leads não existe no banco real (`grep 'public.leads' tables.md` → 0).

### F3579 · Edge function ai-copilot (16 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** FAB em AICopilotFab.tsx:21 via useAICopilot.ts:68,124,161. Edge function ai-copilot; Lovable Gateway com LOVABLE_API_KEY (index.ts:114,201). Efêmero; secret NAO_VERIFICADO; zero rastro de uso.| ai-copilot aceita anônimo e consulta salespeople por salespersonId controlado pelo atacante usando service_role. \| context.page/context.extra concatenados no systemPrompt sem delimitação. \| Bons contraexemplos: ai-copilot e dispatch-webhook fazem getUser + checagem de ownership. \| ai-copilot órfã; copiloto real é personal-assistant-stream. \| Chamadas de IA sem cache geram custo repetido; recomenda cache por hash de contexto com TTL. \| ai-copilot tem 0 chamadores em src; useAICopilot não existe; …
- **Fontes:** `docs/estado/06_DOMINIO_IA_COACHING.md:220`, `docs/reports/BACKEND_ANALYSIS_REPORT.md:277-302`, `docs/auditoria/RELATORIO_FALHAS.md:543-546`, `docs/auditoria/RELATORIO_FALHAS.md:384`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:212`, `docs/reports/BACKEND_ANALYSIS_REPORT.md:751-766` e mais 11
- **O que falta:** A function é código morto (sem chamador e não deployada). Falta remover ou religar a uma UI, e corrigir os docs.
- **Evidência:** supabase/functions/ai-copilot/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: supabase/functions/ai-copilot/index.ts existe e está FORA da allowlist (deploy.yml:144). Não tem chamador: `grep -rln "'ai-copilot'" src supabase/functions supabase/migrations` → 0. O hook useAICopilot e o AICopilotFab foram removidos no commit 9e4b2231a (PR #217). O copiloto real é PersonalAssistantDrawer (src/components/assistant/PersonalAssistantDrawer.tsx:22).

### F3580 · Edge function calculate-committee-coverage (11 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Doc classifica como REAL. Chamador(es): FE hooks/deal-intelligence/useCommitteeCoverage.ts:193, useDealStakeholders.ts:107 (+1); FN extract-committee-from-call, extract-deal-stakeholders. Só SUPABASE_*.| supabase/functions/calculate-committee-coverage não passa no parser do Deno: byte U+0001. \| supabase/functions/calculate-committee-coverage existe no repo (citada em src/: sim); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 100 funções do plano). Status no doc: BLOQUEADO. \| calculate-committee-coverage, calibrate-win-probabilities, calibrate-win-probability e coaching-impact-summary existem localmente mas não estão implantadas em nenhum projeto. \| calculate…
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:61-61`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:281-281`, `docs/prod-readiness.md:287`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:307-307`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:249-261`, `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:181-181` e mais 5
- **O que falta:** Falta deployar a function: hoje recebe 404 e deal_committee_coverage fica vazia.
- **Evidência:** supabase/functions/calculate-committee-coverage/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/deal-intelligence/useCommitteeCoverage.ts, extract-committee-from-call, extract-deal-stakeholders| cético: supabase/functions/calculate-committee-coverage existe e está FORA da allowlist (deploy.yml:144). Tem chamadores reais: src/hooks/deal-intelligence/useCommitteeCoverage.ts, src/hooks/deal-intelligence/useDealStakeholders.ts, extract-committee-from-call/index.ts e extract-deal-stakeholders/index.ts.

### F3581 · Edge function coaching-impact-summary (7 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `coaching-impact-summary` na categoria "Coaching" com auth "Bearer manual · verify_jwt", método "só POST", payload "—" e resposta "JSON {error, summary}".| 115 linhas; chamador: FE src/hooks/coaching/useCoachingImpact.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): coaching_impact_metrics(0). Classificação do doc: PARCIAL. \| Doc classifica como REAL. Chamador(es): FE hooks/coaching/useCoachingImpact.ts:40. Só agrega coaching_impact_metrics (RLS do usuário). \| supabase/functions/coaching-impact-summary não passa no parser do Deno: byte U+0001. \| supabase/functions/coaching-impact-summary existe no repo (citada em src/: sim); sonda…
- **Fontes:** `docs/API.md:109-109`, `docs/estado/10_EDGE_FUNCTIONS.md:341-341`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:70-70`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:285-285`, `docs/prod-readiness.md:295`, `docs/estado/06_DOMINIO_IA_COACHING.md:244` e mais 1
- **O que falta:** Falta deployar a function e popular coaching_impact_metrics.
- **Evidência:** supabase/functions/coaching-impact-summary/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/coaching/useCoachingImpact.ts| cético: supabase/functions/coaching-impact-summary existe e está FORA da allowlist (deploy.yml:144). O chamador é src/hooks/coaching/useCoachingImpact.ts.

### F3582 · Edge function elevenlabs-stt (16 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Há functions no repo não publicadas em produção; exemplo citado: elevenlabs-stt responde 404.| Existe no repo, mas health retorna 404 em produção. \| supabase/functions/elevenlabs-stt existe no repo (citada em src/: não); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 100 funções do plano). Status no doc: BLOQUEADO. \| elevenlabs-stt sem chamador e não deployada (docs/runbooks/elevenlabs.md:10-14). \| NÃO INICIADO. \| 0 chamadores (src, migrations e functions). DIVERGENTE. \| FAQ cita 404 por function não deployada. \| Speech-to-Text e Text-to-Speech via ElevenLabs para o assistente. \| PARCIAL (14/24 ainda órfãs): elevenlabs-stt segue com 0 chamadores. \| Catá…
- **Fontes:** `docs/RUNBOOK.md:43-44`, `docs/runbooks/elevenlabs.md:10-14,29,46-48`, `docs/prod-readiness.md:320`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:137`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:176`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:77` e mais 12
- **O que falta:** Falta deployar e ligar a uma UI de voz, ou remover. Não deu para verificar o secret ELEVENLABS_API_KEY.
- **Evidência:** supabase/functions/elevenlabs-stt/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: supabase/functions/elevenlabs-stt existe e está FORA da allowlist (deploy.yml:144). Não tem chamador: `grep -rln "'elevenlabs-stt'" src supabase/functions supabase/migrations` → 0.

### F3583 · Edge function generate-loss-coaching (13 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `generate-loss-coaching` na categoria "Coaching" com auth "nenhuma detectada no handler · verify_jwt", método "qualquer", payload "salesperson_id" e resposta "JSON {error, skipped}".| 94 linhas; chamador: **nenhum**; verify_jwt true (default); tabelas tocadas (linhas em produção): coaching_sessions(0). Classificação do doc: MORTO_OU_ABANDONADO (sem chamador). \| Doc classifica como ÓRFÃ. Chamador(es): nenhum. Sem chamador. Usa service_role sem checar papel/posse do analysis_id (index.ts:26-27). \| supabase/functions/generate-loss-coaching existe no repo (citada em src/: não); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 1…
- **Fontes:** `docs/API.md:114-114`, `docs/estado/10_EDGE_FUNCTIONS.md:386-386`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:115-115`, `docs/prod-readiness.md:340`, `docs/estado/09_HOOKS_SERVICES.md:291-311`, `docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md:189` e mais 7
- **O que falta:** Falta um chamador e o deploy, ou a remoção da function.
- **Evidência:** supabase/functions/generate-loss-coaching/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: supabase/functions/generate-loss-coaching existe e está FORA da allowlist (deploy.yml:144). Não tem chamador: `grep -rln "'generate-loss-coaching'" src supabase/functions supabase/migrations` → 0.

### F3584 · Edge function nlq-query (17 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** supabase/functions/nlq-query não passa no parser do Deno: import aninhado/quebrado.| JÁ RESOLVIDO. \| Catálogo API.md lista a edge function `nlq-query` na categoria "IA / Forecast" com auth "JWT do usuário (RLS) · verify_jwt", método "só POST", payload "question, conversation" e resposta "JSON {error, answer, data, tool_calls, period, start}". \| Citada como função de consulta em linguagem natural que chama o gateway de IA. \| 665 linhas; chamador: FE src/hooks/nlq/useNLQ.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): activities(2228), sales(954), salespeople_public(0). Classificação do doc: IMPLEMENTADO_TOTAL. \| Doc classifica como REAL. Chamador(es): FE hooks/nlq/us…
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:286-286`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:123`, `docs/API.md:171-171`, `docs/reports/BACKEND_ANALYSIS_REPORT.md:751-751`, `docs/estado/10_EDGE_FUNCTIONS.md:398-398`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:129-129` e mais 11
- **O que falta:** Falta deployar a function (o NLQ do front recebe 404).
- **Evidência:** supabase/functions/nlq-query/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/nlq/useNLQ.ts| cético: supabase/functions/nlq-query existe e está FORA da allowlist (deploy.yml:144). O chamador é src/hooks/nlq/useNLQ.ts.

### F3585 · Edge function process-call-recording-ingest (7 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** 145 linhas; chamador: FE src/hooks/conversational/useUploadCallRecording.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): call_recordings(0). Classificação do doc: PARCIAL.| Doc classifica como REAL. Chamador(es): cron 1min (mig 20260910153000:94); FE hooks/conversational/useUploadCallRecording.ts:85. Depende de _internal_secrets. \| supabase/functions/process-call-recording-ingest existe no repo (citada em src/: sim); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 100 funções do plano). Status no doc: BLOQUEADO. \| Uploader em CallRecordingUploader.tsx:14 via useUploadCallRecording.ts. Edge function process-call-recording-ingest; sem IA, st…
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:412-412`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:143-143`, `docs/prod-readiness.md:368`, `docs/estado/06_DOMINIO_IA_COACHING.md:225`, `docs/API.md:266-266`, `docs/FAQ_TROUBLESHOOTING.md:13` e mais 1
- **O que falta:** Falta deployar a function: hoje o cron e o upload chamam um endpoint inexistente.
- **Evidência:** supabase/functions/process-call-recording-ingest/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: A function existe e está FORA da allowlist (deploy.yml:144). Ao contrário do veredito inicial, não é órfã: src/hooks/conversational/useUploadCallRecording.ts:85 a invoca, e há cron no banco real (cron.md:29, job 39 'process-call-recording-ingest-1min' via trigger_internal_edge_job, rodando segundo cron-runs.md:204). Como a function não está deployada, o cron dispara contra um endpoint que dá 404.

### F3586 · Edge function salesperson-coaching (7 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** SalespersonCoaching.tsx:16 via useSalespersonCoaching.ts:41 e CoachingComparison.tsx:22. Edge function salesperson-coaching; Lovable Gateway (index.ts:133,167). Efêmero; secret NAO_VERIFICADO.| Catálogo API.md lista a edge function `salesperson-coaching` na categoria "Coaching" com auth "nenhuma detectada no handler · verify_jwt", método "qualquer", payload "—" e resposta "JSON {error, salesperson, id, name, avatar_url}". \| Doc lista a edge function `salesperson-coaching` (#20) — coaching inteligente. Auth: JWT. \| Coaching personalizado baseado em padrões de win/loss via IA. \| 287 linhas; chamador: FE src/components/analytics/CoachingComparison.tsx; verify_jwt true (default); tabelas toc…
- **Fontes:** `docs/estado/06_DOMINIO_IA_COACHING.md:246`, `docs/API.md:115-115`, `docs/FUNCIONALIDADES_COMPLETAS.md:381-381`, `docs/FUNCIONALIDADES_SEM_UI.md:98`, `docs/DOCUMENTACAO_SISTEMA.md:992-1021`, `docs/FUNCIONALIDADES_SISTEMA.md:189-189; docs/FUNCIONALIDADES_SISTEMA.md:528-528` e mais 3
- **O que falta:** Falta deployar a function.
- **Evidência:** supabase/functions/salesperson-coaching/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/components/analytics/CoachingComparison.tsx| cético: supabase/functions/salesperson-coaching existe e está FORA da allowlist (deploy.yml:144). Os chamadores são src/hooks/sales/useSalespersonCoaching.ts, src/components/analytics/SalespersonCoaching.tsx e src/components/analytics/CoachingComparison.tsx.

### F3587 · Edge function semantic-coverage (6 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Painel SemanticReindexPanel.tsx:22 via useSemanticCoverage.ts:17. Edge function semantic-coverage; sem provedor, RPC get_semantic_coverage. Sempre 0%.| Catálogo API.md lista a edge function `semantic-coverage` na categoria "IA / Forecast" com auth "JWT do usuário (RLS) · verify_jwt", método "qualquer", payload "—" e resposta "JSON {error, ok}". \| Doc classifica como REAL. Chamador(es): FE hooks/semantic/useSemanticCoverage.ts:20. Só SUPABASE_*. \| 44 linhas; chamador: FE src/hooks/semantic/useSemanticCoverage.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): nenhuma. Classificação do doc: SUGERIDO_OU_INICIADO (esqueleto). \| supabase/functions/semantic-coverage existe no…
- **Fontes:** `docs/estado/06_DOMINIO_IA_COACHING.md:251`, `docs/API.md:181-181`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:170-170`, `docs/estado/10_EDGE_FUNCTIONS.md:439-439`, `docs/prod-readiness.md:394`, `docs/estado/09_HOOKS_SERVICES.md:291-311`
- **O que falta:** Falta deployar a function e popular semantic_index.
- **Evidência:** supabase/functions/semantic-coverage/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: supabase/functions/semantic-coverage existe e está FORA da allowlist (deploy.yml:144). Ao contrário do veredito inicial, não é órfã: src/hooks/semantic/useSemanticCoverage.ts:20 a invoca, e o painel está montado em src/pages/AdminDashboard.tsx:29.

### F3588 · Edge function semantic-index-entity (6 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `semantic-index-entity` na categoria "IA / Forecast" com auth "nenhuma detectada no handler · verify_jwt", método "qualquer", payload "—" e resposta "JSON {error, skipped, ok}".| 173 linhas; chamador: FE src/hooks/semantic/useIndexEntity.ts; edge: semantic-reindex-batch:88; verify_jwt true (default); tabelas tocadas (linhas em produção): semantic_index(0). Classificação do doc: PARCIAL. \| Doc classifica como REAL. Chamador(es): FE hooks/semantic/useIndexEntity.ts:11; FN semantic-reindex-batch/index.ts:89. Embeddings via gateway Lovable /v1/embeddings. \| supabase/functions/semantic-index-entity existe no repo (citada em src/: sim); sonda OPTIONS em pro…
- **Fontes:** `docs/API.md:182-182`, `docs/estado/10_EDGE_FUNCTIONS.md:440-440`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:171-171`, `docs/prod-readiness.md:395`, `docs/estado/06_DOMINIO_IA_COACHING.md:249`, `docs/estado/06_DOMINIO_IA_COACHING.md:196-202`
- **O que falta:** Falta deployar a function e popular semantic_index.
- **Evidência:** supabase/functions/semantic-index-entity/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: semantic-reindex-batch| cético: supabase/functions/semantic-index-entity existe e está FORA da allowlist (deploy.yml:144). Os chamadores são src/hooks/semantic/useIndexEntity.ts:11 e semantic-reindex-batch. O hook só faz console.warn quando dá erro (useIndexEntity.ts:14).

### F3589 · Edge function semantic-reindex-batch (5 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `semantic-reindex-batch` na categoria "IA / Forecast" com auth "papel admin/gestor + JWT do usuário · verify_jwt", método "qualquer", payload "entity_types, only_missing, batch_size, concurrency" e resposta "JSON {error, ok}".| 149 linhas; chamador: FE src/hooks/semantic/useReindexBatch.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): semantic_index(0). Classificação do doc: PARCIAL. \| Doc classifica como REAL. Chamador(es): FE hooks/semantic/useReindexBatch.ts:26. Só SUPABASE_*. \| supabase/functions/semantic-reindex-batch existe no repo (citada em src/: sim); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limit…
- **Fontes:** `docs/API.md:183-183`, `docs/estado/10_EDGE_FUNCTIONS.md:441-441`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:172-172`, `docs/prod-readiness.md:396`, `docs/estado/06_DOMINIO_IA_COACHING.md:250`
- **O que falta:** Falta deployar a function e criar um cron.
- **Evidência:** supabase/functions/semantic-reindex-batch/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: supabase/functions/semantic-reindex-batch existe e está FORA da allowlist (deploy.yml:144). Ao contrário do veredito inicial, não é órfã: src/hooks/semantic/useReindexBatch.ts:26 a invoca, e o painel está em AdminDashboard.tsx:29. Não há cron (cron.md → 0).

### F3590 · Edge function semantic-search-universal (8 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Superior.| SemanticSearchDialog.tsx:24 e CommandPalette.tsx:90 via useSemanticSearch.ts:20. Edge function semantic-search-universal; Lovable embeddings text-embedding-004 (index.ts:22,86). Índice vazio → busca retorna nada. \| Catálogo API.md lista a edge function `semantic-search-universal` na categoria "IA / Forecast" com auth "JWT do usuário (RLS) · verify_jwt", método "qualquer", payload "—" e resposta "JSON {error}". \| 145 linhas; chamador: FE src/hooks/semantic/useSemanticSearch.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): nenhuma. Classificação do doc: PARCIAL. \| Doc classifica como REAL. Chamador(es): FE hooks/semantic/useSemanticSearch.ts:26. Busca vetoria…
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:123`, `docs/estado/06_DOMINIO_IA_COACHING.md:248`, `docs/API.md:185-185`, `docs/estado/10_EDGE_FUNCTIONS.md:443-443`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:174-174`, `docs/prod-readiness.md:398` e mais 2
- **O que falta:** Falta deployar a function e popular semantic_index.
- **Evidência:** supabase/functions/semantic-search-universal/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: supabase/functions/semantic-search-universal existe e está FORA da allowlist (deploy.yml:144). Ao contrário do veredito inicial, não é órfã: src/hooks/semantic/useSemanticSearch.ts:26 a invoca.

### F3591 · Edge function summarize-call-recording (6 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** 219 linhas; chamador: FE src/hooks/conversational/useSummarizeRecording.ts +1; verify_jwt true (default); tabelas tocadas (linhas em produção): call_recordings(0), clients(100), sales(954). Classificação do doc: IMPLEMENTADO_TOTAL.| Doc classifica como REAL. Chamador(es): FE hooks/conversational/useSummarizeRecording.ts:10, useTranscribeRecording.ts:30. LOVABLE_API_KEY. \| supabase/functions/summarize-call-recording existe no repo (citada em src/: sim); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 100 funções do plano). Status no doc: BLOQUEADO. \| Botão SummarizeButton.tsx:12 via useSummarizeRecording.ts. Edge function summarize-call-recording; Lovable Gatew…
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:459-459`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:191-191`, `docs/prod-readiness.md:415`, `docs/estado/06_DOMINIO_IA_COACHING.md:228`, `docs/API.md:267-267`, `docs/agentes/mapa-do-sistema.md:52`
- **O que falta:** Falta deployar a function.
- **Evidência:** supabase/functions/summarize-call-recording/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/conversational/useSummarizeRecording.ts, src/hooks/conversational/useTranscribeRecording.ts| cético: supabase/functions/summarize-call-recording existe e está FORA da allowlist (deploy.yml:144). Os chamadores são src/hooks/conversational/useSummarizeRecording.ts e useTranscribeRecording.ts.

### F3592 · Edge function transcribe-call-recording (12 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Doc: chamadas apenas por hooks/componentes inalcançáveis.| Transcrição, diarização, sentimento, objeções, momentos críticos e scorecards a partir de gravações. \| 157 linhas; chamador: FE src/hooks/conversational/useTranscribeRecording.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): call_recordings(0). Classificação do doc: PARCIAL. \| Doc classifica como REAL. Chamador(es): FE hooks/conversational/useTranscribeRecording.ts:10. Áudio inteiro em base64 para Gemini via gateway Lovable (index.ts:136-164). \| supabase/functions/transcribe-call-recording existe no repo (citada em src/: sim); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 100 fun…
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:198-198`, `docs/benchmark/RAMPER_2026-07.md:181`, `docs/estado/10_EDGE_FUNCTIONS.md:462-462`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:194-194`, `docs/prod-readiness.md:418`, `docs/benchmark/RAMPER_2026-07.md:120` e mais 6
- **O que falta:** Falta deployar a function e ter o pipeline gerando scorecard persistido.
- **Evidência:** supabase/functions/transcribe-call-recording/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/conversational/useTranscribeRecording.ts| cético: supabase/functions/transcribe-call-recording existe e está FORA da allowlist (deploy.yml:144). O chamador é src/hooks/conversational/useTranscribeRecording.ts.

### F1114 · Reindexador semântico lista notes, email_messages, whatsapp_messages, proposals ausentes de tipos/migrations e engole erro

- **Tipo:** Edge function
- **O que os docs afirmam:** Doc: reindexador monta lista dinâmica incluindo tabelas inexistentes e captura o erro seguindo sem candidatos.
- **Fontes:** `docs/auditoria/MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md:296-298`
- **O que falta:** Tirar os 4 tipos sem tabela de TABLE_BY_TYPE, devolver o erro no summary e colocar semantic-reindex-batch na allowlist.
- **Evidência:** supabase/functions/semantic-reindex-batch/index.ts:24-27 TABLE_BY_TYPE inclui notes, email_messages, whatsapp_messages, proposals — nenhuma existe no banco real (contexto/supabase/tables/public/ sem notes.md, email_messages.md, whatsapp_messages.md, proposals.md). DEFAULT_TYPES (:33) usa só tabelas existentes. Erro engolido: :100-104 'table might not exist — skip gracefully' zera o resumo sem reportar; :41 pMap ignora falhas individuais. mark_entity_for_reindex existe no banco (functions.md:284) sem chamador no código. Função chamada por src/hooks/semantic/useReindexBatch.ts:26 via SemanticReindexPanel (AdminDashboard.tsx), mas semantic-reindex-batch está FORA da allowlist deploy.yml:144.| cético: supabase/functions/semantic-reindex-batch/index.ts:24-27 mapeia notes, email_messages, whatsapp_messages e proposals, e nenhuma tem arquivo em contexto/supabase/tables/public/ (ls → 0). Em :99…

### F3603 · Hook useSalesEnablement (2 afirmações nos docs)

- **Tipo:** Hook
- **O que os docs afirmam:** Falha de severidade baixa registrada pela validação adversarial, sem correção nesta rodada.| useSalesEnablement.ts:272 enviava id de login, FK aponta para salespeople; corrigido (#479), vitest 15/15.
- **Fontes:** `docs/prod-readiness.md:1006`, `docs/prod-readiness.md:981`
- **O que falta:** Conferir o resultado real do delete (ex.: .select() após delete e checar data.length) e só confirmar quando algo foi apagado, ou avisar que a etapa foi marcada por outro usuário; verificar em produção com usuário vendedor.
- **Evidência:** arquivo src/hooks/sales/useSalesEnablement.ts existe mas hook não consta em hooks.json (não exportado/indexado)| cético: Correção da FK presente no main: src/hooks/sales/useSalesEnablement.ts:269-279 busca rpc('get_current_salesperson_id') e grava completed_by = salespeople.id (RPC existe no banco: functions.md:218); docs/prod-readiness.md:984 registra #479 mergeada em 39cb90c. Mas a falha baixa registrada em docs/prod-readiness.md:1012 ('Desmarcar etapa marcada por outro usuário não apaga nada e mesmo assim confirma') continua no código: o delete em useSalesEnablement.ts:282-288 não confere linhas afetadas e onSuccess em :292 mostra toast 'Etapa desmarcada' mesmo com 0 linhas apagadas pela RLS. Comportamento em produção com vendedor real: NÃO VERIFICADO (sem acesso a sessão de vendedor).

### F1115 · src/hooks/semantic: 0 tabelas/RPC, 4 edge functions via invoke

- **Tipo:** Hook
- **O que os docs afirmam:** 4 arquivos chamando só functions.invoke.
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:68`
- **O que falta:** Colocar semantic-index-entity, semantic-reindex-batch e semantic-coverage na allowlist, ou remover os hooks e painéis que dependem delas.
- **Evidência:** src/hooks/semantic/ tem 4 arquivos (useIndexEntity, useReindexBatch, useSemanticCoverage, useSemanticSearch); grep '.from(\\|.rpc(' → 0; só functions.invoke. Confirma a afirmação. Porém das 4 edges invocadas apenas semantic-search está na allowlist deploy.yml:144; semantic-index-entity, semantic-reindex-batch e semantic-coverage estão fora → 3 hooks apontam para funções não deployadas.| cético: Os hooks só usam invoke, como diz a doc. Mas das 4 functions chamadas, só semantic-search está na allowlist de deploy.yml:144; semantic-index-entity, semantic-reindex-batch e semantic-coverage estão FORA (conferido na lista de 100).

### F1119 · Coaching de vendedor com IA (salesperson-coaching)

- **Tipo:** Integração externa
- **O que os docs afirmam:** SalespersonCoaching.tsx + useSalespersonCoaching + edge salesperson-coaching geram coaching inteligente.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:642,657,1020`
- **O que falta:** Colocar salesperson-coaching na allowlist e ligar o hook à edge se o coaching por IA for desejado; senão, corrigir a doc para 'coaching por regras'.
- **Evidência:** src/components/analytics/SalespersonCoaching.tsx montado em src/pages/Analytics.tsx:107 (rota /analytics AppRoutes.tsx:559). Mas src/hooks/sales/useSalespersonCoaching.ts NÃO invoca a edge: lê salespeople/sales/deal_outcomes/activities direto (:40-68; grep 'invoke(' → 0). A edge salesperson-coaching só é chamada por CoachingComparison.tsx:24 e está FORA da allowlist deploy.yml:144 (não deployada). Edge chama gateway (salesperson-coaching/index.ts:173-216, gemini-2.5-flash). Doc 'edge gera coaching inteligente' não corresponde ao fluxo principal.| cético: src/hooks/sales/useSalespersonCoaching.ts:40-72 só faz .from() direto (grep 'invoke\\|fetch\\|functions' → 0). A edge salesperson-coaching só é chamada por src/components/analytics/CoachingComparison.tsx:24 e está FORA da allowlist de deploy.yml:144. Além disso, o hook (:34) e CoachingComparison (:22) usam a mesma queryKey ['salesperson…

### F1121 · Etapa 66 do plano: Completar Conversational Intelligence

- **Tipo:** Integração externa
- **O que os docs afirmam:** Ligar upload, transcrição, diarização, feed e coaching a contratos reais. Saída esperada: chamada→transcrição→insight E2E. Gate: provedor/custo e storage.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:740-740`
- **O que falta:** Colocar process-call-recording-ingest, transcribe-call-recording e summarize-call-recording na allowlist, encadear a transcrição no worker de ingestão e remover ou ligar elevenlabs-stt.
- **Evidência:** Upload: src/hooks/conversational/useUploadCallRecording.ts:39 storage call-recordings + :67 enfileira em call_recording_ingest_jobs (RLS sim); uploader montado em src/pages/ConversationalIntelligence.tsx (rota AppRoutes.tsx:347-350). Worker process-call-recording-ingest tem cron a cada minuto (cron.md:29) MAS está FORA da allowlist deploy.yml:144 → jobs nunca viram call_recordings em produção. transcribe-call-recording e summarize-call-recording FORA da allowlist (chamadas por useTranscribeRecording.ts:10,31); diarize-call-recording e as 9 análises seguintes NA allowlist, encadeadas só por clique (useTranscribeRecording.ts:24-110). elevenlabs-stt: 0 refs em src/. call_recordings e call_recording_ingest_jobs com 0 linhas (stats.md:96,141). Fluxo chamada→transcrição→insight não executa E2E em produção.| cético: Upload para call-recordings em src/hooks/conversational/useUploadCallRecording…

### F1123 · IA integrada: assistente, coaching, next best action, lead scoring

- **Tipo:** Integração externa
- **O que os docs afirmam:** Resumo lista 4 capacidades de IA integradas.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1725`
- **O que falta:** Incluir salesperson-coaching e lead-scoring na allowlist ACTIVE (deploy.yml:144, exige vaga no limite de 100) ou remover a UI que as chama; lead-scoring não usa IA (doc exagera). Secret LOVABLE_API_KEY não verificável sem acesso ao painel.
- **Evidência:** sales-assistant-chat: na allowlist (.github/workflows/deploy.yml:144), chamada em src/hooks/sales/useSalesAssistant.ts:191, IA em supabase/functions/sales-assistant-chat/index.ts:428-440. next-best-action: na allowlist, src/hooks/useNextBestAction.ts:42, IA em supabase/functions/next-best-action/index.ts:20,409-417. salesperson-coaching: FORA da allowlist (deploy.yml:144), mas chamada em src/components/analytics/CoachingComparison.tsx:24 e src/hooks/sales/useSalespersonCoaching.ts:34, montada em src/pages/Analytics.tsx:11-12. lead-scoring: FORA da allowlist; edge sem IA (grep LOVABLE_API_KEY supabase/functions/lead-scoring/index.ts → 0); src/hooks/useLeadScoring.ts:111-119 engole o erro e cai em cálculo local.
- **Revisão:** sem contestação cética concluída.

### F1124 · Integração externa: Lovable AI Gateway (IA)

- **Tipo:** Integração externa
- **O que os docs afirmam:** 46 funções leem o segredo; 31/46 publicadas; indisponíveis ai-agent-orchestrator, ai-copilot, analyze-pipeline-coverage, extract-deal-stakeholders, generate-loss-coaching, generate-revenue-forecast, nlq-query, predict-quota-attainment, purchase-intelligence-forecast, qbr-generator, salesperson-coaching, semantic-index-entity, semantic-search-universal, summarize-call-recording, transcribe-call-recording. Chamada real ao provedor não exercida (B4).
- **Fontes:** `docs/prod-readiness.md:856`
- **O que falta:** Publicar (ou desligar os chamadores das) 15 functions fora da allowlist; confirmar LOVABLE_API_KEY em Edge Functions → Secrets e uma chamada real com log — ambos exigem acesso ao painel Supabase (não disponível aqui).
- **Evidência:** grep -rl LOVABLE_API_KEY supabase/functions → 46 arquivos (106 ocorrências); supabase/functions/_shared/ai-gateway.ts:4-9 define URL. Cruzando com ACTIVE em .github/workflows/deploy.yml:144: 31/46 na allowlist; 15 fora (ai-agent-orchestrator, ai-copilot, analyze-pipeline-coverage, extract-deal-stakeholders, generate-loss-coaching, generate-revenue-forecast, nlq-query, predict-quota-attainment, purchase-intelligence-forecast, qbr-generator, salesperson-coaching, semantic-index-entity, semantic-search-universal, summarize-call-recording, transcribe-call-recording) — bate com a doc. Snapshot edge-functions.md:3 'Management API desabilitada', sem lista de secrets.
- **Revisão:** sem contestação cética concluída.

### F1132 · Voz no assistente (ElevenLabs STT/TTS)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Entrada e saída de voz no assistente.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:356-356`
- **O que falta:** STT via ElevenLabs: chamar elevenlabs-stt em useElevenLabsVoice.ts (hoje Web Speech API) e incluí-la na allowlist; remover isApiConfigured=true fixo. ELEVENLABS_API_KEY não verificável.
- **Evidência:** TTS real: src/hooks/useElevenLabsVoice.ts:125 fetch elevenlabs-voice (na allowlist) → supabase/functions/elevenlabs-voice/index.ts:45 (ELEVENLABS_API_KEY) :31 (api.elevenlabs.io/v1/text-to-speech). STT NÃO é ElevenLabs: useElevenLabsVoice.ts:200-206 usa window.SpeechRecognition do navegador; grep -rn elevenlabs-stt src → 0 chamadores e elevenlabs-stt está FORA da allowlist deploy.yml:144. isApiConfigured hardcoded true (useElevenLabsVoice.ts:75). Botão de microfone: src/components/assistant/VoiceControls.tsx:9,64-66 via ChatInputArea (SalesAssistantChat.tsx:24,369).
- **Revisão:** sem contestação cética concluída.

### F1134 · Gap "classe mundial" já existente: Busca semântica

- **Tipo:** Outro
- **O que os docs afirmam:** Doc afirma que o gap "Busca semântica" de GAPS_CLASSE_MUNDIAL já existe no código.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:208`
- **O que falta:** Adicionar semantic-search-universal à allowlist (deploy.yml:144) ou apontar SemanticSearchDialog/CommandPalette para semantic-search; hoje a entrada de menu /busca falha em produção.
- **Evidência:** Caminho funcional: src/pages/SmartSearch.tsx:9,45 → src/hooks/useSemanticSearch.ts:34 (semantic-search, na allowlist deploy.yml:144) → supabase/functions/semantic-search/index.ts:84-93 (gateway) :199 rpc search_products_semantic (existe: functions/public/search_products_semantic__2244ad44d29271b6.sql). Caminho quebrado: rota /busca (AppRoutes.tsx:950, menu 'Busca Semântica' sidebarMenuData.ts:164,266) → src/pages/SemanticSearch.tsx:4 SemanticSearchDialog → src/hooks/semantic/useSemanticSearch.ts:26 invoca semantic-search-universal, FORA da allowlist; src/components/command/CommandPalette.tsx também usa esse hook.
- **Revisão:** sem contestação cética concluída.

### F1138 · Gap "classe mundial" já existente: Resumo de reunião

- **Tipo:** Outro
- **O que os docs afirmam:** Doc afirma que o gap "Resumo de reunião" de GAPS_CLASSE_MUNDIAL já existe no código.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:208`
- **O que falta:** Incluir summarize-call-recording e transcribe-call-recording na allowlist (exige 2 vagas no limite de 100) — sem isso o botão de resumo falha em produção.
- **Evidência:** Edge existe: supabase/functions/summarize-call-recording/index.ts:12 (LOVABLE_API_KEY), :17 tool extract_meeting_summary, :165-172 fetch gateway, :196 rpc update_call_recording_summary (existe no banco: functions/public/update_call_recording_summary__a3b08e208054d367.sql). UI: src/hooks/conversational/useSummarizeRecording.ts:10, SummarizeButton.tsx, RecordingSummaryDrawer.tsx, encadeado em useTranscribeRecording.ts:30. Porém summarize-call-recording está FORA da allowlist ACTIVE (.github/workflows/deploy.yml:144) e depende de transcribe-call-recording, também fora.
- **Revisão:** sem contestação cética concluída.

### F1140 · Gap "classe mundial" já existente: Talk ratio / sentimento

- **Tipo:** Outro
- **O que os docs afirmam:** Doc afirma que o gap "Talk ratio / sentimento" de GAPS_CLASSE_MUNDIAL já existe no código.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:208`
- **O que falta:** Publicar transcribe-call-recording (e a ingestão, F1146) para que haja transcrição de entrada; sem isso talk ratio/sentimento nunca é calculado em produção.
- **Evidência:** Backend existe e está publicado: analyze-conversation-metrics (allowlist) calcula seller_talk_ratio/client_talk_ratio em supabase/functions/analyze-conversation-metrics/index.ts:107-111; analyze-sentiment-timeline na allowlist. UI: ConversationMetricsFeed (ConversationalIntelligenceHub.tsx:36), ConversationMetricsCard e SentimentTimelineChart (RecordingSummaryDrawer.tsx:20,23); hooks useConversationMetrics.ts:86, useSentimentTimeline.ts:28. Porém só disparam após transcrição (useTranscribeRecording.ts:53,70) e transcribe-call-recording está FORA da allowlist deploy.yml:144; call_transcripts e call_sentiment_timeline com 0 linhas (stats.md:351-352).
- **Revisão:** sem contestação cética concluída.

### F1141 · Gap "classe mundial" já existente: Transcrição / diarização

- **Tipo:** Outro
- **O que os docs afirmam:** Doc afirma que o gap "Transcrição / diarização" de GAPS_CLASSE_MUNDIAL já existe no código.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:208`
- **O que falta:** Adicionar transcribe-call-recording à allowlist deploy.yml:144 (vaga no limite de 100); hoje o botão 'Transcrever' falha em produção e a diarização nunca tem insumo.
- **Evidência:** transcribe-call-recording existe (supabase/functions/transcribe-call-recording/index.ts:38-39 LOVABLE_API_KEY, :144 fetch gateway), UI TranscribeButton (src/pages/ConversationalIntelligence.tsx:31,262 → useTranscribeRecording.ts:10), mas FORA da allowlist ACTIVE (.github/workflows/deploy.yml:144). diarize-call-recording está na allowlist (useDiarizeRecording.ts:9; useTranscribeRecording.ts:27) mas depende de transcrição prévia. call_transcripts 0 linhas (stats.md:352).
- **Revisão:** sem contestação cética concluída.

### F1142 · Cascata de análises após ingestão de call_recordings

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** PARCIAL: process-call-recording-ingest-1min agendado; demais análises por clique em useTranscribeRecording.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:177`
- **O que falta:** Publicar process-call-recording-ingest e transcribe-call-recording; mover a cascata para o servidor (ingest ou trigger em call_recordings) em vez de depender do onSuccess do botão Transcrever.
- **Evidência:** Cron existe: snapshot cron.md:29 'process-call-recording-ingest-1min' * * * * * → trigger_internal_edge_job('process-call-recording-ingest') (functions/public/trigger_internal_edge_job__f02f045c8b4350ab.sql: net.http_post para /functions/v1/<nome>); cron-runs.md:200-206 'succeeded 1 row' registra apenas o enfileiramento do http_post. A function alvo está FORA da allowlist ACTIVE (.github/workflows/deploy.yml:144) → não deployada. A edge de ingestão não encadeia análises (grep -nE 'transcribe\|invoke' supabase/functions/process-call-recording-ingest/index.ts → 0). Cascata é client-side após clique: src/hooks/conversational/useTranscribeRecording.ts:23-115 (diarize→summarize→competitor→coaching→sentiment→critical→metrics→questions→objections→scorecard).
- **Revisão:** sem contestação cética concluída.

### F1143 · Domínio dormente: Call Intelligence / gravação de chamada (18 tabelas zeradas)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Agrupamento funcional com 18 tabelas todas com 0 linhas; indica módulo construído e nunca usado.
- **Fontes:** `docs/estado/11_DADOS_BANCO.md:221-225`
- **O que falta:** Nenhuma tabela do grupo recebe dado real; publicar process-call-recording-ingest e transcribe-call-recording e validar um upload ponta a ponta.
- **Evidência:** Tabelas existem com RLS: tables.md:53-67 (call_coaching_scorecards, call_conversation_metrics, call_critical_moments, call_insights, call_objections, call_questions, call_recordings, call_sentiment_timeline, call_transcripts), :366 twilio_call_sessions. Todas 0 linhas: stats.md:96 (call_recordings), :348 (call_insights), :351 (call_sentiment_timeline), :352 (call_transcripts). UI acessível: rotas /conversational-intelligence e /gravacoes (AppRoutes.tsx:348-353), menu sidebarMenuData.ts:152. Topo do funil (process-call-recording-ingest) e transcrição fora da allowlist deploy.yml:144.
- **Revisão:** sem contestação cética concluída.

### F1144 · Domínio dormente: Coaching / desenvolvimento (8 tabelas zeradas)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Agrupamento funcional com 8 tabelas todas com 0 linhas; indica módulo construído e nunca usado.
- **Fontes:** `docs/estado/11_DADOS_BANCO.md:221-232`
- **O que falta:** Módulo construído e sem uso: nenhuma linha em produção. Validar fluxo criando uma sessão de coaching real pela UI; extract-coaching-actions depende de transcrição (F1141).
- **Evidência:** Tabelas existem com RLS: tables.md:82 coaching_actions, :85 coaching_sessions, :243 playbook_progress, :244 playbooks, :334 skill_assessments. Todas 0 linhas: stats.md:129,144,209,255,300. UI existe: CoachingSessionPlanner em src/components/coaching/CoachingIntelligenceHub.tsx:32 (useCoachingSessions em src/components/coaching/sessions/*), rota /coaching-inteligente (AppRoutes.tsx:397-400); playbooks em /sales-enablement (usePlaybooks.ts). Edges que gravam coaching_actions na allowlist (generate-coaching-actions, extract-coaching-actions).
- **Revisão:** sem contestação cética concluída.

### F1146 · Pipeline de Call Intelligence ocioso: call_recordings vazia bloqueia ~20 funções

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** call_recordings, call_transcripts, call_insights, call_objections, call_questions, call_sentiment_timeline, call_critical_moments, call_coaching_scorecards, call_conversation_metrics todas com 0 linhas; nada entra pelo topo do funil (process-call-recording-ingest).
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:520-531`
- **O que falta:** Adicionar process-call-recording-ingest e transcribe-call-recording à allowlist deploy.yml:144 (2 vagas no limite de 100 — remover functions obsoletas) e validar: upload → call_recording_ingest_jobs → call_recordings → call_transcripts com server_time.
- **Evidência:** Upload: src/components/conversational/CallRecordingUploader.tsx:7 montado em src/pages/ConversationalIntelligence.tsx:29,121 (rota /conversational-intelligence/gravacoes, AppRoutes.tsx:352-353) → src/hooks/conversational/useUploadCallRecording.ts:40-49 (bucket call-recordings existe, storage.md:8) :62-67 insert em call_recording_ingest_jobs (tabela existe RLS sim, tables.md:64; 0 linhas stats.md:141) :85 invoke process-call-recording-ingest. A function está FORA da allowlist ACTIVE (.github/workflows/deploy.yml:144) e o cron de 1min (cron.md:29) aponta para a mesma function → linha nunca chega a call_recordings (0 linhas, stats.md:96); transcrição (transcribe-call-recording) também fora da allowlist.
- **Revisão:** sem contestação cética concluída.

### F1148 · Skill assessments periódicas

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Falta avaliações periódicas de skills.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:199`
- **O que falta:** Agendar a avaliação (job pg_cron via trigger_internal_edge_job('analyze-skill-gaps') ou net.http_post com segredo de cron) para torná-la periódica; hoje só roda pelo botão em src/components/coaching/skills/SkillGapSummary.tsx.
- **Evidência:** Tabela existe: tables/public/skill_assessments.md (RLS sim, 4 policies, colunas skill/score/trend/last_assessed_at). Escrita: supabase/functions/analyze-skill-gaps/index.ts:273 upsert em skill_assessments; function está na allowlist (deploy.yml:144 contém analyze-skill-gaps). UI: src/hooks/coaching/useSkillGapAnalyzer.ts:127-146 useAnalyzeSkillGaps invoca a function sob demanda (botão em src/components/coaching/skills/SkillGapSummary.tsx:14); src/pages/Competencias.tsx roteado em AppRoutes.tsx:798 e menu sidebarMenuData.ts:149. Periodicidade ausente: grep -iE 'skill\|competenc\|gap\|analyze-skill' cron.md → 0 resultados; grep -iE 'schedule\|cron\|periodic' supabase/functions/analyze-skill-gaps/index.ts → 0 resultados. Nota: src/hooks/useCompetencyData.ts:22-33 lê activities/sales/deal_outcomes, não skill_assessments.| cético: Confirmado: cron.md lista 45 jobs e nenhum chama analyze-skil…

### F3606 · /inteligencia: Intelligence.tsx wrapper de IntelligenceCockpit

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Wrapper fino; probe não achou camada de dados em 2 níveis.
- **Fontes:** `docs/estado/01_FRONTEND_ROTAS.md:323-323`
- **O que falta:** Ligar RelationshipGraph e ScenarioSimulator a dados reais (ou retirá-los) e adicionar entrada de menu para /inteligencia.
- **Evidência:** A rota existe: src/routes/AppRoutes.tsx:716 <Route path="/inteligencia" element={<Intelligence />} />; src/pages/Intelligence.tsx:2,17 monta IntelligenceCockpit; IntelligenceCockpit.tsx:28,35-36 usa useLatestBriefing (executive_briefings, tables.md:155, RLS sim) e useDashboardKPIsPeriod, o que atende o critério de dado real. Porém RelationshipGraph.tsx:10-38 é só um estado vazio fixo; ScenarioSimulator.tsx:30-32 parte de valores fixos (70/25/15) e :71 simula localmente com setTimeout. Não há item de menu para /inteligencia (sidebarMenuData.ts:250 aponta para /dashboard/inteligencia).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F1151 · Painel Meu Coach IA

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Parcial.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:214`
- **O que falta:** Criar painel pessoal (rota + menu) que mostre ao vendedor logado suas próprias recomendações de coaching com dado real (ex.: coaching_actions/skill_assessments filtrados por get_current_salesperson_id) e, se usar salesperson-coaching, incluí-la na allowlist de deploy.yml:144.
- **Evidência:** Não existe tela chamada 'Meu Coach IA': grep -rn -iE 'meu coach\|MeuCoach\|my-coach\|Coach IA' src/ → apenas src/hooks/sales/useSalespersonPreferences.ts:21 (DEFAULT_AI_NAME = 'Coach IA', nome do assistente de chat em SalesAssistantChat.tsx:53). Coaching existe só em visão de gestor: src/pages/Analytics.tsx:107-108 (abas coaching/comparison com seletor de vendedor) e src/pages/CoachingInteligente.tsx → CoachingIntelligenceHub (sem filtro por vendedor logado: grep useCurrentSalesperson\|salespersonId em CoachingIntelligenceHub.tsx → 0). Sugestões em src/hooks/sales/useSalespersonCoaching.ts:119-190 são heurísticas fixas no cliente, sem IA.| CONTESTADO pelo cético (IMPLEMENTADO): O painel existe sob outro nome: rota /meu-assistente (src/routes/AppRoutes.tsx:947, lazy em src/routes/lazyPages.ts:277) no menu 'Meu Assistente' (src/components/layout/sidebar/sidebarMenuData.ts:159 e :232). src…
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3607 · Rota /conversational-intelligence/gravacoes (ConversationalIntelligence.tsx)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota registrada em AppRoutes.tsx com acesso "autenticado", GET em produção 200, chamando as edge functions aggregate-coaching-scorecard, analyze-call, analyze-conversation-metrics, analyze-objection-handling, analyze-question-quality, analyze-sentiment-timeline, detect-competitor-mentions, detect-critical-moments, diarize-call-recording, extract-coaching-actions, process-call-recording-ingest, summarize-call-recording, transcribe-call-recording. Status no doc: BLOQUEADO: edge process-call-recording-ingest, summarize-call-recording, transcribe-call-recording indisponível
- **Fontes:** `docs/prod-readiness.md:146`
- **O que falta:** Publicar process-call-recording-ingest, summarize-call-recording e transcribe-call-recording (incluir na allowlist deploy.yml:144, o que exige liberar vagas no limite de 100 functions) para upload, transcrição e resumo funcionarem; hoje o cron de ingestão roda contra function inexistente.
- **Evidência:** rota /conversational-intelligence/gravacoes → src/pages/ConversationalIntelligence.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: Rota em src/routes/AppRoutes.tsx:352-353 → ConversationalIntelligenceRecordings = src/pages/ConversationalIntelligence.tsx (lazyPages.ts:74-75). A justificativa 'sem menu' do mecânico está errada: o hub do menu (sidebarMenuData.ts:152 '/conversational-intelligence') tem link em src/components/conversational/ConversationalIntelligenceHub.tsx:124 para /conversational-intelligence/gravacoes. O motivo real do PARCIAL: 3 edges chamadas pelo fluxo estão fora da allowlist ACTIVE de .github/workflows/deploy.yml:144 (process-call-recording-ingest, summarize-call-recording, transcribe-call-recording → 0 ocorrências) e são invocadas por src/hooks/conversational/useUploadCallRecording.ts:85, useTranscribeRecording.ts:10,30 e…

### F3608 · Rota /inteligencia (6 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** API.md declara a rota `/inteligencia` renderizando o componente Intelligence com acesso "autenticado".| Doc: a página inteira é maquete; nenhum componente de `src/components/intelligence/` importa hook de dados nem Supabase. \| Rota registrada em AppRoutes.tsx com acesso "autenticado", GET em produção 200, chamando as edge functions generate-executive-briefing. Status no doc: OK \| Rota /inteligencia (AppRoutes.tsx:213) renderiza src/pages/Intelligence.tsx; sem role explícito (só autenticação global). Classificação do doc: SUGERIDO_OU_INICIADO. Evidência: menu (sidebarMenuData.ts) · sb=0 useQuery=0 mut=0 (árvore 7 arq.) · sem nenhuma chamada supabase/useQuery em 2 níveis de imports \| A rot…
- **Fontes:** `docs/API.md:380-380`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:56-58`, `docs/prod-readiness.md:181`, `docs/estado/01_FRONTEND_ROTAS.md:139-139`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:207-207`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:121`
- **O que falta:** Dados reais para RelationshipGraph e ScenarioSimulator, estados de loading/erro/vazio no Cockpit e item de menu apontando para /inteligencia.
- **Evidência:** rota /inteligencia → src/pages/Intelligence.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: Rota em src/routes/AppRoutes.tsx:716 (Intelligence, lazyPages.ts:216), dentro da área autenticada. A afirmação dos docs de que é 'maquete' sem nenhum hook está desatualizada: IntelligenceCockpit.tsx:28-36 lê executive_briefings e KPIs; ExecutiveSummaryReport.tsx:21-23 usa useGenerateBriefing (invoke de generate-executive-briefing, na allowlist deploy.yml:144); ActivityPulse.tsx:11-15 e PerformanceTrends.tsx:25-30 consultam 'sales'. Continua PARCIAL: RelationshipGraph.tsx:26-36 é só placeholder fixo; ScenarioSimulator.tsx:31-33 e :71 usa valores fixos e simulação local com setTimeout; o Cockpit não trata loading/erro (só data em :35-36); sem entrada no sidebar (sidebarMenuData.ts:250 vai para /dashboard/inteligencia, que renderiza Index em AppRoutes.ts…

### F1154 · UI para salesperson-coaching: painel "Meu Coach" com sugestões personalizadas

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Falta painel "Meu Coach" com sugestões personalizadas.
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:98`
- **O que falta:** Adicionar salesperson-coaching à allowlist em .github/workflows/deploy.yml:144 (ou trocar a chamada de src/components/analytics/CoachingComparison.tsx por personal-assistant-stream/dados locais) e fazer src/hooks/sales/useSalespersonCoaching.ts usar a function em vez de regras fixas; o painel pessoal já existe em /meu-assistente.
- **Evidência:** Edge function existe: supabase/functions/salesperson-coaching/index.ts (enforceRateLimit :21; lê salespeople/deal_outcomes :47-97). FORA da allowlist: deploy.yml:144 não contém 'salesperson-coaching' (0 ocorrências) → não roda em produção. UI: src/components/analytics/CoachingComparison.tsx:24-29 invoca 'salesperson-coaching' (quebra em prod); src/components/analytics/SalespersonCoaching.tsx:27 usa src/hooks/sales/useSalespersonCoaching.ts, que NÃO chama a function e gera strengths/improvements/actions por regras fixas no cliente (:119-190). Ambas montadas em src/pages/Analytics.tsx:107-108 em visão de gestor (seletor de vendedor), sem painel 'Meu Coach' pessoal (grep -iE 'meu coach' src/ → 0).| cético: Veredito mantido, mas com correção do 'o que falta': o painel pessoal 'Meu Coach' já existe em /meu-assistente (src/routes/AppRoutes.tsx:947; src/pages/MeuAssistente.tsx:63,158) usando p…

### F1155 · Video library (training, demos)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Falta biblioteca de vídeos.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:197`
- **O que falta:** Biblioteca de vídeos com player embutido, upload para bucket privado de storage com policies e registro de visualização por vendedor.
- **Evidência:** Não há biblioteca dedicada: ausente grep -rn -iE 'training_video\|video_library\|videoLibrary' src/ supabase/ → 0 resultados; storage.md não tem bucket de vídeos de treinamento (só call-recordings aceita video/mp4). Existe genérico: sales_enablement_assets com asset_type 'video' e categoria 'training' (tables/public/sales_enablement_assets.md:23-24 asset_type/file_url; src/components/enablement/SalesEnablementHub.tsx:75,80,169,347) listado em /sales-enablement (AppRoutes.tsx:771), abrindo file_url externo via window.open — sem player, sem upload para storage, sem progresso de visualização.| cético: Confirmado: nenhum player de vídeo no front (grep -rln -iE '<video\|ReactPlayer\|youtube\.com/embed\|vimeo' src → 0); nenhuma rota/menu de treinamento/vídeo (grep -iE 'trein\|training\|video' AppRoutes.tsx sidebarMenuData.ts → 0). Existe apenas filtro por tipo 'Vídeo' e categoria 'Treinamento…

### F1161 · Wrapper callAI com retry/breaker

- **Tipo:** Service/lib
- **O que os docs afirmam:** Sprint 2 P: sem wrapper.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:334`
- **O que falta:** Criar supabase/functions/_shared/call-ai.ts combinando fetch ao gateway + withRetry + withEdgeCircuitBreaker + registro de tokens e adotá-lo nas 46 functions de IA.
- **Evidência:** ausente: grep -rn 'callAI' supabase/functions → 0 resultados. supabase/functions/_shared/ai-gateway.ts exporta apenas URLs (:8-9 LOVABLE_AI_CHAT_COMPLETIONS_URL, LOVABLE_AI_EMBEDDINGS_URL), sem wrapper; usado por 39 functions. Primitivas existem isoladas: _shared/retry.ts:151 withRetry, _shared/circuit-breaker.ts:95 withEdgeCircuitBreaker, mas das 46 functions de IA apenas 1 usa withRetry/CircuitBreaker (grep -lE em cada index.ts). Doc A_planos_execucao.md:334 confirma 'sem wrapper callAI com retry/breaker'.| cético: Confirmado: supabase/functions/_shared/ai-gateway.ts:8-9 exporta só URLs; nenhum wrapper callAI (grep -rn callAI supabase/functions → 0). Primitivas isoladas: _shared/retry.ts:151 withRetry, _shared/circuit-breaker.ts:95 withEdgeCircuitBreaker; usadas apenas em 10 functions, quase todas não-IA (bitrix24-oauth, elevenlabs-*, twilio-click-to-call, wal-health-alert...); entre …

### F1162 · Tabela de billing/uso de tokens de IA inexistente

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Não há tabela de billing/uso de tokens no schema; custo não mensurável.
- **Fontes:** `docs/estado/06_DOMINIO_IA_COACHING.md:311`
- **O que falta:** Criar tabela de uso/custo de IA por chamada (function, modelo, tokens, custo, usuário) com RLS admin-only e gravar a partir de um wrapper comum (F1161).
- **Evidência:** ausente: ls tables/public/| grep -iE '^ai_\|llm\|usage' → só ai_agent_actions, ai_agent_runs, ai_narrative_cache, ai_sales_insights, product_usage*, asset_usage_logs (nenhuma de billing/uso de tokens transversal); grep -rln -iE 'ai_usage\|ai_cost\|llm_usage\|token_usage\|ai_billing' supabase/functions src/hooks → 0. Único registro de tokens: supabase/functions/forecast-narrative/index.ts:273,291-302 grava usage.prompt_tokens/completion_tokens em ai_narrative_cache (tables/public/ai_narrative_cache.md:25-26 tokens_input/tokens_output) — só essa function (grep -rln tokens_input supabase/functions → 1 arquivo). Doc 06_DOMINIO_IA_COACHING.md:311 confirma. \| cético: Confirmado: nenhuma tabela de billing/uso de tokens transversal (grep de tokens__/prompt_tokens/cost nas tables/public/_.md → só ai_narrative_cache com tokens; call_insights.md:32, conversation_analyses.md:32, personal_assistant…

### F1164 · Testes de IA/coaching (coaching 0/23, conversational 0/60, revenue-intelligence 0/43, assistant 0/13, dialer 0/7, forecast 0/7)

- **Tipo:** Teste
- **O que os docs afirmam:** Diretórios sem nenhum teste.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:99`
- **O que falta:** Ao menos um teste vitest (render + estado vazio/erro) em src/components/coaching, revenue-intelligence, assistant, dialer e forecast.
- **Evidência:** Contagem no HEAD (find src/components/<dir> -name '_.test._'): coaching 0/23, conversational 2/59 (ConversationalIntelligenceHub.test.tsx, BattleCardSuggestion.test.tsx), revenue-intelligence 0/37, assistant 0/13, dialer 0/7, forecast 0/7. Apenas conversational cumpre 'ao menos um teste por diretório'.| cético: Recontado no HEAD (find src/components/<dir> -name '_.test._'): coaching 0, conversational 2, revenue-intelligence 0, assistant 0, dialer 0, forecast 0. Testes externos não cobrem: o único que cita components/dialer é src/pages/PowerDialer.test.tsx:47-53, e só com vi.mock dos componentes.

## Não verificável (5)

### F1106 · Secret de edge LOVABLE_API_KEY

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc lista o secret `LOVABLE_API_KEY` — API Key do AI Gateway (IA) — como configurado nas Edge Functions.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1687-1698`
- **O que falta:** Listar os Edge Function Secrets do projeto usyxfpqlsspldubptrdl (painel ou Management API), ou invocar uma função de IA da allowlist e confirmar que não volta erro de chave ausente.
- **Evidência:** Código lê o secret: grep -l "LOVABLE_API_KEY" supabase/functions/*/index.ts → 46 funções (ex.: sales-assistant-chat/index.ts:428, transcribe-call-recording/index.ts:38). Existência do secret nas Edge Function secrets do projeto usyxfpqlsspldubptrdl não é visível no repo nem nos snapshots (contexto/supabase/vault.md: '_nenhum_'; vault ≠ secrets de edge). Sem MCP deste projeto para listar secrets nesta sessão.| cético: O código lê o secret (46 index.ts com LOVABLE_API_KEY). O snapshot não mostra secrets de edge: contexto/supabase/vault.md:3 '_nenhum_' (vault não é edge secrets), edge-functions.md:3 'Management API desabilitada', e grep -i lovable em errors.md/cron-runs.md/project-config.md → 0.

### F1107 · Secret LOVABLE_API_KEY configurada (narrativas IA)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Não verificável; revenue-forecast-ai/index.ts:112 degrada silenciosamente; generate-executive-briefing/index.ts:32 lança erro.
- **Fontes:** `docs/estado/04_DOMINIO_ANALYTICS_BI.md:461-466`
- **O que falta:** Invocar generate-executive-briefing em produção, ou checar os secrets no painel, e confirmar que a narrativa vem gerada.
- **Evidência:** Comportamento no código confirmado: supabase/functions/revenue-forecast-ai/index.ts:147 `if (includeAI && Deno.env.get('LOVABLE_API_KEY'))` degrada silenciosamente sem narrativa; generate-executive-briefing/index.ts:115-116 lança 'LOVABLE_API_KEY não configurada'. Ambas na allowlist deploy.yml:144. Presença do secret no projeto não é observável no repo/snapshots.| cético: generate-executive-briefing e revenue-forecast-ai estão na allowlist de deploy.yml:144 (conferido). A presença do secret não aparece no repo nem no snapshot (vault.md:3 '_nenhum_'; edge-functions.md:3 Management API desabilitada).

### F1108 · Segredo LOVABLE_API_KEY lido por 45 edge function(s)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Provedor de IA — sem ele, toda a camada de IA falha. Doc extrai via grep de Deno.env.get; não verifica se o segredo está configurado no projeto.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:125-135`
- **O que falta:** Confirmar LOVABLE_API_KEY nos secrets do projeto e rodar uma função da allowlist (ex.: sales-assistant-chat) sem erro de env.
- **Evidência:** Contagem no código: 46 arquivos index.ts leem Deno.env.get('LOVABLE_API_KEY') (doc docs/estado/10_EDGE_FUNCTIONS.md:135 diz 45); 31 dessas estão na allowlist deploy.yml:144. Configuração do secret no projeto: fora do repo e dos snapshots (vault.md vazio).| cético: 46 index.ts leem LOVABLE_API_KEY (grep -rl LOVABLE_API_KEY --include=index.ts supabase/functions \| wc -l → 46). A configuração do secret não é observável (vault.md:3, edge-functions.md:3).

### F1117 · 46 functions dependem de LOVABLE_API_KEY e gateway ai.gateway.lovable.dev

- **Tipo:** Integração externa
- **O que os docs afirmam:** Doc: todo o pilar de IA/coaching passa por _shared/ai-gateway.ts:4-9; projeto saiu do Lovable Cloud; sem a chave algumas functions lançam erro (behavioral-analysis, generate-loss-coaching) e outras degradam em silêncio (revenue-forecast-ai). Embeddings (/v1/embeddings, google/text-embedding-004) também pelo gateway.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:18-18, 281-281`
- **O que falta:** Confirmar LOVABLE_API_KEY (e LOVABLE_AI_GATEWAY_URL, se houver) nos secrets e invocar uma função da allowlist para validar a resposta do gateway.
- **Evidência:** supabase/functions/_shared/ai-gateway.ts:4-9 define base https://ai.gateway.lovable.dev com override LOVABLE_AI_GATEWAY_URL; 46 index.ts leem LOVABLE_API_KEY (doc diz 46 — ok), 39 importam ai-gateway.ts. Comportamentos confirmados: behavioral-analysis/generate-executive-briefing lançam erro sem chave (generate-executive-briefing/index.ts:116), revenue-forecast-ai/index.ts:147 degrada em silêncio. Se o secret está configurado e o gateway responde não é observável no repo/snapshots (vault.md vazio).| cético: O código está confirmado (_shared/ai-gateway.ts com override LOVABLE_AI_GATEWAY_URL; 46 leitores da chave). Não dá para observar se o secret está configurado nem se o gateway responde: vault.md:3 '_nenhum_', edge-functions.md:3 'Management API desabilitada'.

### F1129 · LOVABLE_API_KEY / gateway de IA configurado

- **Tipo:** Integração externa
- **O que os docs afirmam:** 46 functions dependem de _shared/ai-gateway.ts:4-9 e LOVABLE_API_KEY; projeto saiu do Lovable Cloud.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:127`
- **O que falta:** Confirmar LOVABLE_API_KEY (e opcionalmente LOVABLE_AI_GATEWAY_URL) em Supabase → Edge Functions → Secrets e invocar sales-assistant-chat ou next-best-action verificando resposta 200 com conteúdo nos logs.
- **Evidência:** Código confirmado: supabase/functions/_shared/ai-gateway.ts:4-9 (LOVABLE_AI_GATEWAY_URL opcional, default ai.gateway.lovable.dev), 46 arquivos leem LOVABLE_API_KEY. Snapshot não traz secrets de edge (edge-functions.md:3 'Management API desabilitada'; vault.md sem lovable). Nenhum MCP do projeto usyxfpqlsspldubptrdl disponível nesta sessão para invocar uma function.
- **Revisão:** sem contestação cética concluída.
