# WhatsApp, multicanal e voz

[Voltar ao índice](README.md)

60 itens não implementados, parciais ou não verificáveis neste domínio.

## Não implementado (15)

### F3072 · Mobile dialer com log automático

- **Tipo:** Componente
- **O que os docs afirmam:** Falta discador mobile com registro automático.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:116`
- **O que falta:** Ação de ligar no mobile que grave call_logs/atividade automaticamente (ex.: ao clicar em tel:, registrar a tentativa e abrir a disposição no retorno), ou deployar twilio-click-to-call/twilio-call-status e usá-los no mobile.
- **Evidência:** Não há discador mobile com log automático: grep -rln -i 'mobileDialer\\|mobile-dialer\\|MobileDialer' src → 0 resultados. O único 'ligar' no mobile é um link tel: sem registro (src/components/vendedor/ClientContactAlertsWidget.tsx:244). call_logs só é gravado manualmente pelo formulário de disposição (src/hooks/dialer/usePowerDialer.ts:213-230) ou pelo callback twilio-call-status/index.ts:243-249, que está fora da allowlist deploy.yml:144 (não roda em produção).
- **Revisão:** sem contestação cética concluída.

### F3075 · UI para colher consentimento de gravação de voz do titular

- **Tipo:** Componente
- **O que os docs afirmam:** Pendência de produto: não há interface para registrar consent voice_recording.
- **Fontes:** `docs/LGPD.md:112`
- **O que falta:** Dialog de consentimento no PowerDialer/CurrentCallCard ou no cadastro do cliente que faça INSERT em consent_records (purpose='voice_recording', telefone do titular) e permita revogar; sem isso toda chamada sai do-not-record.
- **Evidência:** Sem UI: grep -rn 'voice_recording' src (exceto types.ts) → 0 resultados; grep -rn 'consent_records' src (exceto types.ts) → 0 resultados. Só o backend existe: tabela consent_records com coluna purpose (snapshot tables/public/consent_records.md:23) e has_phone_consent consultada em supabase/functions/twilio-call-twiml/index.ts:142-145 (grava só com consentimento).
- **Revisão:** sem contestação cética concluída.

### F3959 · Chamadas de entrada Twilio

- **Tipo:** Edge function
- **O que os docs afirmam:** Sem suporte a chamadas de entrada.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:136`
- **O que falta:** Criar edge twilio-inbound-call (TwiML de entrada com validação de assinatura), incluí-la na allowlist deploy.yml:144, configurar o número Twilio para apontar a ela e uma UI de atendimento/roteamento da chamada recebida.
- **Evidência:** pasta supabase/functions/twilio-inbound-call/index.ts ausente| cético: ausente: ls supabase/functions \| grep -i inbound-call → 0 (só whatsapp-inbound-webhook e inbound-email-webhook); grep -rniE 'inbound\|incoming\|Direction' supabase/functions/twilio-* src/components/dialer src/hooks/dialer → só webhook_inbound_dedupe (twilio-call-status/index.ts:164,195), nenhum TwiML de entrada. Doc confirma: docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:136.

### F3964 · Hook órfão useCallTranscript

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/conversational/useCallRecordings.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:169`
- **O que falta:** hook useCallTranscript ausente (hooks.json e arquivos src/)
- **Evidência:** hook useCallTranscript ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): Commit 9e4b2231a (#217) 'chore: remover código morto catalogado pela auditoria (hooks órfãos, ...)' remove '-export function useCallTranscript(recordingId?: string)' de src/hooks/conversational/useCallRecordings.ts (git show 9e4b2231a). Hoje: grep -rn useCallTranscript src tests scripts → 0 resultados. O critério do item aceita 'ou símbolo removido'.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3965 · Hook órfão useCreateInteraction

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/useMultichannel.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:176`
- **O que falta:** hook useCreateInteraction ausente (hooks.json e arquivos src/)
- **Evidência:** hook useCreateInteraction ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): Commit 9e4b2231a (#217) 'remover código morto catalogado pela auditoria (hooks órfãos...)' remove '-export const useCreateInteraction = () => {' de src/hooks/useMultichannel.ts (git show 9e4b2231a). Hoje: grep -rn useCreateInteraction src tests scripts → 0 resultados.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3966 · Hook órfão useQueueItems

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/dialer/usePowerDialer.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:198`
- **O que falta:** hook useQueueItems ausente (hooks.json e arquivos src/)
- **Evidência:** hook useQueueItems ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): Commit 9e4b2231a (#217) 'remover código morto catalogado pela auditoria (hooks órfãos...)' remove '-export const useQueueItems = (queueId: string \| null) => {' de src/hooks/dialer/usePowerDialer.ts (git show 9e4b2231a). Hoje: grep -rn useQueueItems src tests scripts → 0 resultados.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3100 · Gravação automática de calls (Zoom/Meet/Teams)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Falta integração que grave calls automaticamente a partir de Zoom/Google Meet/Teams.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:29`
- **O que falta:** construir integração OAuth com Zoom/Google Meet/Teams, function de captura/download da gravação e persistência em call_recordings/storage — nada disso existe hoje.
- **Evidência:** ausente: `ls supabase/functions| grep -i zoom` → 0 resultados de integração; nenhuma function '_meet_'/'_teams_' de OAuth; tables/public/call_recording_ingest_jobs.md é fila genérica sem colunas de provider de reunião/OAuth.
- **Revisão:** sem contestação cética concluída.

### F3120 · Roadmap Q2: Gravação + transcrição via Zoom

- **Tipo:** Integração externa
- **O que os docs afirmam:** Roadmap Q2 prevê gravação/transcrição com integração Zoom.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:227`
- **O que falta:** Item de roadmap (status='planejado'): nenhum OAuth Zoom, nenhuma function viva em produção para isso, nenhuma UI. Precisa ser construído do zero.
- **Evidência:** ausente: grep -rniE "zoom" src/ supabase/functions/ → só falsos positivos de animação CSS (ex. src/components/ui/dropdown-menu.tsx:40). transcribe-call-recording existe (supabase/functions/transcribe-call-recording/index.ts, chamado por src/hooks/conversational/useTranscribeRecording.ts:10) mas não integra Zoom e NÃO está na allowlist ACTIVE (.github/workflows/deploy.yml:144).
- **Revisão:** sem contestação cética concluída.

### F3127 · Zoom/Meet/Teams integração nativa

- **Tipo:** Integração externa
- **O que os docs afirmam:** Falta integração nativa com videoconferência (não só link).
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:56`
- **O que falta:** Tudo: OAuth, edge functions, tabela, UI. Confirma status_declarado='pendente'.
- **Evidência:** ausente: grep -rniE "zoom\|google-meet\|googlemeet\|microsoft.?teams" src/ supabase/functions/ → nenhuma integração real (só falsos positivos de CSS/animação). Sem OAuth, edge function ou tabela de reuniões.
- **Revisão:** sem contestação cética concluída.

### F3129 · Retry de envio multicanal

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Sem retry.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:139`
- **O que falta:** Implementar reagendamento com backoff (coluna de tentativas + cron/worker); confirma status_declarado='planejado'.
- **Evidência:** ausente: grep -n "retry\|backoff\|reagend" supabase/functions/send-multichannel-message/index.ts supabase/functions/multichannel-status-webhook/index.ts → 0 resultados. outbound_messages (tables/public/outbound_messages.md) não tem coluna de retry/attempt. cron.md não tem job ligado a outbound_messages (só 'email-bulk-retry-15min', domínio e-mail, diferente).
- **Revisão:** sem contestação cética concluída.

### F3130 · Assinatura de webhook Z-API

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Z-API não assina webhook.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:139`
- **O que falta:** Adicionar esquema de assinatura específico por tenant para Z-API; confirma status_declarado='pendente'.
- **Evidência:** webhook-auth.ts:426-485 (authenticateMultichannelStatusWebhook) só reconhece 3 esquemas: 'twilio' (x-twilio-signature, linha 433), 'meta_cloud' (x-hub-signature-256, linha 436) e 'generic' (x-webhook-signature + segredo único MULTICHANNEL_WEBHOOK_SECRET, linhas 438/476-484). Sem branch 'zapi' nem verificação por tenant.
- **Revisão:** sem contestação cética concluída.

### F3969 · Credenciais Meta Cloud (phone_number_id, access_token), Twilio e Z-API na tabela de provider via /admin/conexoes

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Credenciais por provider cadastradas em /admin/conexoes.
- **Fontes:** `docs/runbooks/whatsapp-multichannel.md:8-9,18-19,35`
- **O que falta:** tabela/view "phone_number_id" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "phone_number_id" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (PARCIAL): Tabela existe no banco real: public.channel_credentials (tables.md:71; tables/public/channel_credentials.md:7 RLS sim, provider CHECK twilio/meta_cloud/zapi, 4 policies owner_id=auth.uid() OR is_admin_or_manager). UI grava phone_number_id/access_token: src/components/multichannel/multichannelHelpers.ts:64-67 (meta_cloud), :55-57 (twilio), :68-72 (zapi); ProviderConnectionDialog.tsx:49-56 → useCreateChannelCredential (src/hooks/multichannel/useChannelCredentials.ts:48-58 insert). Montado em ChannelCredentialsManager.tsx:82 → src/pages/Multichannel.tsx:19, rota /multichannel (AppRoutes.tsx:344, menu sidebarMenuData.ts:178). Mas NÃO em /admin/conexoes: src/pages/admin/AdminConexoesPage.tsx não importa nada de multichannel/credenciais de canal.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3971 · Tabela de credenciais de provider por tenant (Twilio Account SID/token)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Credenciais por tenant ficam em tabela de credenciais de provider gerenciada em /admin/conexoes.
- **Fontes:** `docs/runbooks/twilio.md:19`
- **O que falta:** tabela/view "provider_credentials" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "provider_credentials" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (PARCIAL): Tabela 'similar' existe: public.channel_credentials (tables.md:71; tables/public/channel_credentials.md:7 RLS sim; colunas credentials jsonb, provider twilio). Lida pelas functions twilio-*: twilio-click-to-call/index.ts:142,159; twilio-call-status/index.ts:86,105; twilio-call-twiml/index.ts:84,102 (via _shared/secret-refs.ts resolveChannelCredentials). RLS: policies owner_id = auth.uid() OR is_admin_or_manager(auth.uid()) — não admin-only.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3972 · Tabelas call_recordings e calls

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Registro de chamadas e gravações para diagnóstico de status travado.
- **Fontes:** `docs/runbooks/twilio.md:37`
- **O que falta:** tabela/view "calls" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "calls" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (PARCIAL): public.call_recordings existe no banco real (tables.md:65; tables/public/call_recordings.md:7 RLS sim, :31 updated_at, :145/:149 triggers de updated_at). public.calls ausente: grep -c 'public\.calls\]' tables.md views.md → 0; grep -rn "from('calls')" src supabase/functions → 0. O registro real de chamadas está em public.twilio_call_sessions (tables.md:366) e public.call_logs (tables.md:58), ambas com RLS.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3973 · verified_at gravado na validação de credencial Twilio

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** verified_at nunca é gravado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:205`
- **O que falta:** tabela/view "verified_at" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "verified_at" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (PARCIAL): A coluna existe no banco real: tables/public/channel_credentials.md:27 ('\| 9 \| verified_at \| timestamp with time zone \| sim'), e é lida no tipo src/hooks/multichannel/useChannelCredentials.ts:17. Mas nenhum escritor: grep -rn verified_at supabase/functions → 0 resultados; em src/ só declarações de tipo (useChannelCredentials.ts:17, useReauthentication.ts:14 de outro domínio); nenhuma função SQL do snapshot que toca channel_credentials menciona verified_at.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

## Parcial (43)

### F3069 · Erro invalid_provider_credentials (502) e teste de credencial em /admin/conexoes

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Token Meta/Twilio/Z-API expirado; UI permite testar credencial.
- **Fontes:** `docs/FAQ_TROUBLESHOOTING.md:19`
- **O que falta:** Expor o teste de credencial de canal em /admin/conexoes (ou corrigir o doc para /multichannel); mapear 401/403 do provedor (token expirado) para invalid_provider_credentials em send-multichannel-message; ler o corpo do FunctionsHttpError em useTestChannelSend para mostrar o código de erro real.
- **Evidência:** Erro literal existe só em supabase/functions/send-multichannel-message/index.ts:324-328 (502 quando o jsonb credentials é malformado, não quando o token Meta/Twilio/Z-API expira). /admin/conexoes (src/routes/AppRoutes.tsx:965; src/pages/admin/AdminConexoesPage.tsx:102-109) só tem abas Bancos/Bitrix24/n8n/MCP/Webhooks, sem credencial de canal. O botão de teste de canal está em outra rota: src/components/multichannel/TestSendButton.tsx:38 ('Enviar teste'), montado em ChannelCredentialsManager.tsx:68 → src/pages/Multichannel.tsx:19 (/multichannel). useTestChannelSend (src/hooks/multichannel/useChannelCredentials.ts:99-124) chama send-multichannel-message (na allowlist deploy.yml:144); com 502 o invoke cai em onError e mostra toast genérico, não o código invalid_provider_credentials.
- **Revisão:** sem contestação cética concluída.

### F3070 · WhatsApp Tactical Dispatch: botões de disparo + logs de conversa em tempo real

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Botões de disparo WhatsApp e estrutura de logs de conversa em tempo real.
- **Fontes:** `docs/reports/AUDIT_REPORT.md:8-8`
- **O que falta:** Componente que liste o histórico de whatsapp_conversations da venda (useQuery + canal realtime), adicionar a tabela à publication supabase_realtime e mostrar o inbound junto do outbound.
- **Evidência:** Disparo real: src/components/sales/WhatsAppDialog.tsx:34 ('WhatsApp Tactical Dispatch') e :50-61 ('Disparar Agora') → src/hooks/useWhatsApp.ts:30-34 invoca send-multichannel-message (na allowlist) e grava log em whatsapp_conversations (useWhatsApp.ts:39-45; tabela com RLS, 2 policies, snapshot tables/public/whatsapp_conversations.md). A edge grava o outbound via rpc record_outbound_message (send-multichannel-message/index.ts:380; função existe em functions.md:314). Montado em SaleHUDCard.tsx:154/275 → /vendas. Mas 'logs de conversa em tempo real' não existe: nenhum leitor de whatsapp_conversations (grep 'whatsapp_conversations' em src → só o insert em useWhatsApp.ts:39), sem postgres_changes no dialog, e a tabela não está na publication realtime (whatsapp_conversations.md: 'realtime (publication)| não'). A mensagem inicial do textarea é template fixo (WhatsAppDialog.tsx:17-19).
- **Revisão:** sem contestação cética concluída.

### F3073 · Power dialer com discagem paralela

- **Tipo:** Componente
- **O que os docs afirmam:** Power dialer sequencial.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:207`
- **O que falta:** Implementar discagem paralela (N chamadas Twilio simultâneas e cancelamento das demais no primeiro 'answered' em twilio-call-status) e incluir twilio-click-to-call/twilio-call-status/twilio-call-twiml na allowlist de deploy.
- **Evidência:** O power dialer existe e é sequencial: rota /engagement/dialer (src/routes/AppRoutes.tsx:342; menu sidebarMenuData.ts:119,191), fila dialer_queues/dialer_queue_items (src/hooks/dialer/usePowerDialer.ts:30-45,191-213), builder dialer-queue-builder (na allowlist). Discagem paralela ausente: o único 'parallel' no dialer é paralelismo de cálculo de score (supabase/functions/dialer-queue-builder/index.ts:82); twilio-click-to-call recebe um único to_number (src/hooks/dialer/useClickToCall.ts:40-47) e está fora da allowlist.
- **Revisão:** sem contestação cética concluída.

### F3074 · Power Dialer paralelo (3-5 números simultâneos)

- **Tipo:** Componente
- **O que os docs afirmam:** Falta power dialer com discagem paralela.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:45`
- **O que falta:** Edge que dispare 3-5 chamadas Twilio em paralelo por item da fila, faça a ponte para o vendedor na primeira atendida e o hangup das demais; UI de seleção do modo paralelo no PowerDialer; deploy das twilio-*.
- **Evidência:** /engagement/dialer (AppRoutes.tsx:342) e dialer_queues existem (usePowerDialer.ts:35), mas sem modo paralelo de 3-5 números: grep -rli 'parallel\\|paralel\\|simultane' src/components/dialer src/hooks/dialer supabase/functions/twilio-click-to-call → 0 resultados; useInitiateCall envia 1 to_number (src/hooks/dialer/useClickToCall.ts:40-47). As twilio-* estão fora da allowlist .github/workflows/deploy.yml:144 (nem a chamada única roda em produção).
- **Revisão:** sem contestação cética concluída.

### F3076 · UI useElevenLabsVoice: configuração de voz/idioma em Settings e leitura de relatórios

- **Tipo:** Componente
- **O que os docs afirmam:** Falta configuração de voz/idioma em Settings e leitura de relatórios para useElevenLabsVoice (UI atual: 3 imports).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:57`
- **O que falta:** Campo de idioma em AIAssistantSettings, persistido em salesperson_preferences e repassado ao hook/edge; botão 'ouvir' nos relatórios (ex.: briefing executivo) usando useElevenLabsVoice.speak.
- **Evidência:** A configuração de voz existe: src/components/settings/AIAssistantSettings.tsx:18,48,247-281 (Select de VOICE_OPTIONS e 'testar voz' via elevenlabs-tts em :75-77), montado em src/pages/Configuracoes.tsx:16,266 (rota /configuracoes AppRoutes.tsx:953); o hook é usado em src/components/assistant/SalesAssistantChat.tsx:17,87 (/assistente). Idioma não configurável: fallback fixo utterance.lang='pt-BR' (src/hooks/useElevenLabsVoice.ts:83) e nenhum campo de idioma em AIAssistantSettings (grep -n -i 'language\\|idioma' → 0). Leitura de relatórios por voz: nenhum import de useElevenLabsVoice fora de SalesAssistantChat/AIAssistantSettings/useSalespersonPreferences.
- **Revisão:** sem contestação cética concluída.

### F3080 · Runbook Twilio coerente sobre TWILIO_TWIML_URL

- **Tipo:** Doc/config
- **O que os docs afirmam:** Runbook diverge sobre TWILIO_TWIML_URL.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:136`
- **O que falta:** Corrigir docs/runbooks/twilio.md: as envs são override opcional da URL usada no HMAC (não definem para onde a Twilio liga); trocar 'calls' por twilio_call_sessions/call_logs; registrar que as 3 twilio-* estão fora da allowlist de deploy.
- **Evidência:** A divergência persiste: docs/runbooks/twilio.md:17 diz que TWILIO_TWIML_URL/TWILIO_CALL_STATUS_URL são 'URLs públicas que a Twilio deve chamar', mas twilio-click-to-call monta as URLs a partir de SUPABASE_URL (supabase/functions/twilio-click-to-call/index.ts:204-205) e as duas envs são só override opcional da URL canônica na verificação de assinatura (twilio-call-twiml/index.ts:24; twilio-call-status/index.ts:18-22). O runbook também cita a tabela 'calls' (twilio.md:37), inexistente no snapshot (ls tables/public| grep '^calls.md' → 0), e fala em '401 no click-to-call' quando o 401 de assinatura vem dos callbacks.
- **Revisão:** sem contestação cética concluída.

### F3082 · Secrets TWILIO_TWIML_URL e TWILIO_CALL_STATUS_URL

- **Tipo:** Doc/config
- **O que os docs afirmam:** URLs públicas que a Twilio deve chamar, configuradas como secrets.
- **Fontes:** `docs/runbooks/twilio.md:17,25-26`
- **O que falta:** Decidir: ou o click-to-call passa a usar as envs (com fallback SUPABASE_URL) para Url/StatusCallback, ou o doc/runbook passa a descrevê-las como override de HMAC; confirmar os secrets no projeto; incluir as twilio-* na allowlist.
- **Evidência:** twilio-click-to-call NÃO usa as 2 envs: monta twimlUrl/statusUrl com SUPABASE_URL (supabase/functions/twilio-click-to-call/index.ts:204-205,210-211). As envs são lidas só como override na verificação de assinatura: TWILIO_TWIML_URL em twilio-call-twiml/index.ts:24 e TWILIO_CALL_STATUS_URL em twilio-call-status/index.ts:22. A configuração como secret não é verificável (sem acesso aos secrets). As 3 twilio-* estão fora da allowlist .github/workflows/deploy.yml:144.
- **Revisão:** sem contestação cética concluída.

### F3085 · Chamadas de entrada (inbound voice)

- **Tipo:** Edge function
- **O que os docs afirmam:** Chamadas de entrada não existem.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:205`
- **O que falta:** Edge de Voice URL para o número Twilio que resolva o vendedor pelo número chamado (channel_credentials.from_number), grave twilio_call_sessions/call_logs com direction=inbound e associe ao cliente pelo Caller; deploy na allowlist; UI de chamadas recebidas.
- **Evidência:** Não há webhook dedicado a chamada entrante: grep -rln -i 'twilio-inbound\\|inbound-call\\|incoming-call\\|inbound_call' supabase/functions src → 0 resultados. twilio-call-twiml só considera a 'perna de entrada' para o consentimento (index.ts:135-140) e roteia para o agent_phone do owner_id passado na query (index.ts:56-63,104,157-158): não há roteamento pelo número chamado nem registro do inbound em call_logs/atividade. twilio-call-twiml está fora da allowlist deploy.yml:144.
- **Revisão:** sem contestação cética concluída.

### F3960 · Edge function multichannel-status-webhook (17 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** O config local marca multichannel-status-webhook sem JWT (verify_jwt=false).| multichannel-status-webhook cobre WhatsApp/SMS; e-mail não verificado. \| supabase/functions/multichannel-status-webhook existe no repo (citada em src/: não); sonda OPTIONS em produção: OPTIONS → 200. Status no doc: OK. \| Multicanal — webhook de status. UI: —. Hook: —. Edge/Tabela: multichannel-status-webhook (100 l). Linhas no banco: outbound_messages 0. Quem dispara: provedor externo. O que falta: Não está em config.toml → verify_jwt ativo → Twilio/Meta receberiam 401 \| Superior: outbound_messages com channel whatsapp/sms e webhook de status. \| Catálogo API.md lista a edge function `multichannel-status-webhoo…
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:190-190`, `docs/benchmark/RAMPER_2026-07.md:69`, `docs/prod-readiness.md:351`, `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:274-274`, `docs/benchmark/RAMPER_2026-07.md:56`, `docs/API.md:217-217` e mais 11
- **O que falta:** send-multichannel-message não passa StatusCallback/URL deste webhook para Twilio/Z-API; configuração do webhook nos consoles Meta/Twilio/Z-API não é verificável pelo repo; parte de bounce de e-mail não está nesta função.
- **Evidência:** supabase/functions/multichannel-status-webhook/index.ts existe; está na allowlist de deploy (.github/workflows/deploy.yml:144); ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: supabase/functions/multichannel-status-webhook/index.ts existe (268 l), autentica em :128 (authenticateMultichannelStatusWebhook) e atualiza outbound_messages :205,226, sequence_enrollments :242 e RPC :248; supabase/config.toml:74-75 tem verify_jwt=false (a queixa dos docs de 'não está em config.toml' está desatualizada); está na allowlist .github/workflows/deploy.yml:144. Porém o envio não registra callback: grep -niE 'callback\|status_url' supabase/functions/send-multichannel-message/index.ts → 0 resultados; tabela outbound_messages existe (tables.md:225) mas sem tráfego conhecido.

### F3961 · Edge function twilio-call-status (13 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** 74 linhas; chamador: webhook ext.; edge: twilio-click-to-call:86; verify_jwt true (default); tabelas tocadas (linhas em produção): call_logs(0), twilio_call_sessions(0). Classificação do doc: PARCIAL.| supabase/functions/twilio-call-status existe no repo (citada em src/: não); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 100 funções do plano). Status no doc: BLOQUEADO. \| Callbacks Twilio de tenant falham na assinatura; sem StatusCallback no envio; sem retry. \| Catálogo API.md lista a edge function `twilio-call-status` na categoria "Voz / Dialer" com auth "assinatura do provedor · verify_jwt off", método "qualquer", payload "ts, form-urlencoded/texto" e resp…
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:463-463`, `docs/prod-readiness.md:419`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:129`, `docs/API.md:269-269`, `docs/estado/13_INTEGRACOES.md:62`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:195-195` e mais 7
- **O que falta:** Incluir twilio-call-status (e twilio-click-to-call) na allowlist deploy.yml:144 e deployar; sem isso nenhum callback Twilio é processado em produção.
- **Evidência:** supabase/functions/twilio-call-status/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: twilio-click-to-call| cético: supabase/functions/twilio-call-status/index.ts existe (lê channel_credentials :86, grava twilio_call_sessions :224 e call_logs :249, dedupe :164); supabase/config.toml:79-80 verify_jwt=false; chamada como StatusCallback por twilio-click-to-call/index.ts:211. Mas ausente da allowlist ACTIVE em .github/workflows/deploy.yml:144 (grep twilio na lista → 0).

### F3962 · Edge function twilio-call-twiml (11 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** 34 linhas; chamador: webhook ext.; edge: twilio-click-to-call:85; verify_jwt true (default); tabelas tocadas (linhas em produção): channel_credentials(0). Classificação do doc: SUGERIDO_OU_INICIADO (esqueleto).| supabase/functions/twilio-call-twiml existe no repo (citada em src/: não); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 100 funções do plano). Status no doc: BLOQUEADO. \| twilio-call-twiml/index.ts:122 grava sem checar consentimento. \| Catálogo API.md lista a edge function `twilio-call-twiml` na categoria "Voz / Dialer" com auth "assinatura do provedor · verify_jwt off", método "GET", payload "ts, form-urlencoded/texto · query: owner_id" e resposta …
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:464-464`, `docs/prod-readiness.md:420`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:131`, `docs/API.md:270-270`, `docs/estado/13_INTEGRACOES.md:62`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:196-196` e mais 5
- **O que falta:** Deploy (incluir na allowlist deploy.yml:144); sem isso o TwiML nunca é servido em produção.
- **Evidência:** supabase/functions/twilio-call-twiml/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: twilio-click-to-call| cético: supabase/functions/twilio-call-twiml/index.ts existe (lê channel_credentials :84 via resolveChannelCredentials :102); supabase/config.toml:82-83 verify_jwt=false. Ausente da allowlist ACTIVE em .github/workflows/deploy.yml:144 (grep twilio → 0).

### F3963 · Edge function twilio-click-to-call (11 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** supabase/functions/twilio-click-to-call existe no repo (citada em src/: sim); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 100 funções do plano). Status no doc: BLOQUEADO.| Discagem para prefixo não permitido retorna 403. \| Catálogo API.md lista a edge function `twilio-click-to-call` na categoria "Voz / Dialer" com auth "JWT do usuário · verify_jwt", método "qualquer", payload "to_number, from_number, toString, sale_id, queue_item_id" e resposta "JSON {error, message, ok}". \| 153 linhas; chamador: FE src/hooks/dialer/useClickToCall.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): twilio_call_sessions(0). Classificação do doc: PARCIAL. \|…
- **Fontes:** `docs/prod-readiness.md:421`, `docs/FAQ_TROUBLESHOOTING.md:12`, `docs/API.md:271-271`, `docs/estado/10_EDGE_FUNCTIONS.md:465-465`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:197-197`, `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:287-287` e mais 5
- **O que falta:** Deploy das três twilio-* (click-to-call, call-twiml, call-status) — fora da allowlist de 100; em produção o clique no botão recebe 404.
- **Evidência:** supabase/functions/twilio-click-to-call/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/dialer/useClickToCall.ts| cético: supabase/functions/twilio-click-to-call/index.ts existe (lê channel_credentials :142, resolve credenciais :159, StatusCallback :211, grava twilio_call_sessions :280); chamada por src/hooks/dialer/useClickToCall.ts:46, usado em src/components/dialer/ClickToCallButton.tsx, montado via CurrentCallCard.tsx:116 em src/pages/PowerDialer.tsx:165 (rota src/routes/AppRoutes.tsx:342, menu sidebarMenuData.ts:119). Mas fora da allowlist .github/workflows/deploy.yml:144.

### F3086 · Ingestão de respostas inbound de WhatsApp

- **Tipo:** Edge function
- **O que os docs afirmam:** Respostas recebidas não são ingeridas, só os status.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:129`
- **O que falta:** Incluir whatsapp-inbound-webhook na allowlist (trocando outra função); ingerir as mensagens inbound de Meta/Twilio/Z-API; gravar e mostrar a resposta no histórico da venda/cliente (whatsapp_conversations direction=inbound) na UI.
- **Evidência:** A ingestão existe só para Evolution: supabase/functions/whatsapp-inbound-webhook/index.ts:20-24,156,442,462-480 (insere inbound_reply_events e pausa a cadência); config.toml:71-72 verify_jwt=false. Mas a função está fora da allowlist .github/workflows/deploy.yml:144 (não roda em produção). Meta Cloud/Twilio/Z-API: multichannel-status-webhook trata só status (outbound_messages, index.ts:205,226). No CRM, inbound_reply_events só é lido por src/hooks/sequences/useAutoPause.ts:66; nenhuma UI mostra a mensagem recebida (whatsapp_conversations não tem leitor em src). A tabela inbound_reply_events tem RLS (1 policy).
- **Revisão:** sem contestação cética concluída.

### F3967 · Hook useClickToCall invoca twilio-click-to-call

- **Tipo:** Hook
- **O que os docs afirmam:** src/hooks/dialer/useClickToCall.ts chama a edge function de click-to-call.
- **Fontes:** `docs/estado/13_INTEGRACOES.md:62`
- **O que falta:** Deployar twilio-click-to-call (allowlist deploy.yml:144); frontend já está ligado.
- **Evidência:** arquivo src/hooks/dialer/useClickToCall.ts existe mas hook não consta em hooks.json (não exportado/indexado)| cético: Hook existe e é exportado: src/hooks/dialer/useClickToCall.ts:37 (useInitiateCall) invoca functions.invoke('twilio-click-to-call') em :46; consumido por src/components/dialer/ClickToCallButton.tsx, montado em CurrentCallCard.tsx:116 → PowerDialer.tsx:165 (AppRoutes.tsx:342) e SDRDashboard.tsx:557. A pré-checagem errou ao dizer 'não exportado', mas o veredito se mantém: twilio-click-to-call ausente da allowlist .github/workflows/deploy.yml:144.

### F3968 · Power dialer paralelo (3-5 linhas)

- **Tipo:** Hook
- **O que os docs afirmam:** usePowerDialer faz next_dialer_item sequencial.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:63`
- **O que falta:** arquivo src/hooks/dialer/usePowerDialer.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Evidência:** arquivo src/hooks/dialer/usePowerDialer.ts existe mas hook não consta em hooks.json (não exportado/indexado)| CONTESTADO pelo cético (NAO_IMPLEMENTADO): Só existe discagem sequencial: src/hooks/dialer/usePowerDialer.ts:191-210 (useNextItem chama RPC next_dialer_item, que devolve 1 item; functions.md:290). ausente: grep -rniE 'parallel\|paralel\|concurrent\|linhas simult' src/hooks/dialer src/components/dialer src/pages/PowerDialer.tsx supabase/functions/twilio-click-to-call → 0 resultados (único hit é um label de Promise em dialer-queue-builder/index.ts:82, sem relação com discagem). twilio-click-to-call disca uma chamada por request.
- **Revisão:** em disputa. O cético propõe Não implementado e o juiz ainda não decidiu.

### F3088 · Callbacks Twilio sem validação de X-Twilio-Signature

- **Tipo:** Integração externa
- **O que os docs afirmam:** twilio-call-status e twilio-call-twiml não verificam assinatura Twilio adequadamente.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:186-186`
- **O que falta:** Incluir twilio-call-status e twilio-call-twiml (e twilio-click-to-call) na allowlist de deploy e confirmar TWILIO_AUTH_TOKEN/credencial do tenant em produção.
- **Evidência:** A afirmação 'sem validação' está superada: twilio-call-status/index.ts:3,113-133 e twilio-call-twiml/index.ts:3,112-130 validam X-Twilio-Signature (HMAC via verifyTwilioSignatureAny em _shared/webhook-auth.ts), com token do tenant e fallback TWILIO_AUTH_TOKEN, e respondem 401 em falha; teste em supabase/functions/_shared/webhook-auth_twilio_any_test.ts. Porém as duas funções estão fora da allowlist .github/workflows/deploy.yml:144, logo os callbacks não existem em produção.
- **Revisão:** sem contestação cética concluída.

### F3089 · Click-to-call integrado (Twilio/RingCentral)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Falta click-to-call integrado.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:46`
- **O que falta:** Deployar as 3 twilio-* (entrar na allowlist de 100), cadastrar a credencial Twilio do tenant e validar uma chamada real gravando call_logs; botão de ligar também na ficha do contato/cliente, não só no Power Dialer.
- **Evidência:** Front pronto: src/components/dialer/ClickToCallButton.tsx usado em CurrentCallCard.tsx:12 (PowerDialer, /engagement/dialer AppRoutes.tsx:342); useInitiateCall invoca twilio-click-to-call (src/hooks/dialer/useClickToCall.ts:46-47); log em call_logs via twilio-call-status/index.ts:243-249 e via disposição manual em usePowerDialer.ts:213-230 (a tabela call_logs existe no snapshot). Mas twilio-click-to-call, twilio-call-status e twilio-call-twiml estão fora da allowlist .github/workflows/deploy.yml:144, então o botão falha em produção. Sem RingCentral (grep -rli ringcentral src supabase → 0).
- **Revisão:** sem contestação cética concluída.

### F3090 · Dialer Twilio: twilio-click-to-call chamado pelo front

- **Tipo:** Integração externa
- **O que os docs afirmam:** Doc: `twilio-click-to-call` é chamada (useClickToCall.ts:46); `twilio-call-status`/`twilio-call-twiml` são webhooks (ausência de chamada no front esperada).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:111-111`
- **O que falta:** Incluir twilio-click-to-call, twilio-call-status e twilio-call-twiml na allowlist de deploy e verificar com uma chamada real.
- **Evidência:** O hook invoca a edge: src/hooks/dialer/useClickToCall.ts:46-47 ('twilio-click-to-call'); a edge chama a API Twilio com Url/StatusCallback (supabase/functions/twilio-click-to-call/index.ts:204-216) e grava twilio_call_sessions (:281). twilio-call-status/twiml são webhooks (sem chamada no front, como esperado). Porém nenhuma das três está na allowlist .github/workflows/deploy.yml:144, então a ligação não é iniciada em produção.
- **Revisão:** sem contestação cética concluída.

### F3091 · Edge function elevenlabs-stt sem functions.invoke literal no front

- **Tipo:** Integração externa
- **O que os docs afirmam:** Uma das 64/168 funções sem invocador literal em src/. Grupo: Voz ElevenLabs sem invocação. Classificação por grupo deduzida do nome; pg_cron/config.toml não verificados.
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:291-311`
- **O que falta:** Decidir: ligar o STT do useElevenLabsVoice/upload de áudio a elevenlabs-stt (e deployar) ou remover a pasta como código morto.
- **Evidência:** supabase/functions/elevenlabs-stt/index.ts existe (lê ELEVENLABS_API_KEY em :63) mas não tem chamador: grep -rn 'elevenlabs-stt' src → 0 resultados; useElevenLabsVoice usa o SpeechRecognition do navegador (src/hooks/useElevenLabsVoice.ts, recognitionRef). Sem cron (grep elevenlabs cron.md → 0) e fora da allowlist .github/workflows/deploy.yml:144.
- **Revisão:** sem contestação cética concluída.

### F3095 · Edge function twilio-call-status sem functions.invoke literal no front

- **Tipo:** Integração externa
- **O que os docs afirmam:** Uma das 64/168 funções sem invocador literal em src/. Grupo: Webhook de entrada (INFERIDO). Classificação por grupo deduzida do nome; pg_cron/config.toml não verificados.
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:291-311`
- **O que falta:** incluir 'twilio-call-status' na allowlist ACTIVE do deploy.yml para a function rodar em produção.
- **Evidência:** supabase/functions/twilio-call-status/index.ts existe (282 linhas) e é referenciado como StatusCallback em supabase/functions/twilio-click-to-call/index.ts:205,211; AUSENTE da allowlist ACTIVE em .github/workflows/deploy.yml:144.
- **Revisão:** sem contestação cética concluída.

### F3096 · Edge function twilio-call-twiml sem functions.invoke literal no front

- **Tipo:** Integração externa
- **O que os docs afirmam:** Uma das 64/168 funções sem invocador literal em src/. Grupo: Webhook de entrada (INFERIDO). Classificação por grupo deduzida do nome; pg_cron/config.toml não verificados.
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:291-311`
- **O que falta:** incluir 'twilio-call-twiml' na allowlist ACTIVE do deploy.yml.
- **Evidência:** supabase/functions/twilio-call-twiml/index.ts existe e é referenciada em supabase/functions/twilio-click-to-call/index.ts:204; AUSENTE da allowlist ACTIVE (.github/workflows/deploy.yml:144).
- **Revisão:** sem contestação cética concluída.

### F3097 · Env TWILIO_CALL_STATUS_URL (status callback)

- **Tipo:** Integração externa
- **O que os docs afirmam:** URL de callback de status das chamadas.
- **Fontes:** `docs/FAQ_TROUBLESHOOTING.md:11`
- **O que falta:** deploy de twilio-call-status (mesma ação do F3095) para a env entrar em uso real.
- **Evidência:** Env lida em supabase/functions/twilio-call-status/index.ts:18,22 (Deno.env.get("TWILIO_CALL_STATUS_URL")); a function que a consome não está na allowlist ACTIVE de deploy (.github/workflows/deploy.yml:144), então a env não tem efeito em produção hoje.
- **Revisão:** sem contestação cética concluída.

### F3098 · Envio via MessageBird suportado

- **Tipo:** Integração externa
- **O que os docs afirmam:** MessageBird aparece na UI mas o envio responde provider_not_supported (send-multichannel-message/index.ts:306).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:129`
- **O que falta:** implementar sendMessageBird() e um case 'messagebird' em send-multichannel-message/index.ts, ou remover a opção da UI.
- **Evidência:** src/hooks/multichannel/useChannelCredentials.ts:6 lista 'messagebird'; src/components/multichannel/multichannelHelpers.ts:15,73 expõe na UI; supabase/functions/send-multichannel-message/index.ts:339-377 — switch só trata 'twilio','meta_cloud','evolution','zapi'; 'messagebird' cai no default (376-377) → provider_not_supported.
- **Revisão:** sem contestação cética concluída.

### F3099 · Etapa canônica 26/08 nº 66: Completar Conversational Intelligence (upload, transcrição, diarização, feed, coaching)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Etapa canônica 66 (plano 26/08, matriz de status 30/08, estado 🔒): chamada→transcrição→insight E2E.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:216-216`
- **O que falta:** incluir 'transcribe-call-recording' e 'summarize-call-recording' (ambos existem em supabase/functions/) na allowlist ACTIVE do deploy.yml.
- **Evidência:** Rotas /conversational-intelligence e recordings montadas (AppRoutes.tsx:349,353); pipeline existe (useUploadCallRecording.ts, useTranscribeRecording.ts:9 invoca 'transcribe-call-recording', useSummarizeRecording.ts:9 invoca 'summarize-call-recording', useDiarizeRecording.ts); PORÉM 'transcribe-call-recording' e 'summarize-call-recording' NÃO constam na allowlist ACTIVE de deploy (.github/workflows/deploy.yml:144, lista com exatas 100 entradas).
- **Revisão:** sem contestação cética concluída.

### F3101 · Handoff P076: Integrar WhatsApp a provedor real e persistir status do provedor

- **Tipo:** Integração externa
- **O que os docs afirmam:** Fila canônica do handoff (onda 8): Integrar WhatsApp a provedor real e persistir status do provedor. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:387-387`
- **O que falta:** fazer o callback do provedor atualizar whatsapp_conversations.status a partir da entrega real — hoje fica congelado em 'sent'.
- **Evidência:** src/hooks/useWhatsApp.ts:30-35 chama send-multichannel-message (provedor real) e, após sucesso, grava direto status:'sent' em whatsapp_conversations (useWhatsApp.ts:39-45); multichannel-status-webhook só atualiza outbound_messages/sequence_enrollments (edge-functions.json), nunca whatsapp_conversations — grep confirma que só useWhatsApp.ts grava nela.
- **Revisão:** sem contestação cética concluída.

### F3103 · Integração ElevenLabs (STT/TTS/voice)

- **Tipo:** Integração externa
- **O que os docs afirmam:** ElevenLabs integrado por elevenlabs-stt, elevenlabs-tts e elevenlabs-voice.
- **Fontes:** `docs/agentes/mapa-do-sistema.md:77`
- **O que falta:** elevenlabs-stt precisa ser chamada por um fluxo real e incluída na allowlist de deploy; hoje é código morto.
- **Evidência:** elevenlabs-tts e elevenlabs-voice na allowlist e chamadas pelo front (AIAssistantSettings.tsx; useElevenLabsVoice.ts); elevenlabs-stt órfã — edge-functions.json: chamada_pelo_front:[], orfa:true — e ausente da allowlist.
- **Revisão:** sem contestação cética concluída.

### F3104 · Integração ElevenLabs STT

- **Tipo:** Integração externa
- **O que os docs afirmam:** https://api.elevenlabs.io/v1/speech-to-text em elevenlabs-stt/index.ts:67.
- **Fontes:** `docs/estado/06_DOMINIO_IA_COACHING.md:30`
- **O que falta:** conectar um fluxo real a elevenlabs-stt e incluí-la na allowlist de deploy.
- **Evidência:** supabase/functions/elevenlabs-stt/index.ts:67 chama https://api.elevenlabs.io/v1/speech-to-text; grep -rn elevenlabs-stt src/ → 0 resultados; ausente da allowlist ACTIVE; edge-functions.json confirma orfa:true.
- **Revisão:** sem contestação cética concluída.

### F3106 · Integração ElevenLabs: elevenlabs-stt / tts / voice

- **Tipo:** Integração externa
- **O que os docs afirmam:** ARCHITECTURE: ElevenLabs via elevenlabs-stt, elevenlabs-tts e elevenlabs-voice.
- **Fontes:** `docs/ARCHITECTURE.md:109-109`
- **O que falta:** mesmo gap do F3103/F3104 — stt não está em uso real nem deployado; fluxo de voz hoje é só TTS/voice.
- **Evidência:** elevenlabs-tts e elevenlabs-voice deployadas e usadas (voice via useElevenLabsVoice.ts em SalesAssistantChat.tsx, rota /assistente — AppRoutes.tsx:946, sidebarMenuData.ts:161); elevenlabs-stt órfã e fora da allowlist.
- **Revisão:** sem contestação cética concluída.

### F3108 · Integração externa: ElevenLabs (voz/STT)

- **Tipo:** Integração externa
- **O que os docs afirmam:** 3 funções; 2/3 publicadas; elevenlabs-stt indisponível. Chamada real ao provedor não exercida (B4).
- **Fontes:** `docs/prod-readiness.md:859`
- **O que falta:** deployar elevenlabs-stt e conectá-la a um fluxo real; chamada real ao provedor e secret não verificáveis sem acesso a painel/logs de produção.
- **Evidência:** Allowlist ACTIVE contém elevenlabs-tts e elevenlabs-voice mas não elevenlabs-stt (deploy.yml:144); edge-functions.json confirma elevenlabs-stt orfa:true — exatamente '2/3 publicadas, stt indisponível' descrito no doc.
- **Revisão:** sem contestação cética concluída.

### F3111 · Integração externa: Twilio (click-to-call, call-status, call-twiml)

- **Tipo:** Integração externa
- **O que os docs afirmam:** 3 funções Twilio não publicadas (0/3). Chamada real ao provedor não exercida (B4).
- **Fontes:** `docs/prod-readiness.md:871`
- **O que falta:** incluir as 3 functions Twilio na allowlist ACTIVE do deploy.yml; só então validar chamada real.
- **Evidência:** nenhuma das três (twilio-click-to-call, twilio-call-status, twilio-call-twiml) consta na allowlist ACTIVE (deploy.yml:144); código completo e ligado ao front: useClickToCall.ts → ClickToCallButton.tsx → CurrentCallCard.tsx → PowerDialer.tsx, rota /engagement/dialer (sidebarMenuData.ts:119).
- **Revisão:** sem contestação cética concluída.

### F3112 · Integração externa: WhatsApp inbound webhook

- **Tipo:** Integração externa
- **O que os docs afirmam:** 1 função (whatsapp-inbound-webhook) não publicada (0/1). Chamada real ao provedor não exercida (B4).
- **Fontes:** `docs/prod-readiness.md:865`
- **O que falta:** incluir 'whatsapp-inbound-webhook' na allowlist ACTIVE do deploy.yml.
- **Evidência:** whatsapp-inbound-webhook ausente da allowlist ACTIVE (deploy.yml:144); código existe, usa WHATSAPP_INBOUND_WEBHOOK_SECRET, grava em inbound_reply_events/outbound_messages/sequence_step_executions e chama match_whatsapp_reply_to_enrollment/auto_pause_enrollment (edge-functions.json).
- **Revisão:** sem contestação cética concluída.

### F3113 · Integração Twilio (voz): twilio-call-status / twiml / click-to-call

- **Tipo:** Integração externa
- **O que os docs afirmam:** ARCHITECTURE: Twilio integrado via twilio-call-status, twilio-call-twiml e twilio-click-to-call.
- **Fontes:** `docs/ARCHITECTURE.md:108-108`
- **O que falta:** deploy das 3 functions Twilio (incluir na allowlist ACTIVE).
- **Evidência:** botão de ligar montado (ClickToCallButton em CurrentCallCard.tsx, usado em PowerDialer.tsx, rota /engagement/dialer); as 3 functions Twilio estão AUSENTES da allowlist ACTIVE (deploy.yml:144) — ARCHITECTURE.md:108 declara 'implementado' mas não roda em produção hoje.
- **Revisão:** sem contestação cética concluída.

### F3114 · Integração Twilio (voz/dialer)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Twilio integrado por twilio-call-status, twilio-call-twiml e twilio-click-to-call.
- **Fontes:** `docs/agentes/mapa-do-sistema.md:76`
- **O que falta:** deploy das 3 functions Twilio (mesma ação de F3111/F3113).
- **Evidência:** assinatura X-Twilio-Signature validada no código (twilio-call-status/index.ts:121-126, twilio-call-twiml/index.ts:118-123 via verifyTwilioSignatureAny); nenhuma das 3 functions está na allowlist ACTIVE (deploy.yml:144) — o próprio doc citado já registra 'click-to-call deployada (hoje listada como não deployada)', confirmado nesta sessão para as 3 functions.
- **Revisão:** sem contestação cética concluída.

### F3118 · Plano 30/08 etapa 76 (P076): Integrar WhatsApp a provedor real e persistir status do provedor

- **Tipo:** Integração externa
- **O que os docs afirmam:** Etapa 76 do plano de 100 etapas (auditoria 30/08; = P076 do handoff): Nenhum sent/sucesso otimista antes de confirmação do provedor.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:743-743`
- **O que falta:** mesmo de F3101 — ligar o callback real do provedor à atualização de whatsapp_conversations.status.
- **Evidência:** mesma evidência de F3101 — useWhatsApp.ts:30-45 chama provedor real via send-multichannel-message e grava status:'sent' direto em whatsapp_conversations sem nunca ser atualizado por callback (multichannel-status-webhook só escreve em outbound_messages/sequence_enrollments).
- **Revisão:** sem contestação cética concluída.

### F3119 · Provedores multicanal configurados (channel_credentials) e crons

- **Tipo:** Integração externa
- **O que os docs afirmam:** PARCIAL (operacional): UI+hook+edge presentes; dependem de channel_credentials e cron; NÃO VERIFICÁVEL sem DB.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:107`
- **O que falta:** Cadastrar credencial real em channel_credentials (UI ChannelCredentialsManager.tsx já existe) e enviar mensagem real para popular outbound_messages; não há cron necessário para este fluxo síncrono.
- **Evidência:** Tabela channel_credentials existe com RLS/4 policies (docs/contexto/supabase/tables/public/channel_credentials.md) mas 0 linhas (docs/contexto/supabase/stats.md). send-multichannel-message existe e está na allowlist ACTIVE (.github/workflows/deploy.yml:144). outbound_messages também 0 linhas (stats.md) — nenhum envio real. cron.md (47 jobs) não tem job de multicanal/outbound.
- **Revisão:** sem contestação cética concluída.

### F3121 · Telefonia Twilio (twilio-*)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Superior.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:134`
- **O que falta:** Adicionar as 3 functions twilio-* à allowlist ACTIVE (deploy.yml:144, liberando espaço no limite de 100) e configurar os secrets TWILIO_* para a claim 'implementado/superior' valer em produção.
- **Evidência:** supabase/functions/twilio-call-status, twilio-call-twiml, twilio-click-to-call existem no repo, mas nenhuma consta na allowlist ACTIVE (.github/workflows/deploy.yml:144) — grep -i twilio sobre a lista ACTIVE extraída → 0 resultados. Plano Supabase limita a 100 functions deployadas (comentário em deploy.yml:140-143); function fora da allowlist não roda em produção mesmo existindo no repo.
- **Revisão:** sem contestação cética concluída.

### F3122 · TWILIO_AUTH_TOKEN usado por verifyTwilioSignature

- **Tipo:** Integração externa
- **O que os docs afirmam:** Assinatura de webhooks de voz verificada com o auth token.
- **Fontes:** `docs/SECRETS_ROTATION.md:23`
- **O que falta:** Colocar twilio-call-status na allowlist ACTIVE para a verificação proteger um endpoint vivo.
- **Evidência:** verifyTwilioSignature existe em supabase/functions/_shared/webhook-auth.ts:177 e é usado por twilio-call-status/index.ts:121 (via verifyTwilioSignatureAny, import linha 3). Código correto, mas twilio-call-status NÃO está na allowlist ACTIVE (.github/workflows/deploy.yml:144) — a function não roda em produção.
- **Revisão:** sem contestação cética concluída.

### F3124 · WhatsApp multichannel com provider por credencial (Twilio, Meta Cloud, Z-API, Evolution) + whatsapp-inbound-webhook

- **Tipo:** Integração externa
- **O que os docs afirmam:** send-multichannel-message resolve provider pela credencial; recebimento via whatsapp-inbound-webhook (Evolution).
- **Fontes:** `docs/agentes/mapa-do-sistema.md:80`
- **O que falta:** Adicionar 'whatsapp-inbound-webhook' à allowlist ACTIVE; hoje só envio e status estão vivos em produção, não o recebimento.
- **Evidência:** send-multichannel-message/index.ts:341-373 resolve provider por credencial (twilio/meta_cloud/evolution/zapi) e está na allowlist ACTIVE. src/pages/Multichannel.tsx monta MultichannelDashboard+SequenceSendsWidget+ChannelCredentialsManager, roteado (AppRoutes.tsx:344) e no menu (sidebarMenuData.ts:178). Porém whatsapp-inbound-webhook existe no repo mas NÃO está na allowlist ACTIVE (deploy.yml:144) — grep sobre a lista ACTIVE → 0 resultados.
- **Revisão:** sem contestação cética concluída.

### F3126 · WhatsApp: send-multichannel-message (Twilio, Meta Cloud, Z-API ou Evolution) + whatsapp-inbound-webhook (Evolution)

- **Tipo:** Integração externa
- **O que os docs afirmam:** ARCHITECTURE: WhatsApp via send-multichannel-message com provedores Twilio, Meta Cloud, Z-API ou Evolution, e whatsapp-inbound-webhook (Evolution) para entrada.
- **Fontes:** `docs/ARCHITECTURE.md:112-112`
- **O que falta:** 1) colocar whatsapp-inbound-webhook na allowlist ACTIVE; 2) cadastrar credencial real; 3) enviar mensagem real para popular outbound_messages.
- **Evidência:** send-multichannel-message (deployado) suporta twilio/meta_cloud/evolution/zapi (index.ts:341-373). multichannel-status-webhook também deployado. whatsapp-inbound-webhook existe no repo mas NÃO está na allowlist ACTIVE (deploy.yml:144). channel_credentials e outbound_messages têm 0 linhas (stats.md) — nenhuma credencial configurada, nenhuma mensagem enviada.
- **Revisão:** sem contestação cética concluída.

### F3128 · Gap "classe mundial" já existente: Click-to-call

- **Tipo:** Outro
- **O que os docs afirmam:** Doc afirma que o gap "Click-to-call" de GAPS_CLASSE_MUNDIAL já existe no código.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:208`
- **O que falta:** Adicionar 'twilio-click-to-call' à allowlist ACTIVE; sem isso o botão existe mas nunca completa a chamada em produção.
- **Evidência:** ClickToCallButton.tsx → useClickToCall.ts:46 chama supabase.functions.invoke('twilio-click-to-call'), sem mock. Usado em CurrentCallCard.tsx → src/pages/PowerDialer.tsx (rota '/engagement/dialer', AppRoutes.tsx:342; menu sidebarMenuData.ts:119) e SDRDashboard.tsx (rota '/sdr'). Porém twilio-click-to-call NÃO está na allowlist ACTIVE (deploy.yml:144) — grep -i twilio na lista ACTIVE → 0 resultados; a chamada falha em produção.
- **Revisão:** sem contestação cética concluída.

### F3131 · Consentimento antes de gravar chamada Twilio

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** twilio-call-twiml grava com record-from-answer sem checar consentimento; upload também não checa.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:146`
- **O que falta:** Adicionar checagem de consentimento no fluxo de upload manual (useUploadCallRecording.ts e/ou process-call-recording-ingest) antes de persistir a gravação; a via automática Twilio já está corrigida.
- **Evidência:** twilio-call-twiml/index.ts:142-158 HOJE checa consentimento: default 'do-not-record', só muda para 'record-from-answer' se has_phone_consent(phone,'voice_recording') (RPC) retornar true. Fix entrou no commit 8939e122e (2026-10-18), DEPOIS do doc de auditoria citado (2026-10-12) — claim desatualizada para esse arquivo. Mas useUploadCallRecording.ts (upload manual) e process-call-recording-ingest não chamam has_phone_consent/has_active_consent (grep consent → 0 resultados em ambos) — permanece sem checagem.
- **Revisão:** sem contestação cética concluída.

### F3132 · Validação HMAC X-Twilio-Signature em _shared/webhook-auth.ts (verifyTwilioSignature :177, verifyTwilioSignatureAny :200)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Proteção do endpoint Twilio na camada da edge function, HMAC-SHA1 timing-safe.
- **Fontes:** `docs/agentes/migrations-arquivadas-veredicto-261117.md:148-153`
- **O que falta:** Colocar twilio-call-status e twilio-call-twiml na allowlist ACTIVE para a proteção valer em produção.
- **Evidência:** verifyTwilioSignature em webhook-auth.ts:177, verifyTwilioSignatureAny em :200 (linhas exatas citadas pela doc), usadas antes de qualquer escrita em twilio-call-status/index.ts:121 e twilio-call-twiml/index.ts:118. Código correto, mas nenhuma das duas functions está na allowlist ACTIVE (deploy.yml:144) — mecanismo existe mas não protege endpoint vivo em produção.
- **Revisão:** sem contestação cética concluída.

### F3133 · Verificação de assinatura Twilio com TWILIO_AUTH_TOKEN

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Webhooks Twilio validam assinatura com TWILIO_AUTH_TOKEN; não publicar verify_jwt=false sem a verificação no handler.
- **Fontes:** `docs/runbooks/twilio.md:16,23-24,42-44`
- **O que falta:** Colocar twilio-call-status e twilio-call-twiml na allowlist ACTIVE para a claim valer integralmente em produção.
- **Evidência:** TWILIO_AUTH_TOKEN lido em webhook-auth.ts:445 dentro de authenticateMultichannelStatusWebhook, e via verifyTwilioSignatureAny em twilio-call-status (:121) e twilio-call-twiml (:118); código valida X-Twilio-Signature antes de escrever. Mas twilio-call-status/twilio-call-twiml não estão na allowlist ACTIVE (deploy.yml:144) — não rodam em produção; só multichannel-status-webhook (que também aceita Twilio) está de fato ativo e protegido (webhook-auth.ts:444-458).
- **Revisão:** sem contestação cética concluída.

## Não verificável (2)

### F3081 · Secret de edge ELEVENLABS_API_KEY

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc lista o secret `ELEVENLABS_API_KEY` — API Key do ElevenLabs (TTS/STT) — como configurado nas Edge Functions.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1687-1698`
- **O que falta:** Listar os secrets de Edge Functions do projeto usyxfpqlsspldubptrdl (painel ou API de management) e confirmar ELEVENLABS_API_KEY sem imprimir o valor; ou invocar elevenlabs-tts e checar a ausência de 'api_key_not_configured'.
- **Evidência:** Leitura no código confirmada: Deno.env.get('ELEVENLABS_API_KEY') em supabase/functions/elevenlabs-tts/index.ts:62, elevenlabs-voice/index.ts:45 e elevenlabs-stt/index.ts:63. A existência do secret no projeto usyxfpqlsspldubptrdl não consta do snapshot (grep -i eleven supabase/vault.md → 0) e não há MCP deste projeto disponível para listar os secrets de edge.
- **Revisão:** sem contestação cética concluída.

### F3083 · Segredo ELEVENLABS_API_KEY lido por 3 edge function(s)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Voz (stt/tts/voice). Doc extrai via grep de Deno.env.get; não verifica se o segredo está configurado no projeto.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:125-138`
- **O que falta:** Confirmar o secret no projeto e um log de elevenlabs-voice/elevenlabs-tts sem 'ELEVENLABS_API_KEY is not configured'/'api_key_not_configured'.
- **Evidência:** 3 leitores confirmados: elevenlabs-tts/index.ts:62, elevenlabs-voice/index.ts:45 e elevenlabs-stt/index.ts:63. elevenlabs-stt está fora da allowlist deploy.yml:144 (só tts e voice rodam). A presença do secret e a execução sem erro de env exigem listar secrets/logs do projeto, que não estão no snapshot nem acessíveis por MCP nesta sessão.
- **Revisão:** sem contestação cética concluída.
