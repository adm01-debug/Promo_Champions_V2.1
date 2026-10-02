# API — Promo Champions V2.1

> Catálogo gerado automaticamente por `scripts/gen-api-catalog.mjs` a
> partir do código-fonte. Para atualizar: `node scripts/gen-api-catalog.mjs`.

## Visão geral

- **Edge Functions** (Deno): `https://usyxfpqlsspldubptrdl.supabase.co/functions/v1/<nome>`
- **PostgREST** (CRUD das tabelas com RLS): `https://usyxfpqlsspldubptrdl.supabase.co/rest/v1/` — a especificação OpenAPI é gerada pelo próprio Supabase.
- **Auth**: `Authorization: Bearer <JWT do usuário>` (Supabase Auth).

### Modelo de autenticação das functions

- `verify_jwt` (padrão do gateway): exige JWT válido antes do handler. As
  exceptions estão em `supabase/config.toml` (`verify_jwt = false`) — webhooks
  de provedores e jobs internos.
- `JWT do usuário (RLS)` — `getUserClient(req)` valida o token e opera sob RLS.
- `segredo interno` — `isAuthorizedCronRequest`/`isInternalServiceRequest`:
  Authorization service_role ou header `X-Cron-Secret` (jobs pg_cron).
- `assinatura do provedor` — verificação criptográfica no handler (Twilio,
  Meta/Evolution, Resend/Svix, SendGrid).
- `nenhuma detectada no handler` — nenhum padrão conhecido encontrado;
  confira a function antes de expor/chamar.

## Edge functions

Total: 169 functions.

### Alertas / Monitoramento (13)

| Function | Auth exigida | Método | Payload (campos principais) | Resposta |
|----------|--------------|--------|------------------------------|----------|
| `access-denied-alerts` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {message, spikesDetected, totalAttempts, emailsSentT… |
| `activity-goal-alerts` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {success, checked, belowTarget, alerts, error} |
| `campaign-health-alert` | segredo interno (cron/service_role) + JWT do usuário (RLS) + papel admin/gestor · verify_jwt off | só POST | — | JSON |
| `cron-failure-alerter` | segredo interno (cron/service_role) · verify_jwt off | só POST | query: since_minutes | JSON {error, ok, failures, notified, admins} |
| `detect-client-churn-alerts` | segredo interno (cron/service_role) + JWT do usuário (RLS) + papel admin/gestor · verify_jwt off | só POST | — | JSON {ok, evaluated, tasks_created} |
| `edge-retry-threshold-alert` | segredo interno (cron/service_role) · verify_jwt off | só POST | slice | JSON {error, skipped, ok, alerted, window_hours, request_id} |
| `get-client-ip` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON |
| `log-web-vitals` | nenhuma detectada no handler · verify_jwt off | só POST | ts, samples, form-urlencoded/texto | JSON {error, inserted} |
| `new-device-alert` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {error, message, is_new, alert_id} |
| `renewal-automation` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {ok, risk_updated, renewals_inspected, tasks_created… |
| `sdr-consecutive-alerts` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {success, message, error} |
| `send-alert-notifications` | nenhuma detectada no handler · verify_jwt | qualquer | recipientEmail | JSON {message, emailsSent, alertsSent, error} |
| `wal-health-alert` | nenhuma detectada no handler · verify_jwt | qualquer | slice | JSON {error, hint, ok} |

### Auth / Segurança (2)

| Function | Auth exigida | Método | Payload (campos principais) | Resposta |
|----------|--------------|--------|------------------------------|----------|
| `send-password-reset` | JWT do usuário · verify_jwt | qualquer | — | JSON {success, error} |
| `webauthn` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {error, code} |

### CRM / Pipeline (29)

| Function | Auth exigida | Método | Payload (campos principais) | Resposta |
|----------|--------------|--------|------------------------------|----------|
| `analyze-pipeline-coverage` | Bearer manual · verify_jwt | qualquer | period_days, owner_id | JSON {snapshots_inserted, recommendations_inserted, calcu… |
| `analyze-stage-conversion` | nenhuma detectada no handler · verify_jwt | POST | days, owner_id | JSON {ok, metrics, insights, owner_id, error} |
| `analyze-win-loss` | JWT do usuário · verify_jwt | qualquer | mode, title, description | JSON {error, explanation, ok} |
| `calculate-committee-coverage` | JWT do usuário (RLS) · verify_jwt | só POST | — | JSON {error, success} |
| `calculate-deal-health` | JWT do usuário · verify_jwt | qualquer | sale_id, batch | JSON {error, processed} |
| `check-quote-expiration` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {error, success, processed, request_id} |
| `deal-probability` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {error} |
| `deal-risk-digest` | segredo interno (cron/service_role) · verify_jwt off | só POST | — | JSON {error, ok} |
| `detect-at-risk-deals` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {error, context, activityCount} |
| `detect-stuck-deals` | Bearer manual · verify_jwt | qualquer | — | JSON {error, ok} |
| `detect-winloss-at-risk` | nenhuma detectada no handler · verify_jwt | POST | threshold, limit | JSON {deals, total, meta, patterns_used, deals_evaluated,… |
| `export-winloss-pdf` | JWT do usuário (RLS) · verify_jwt | qualquer | — | JSON {error, url, format, inline} |
| `extract-committee-from-call` | nenhuma detectada no handler · verify_jwt | qualquer | owner_id | JSON {error, extracted, created, updated, confidence} |
| `extract-deal-stakeholders` | JWT do usuário · verify_jwt | qualquer | recording_id, sale_id, manual_text | JSON {error, success} |
| `mine-win-loss-patterns` | JWT do usuário · verify_jwt | qualquer | — | JSON {error, ok} |
| `notify-quote-conversion` | JWT do usuário (RLS) · verify_jwt | só POST | success, quote_id, sale_id, order_id, order_number, previous_status, new_status, reused_order, idempotent, … | JSON |
| `notify-v4-quote-status` | segredo interno (cron/service_role) · verify_jwt off | só POST | — | JSON {error, success} |
| `pipeline-pulse-aggregator` | JWT do usuário (RLS) + papel admin/gestor · verify_jwt | só POST | — | JSON {error} |
| `predict-deal-velocity` | nenhuma detectada no handler · verify_jwt | qualquer | batch, limit, sale_id | JSON {count, error} |
| `receive-quote-sync` | assinatura do provedor · verify_jwt off | só POST | ts, quote_id, form-urlencoded/texto | JSON |
| `receive-quote-webhook` | API key · verify_jwt | só POST | action, quote, pdf_base64, timestamp, contrato:quoteSync | JSON {error, success, quote_id, sale_id, client_id, sales… |
| `recompute-stage-baselines` | JWT do usuário (RLS) · verify_jwt | qualquer | — | JSON {error, ok} |
| `refresh-stage-baselines` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {buckets, error} |
| `send-quote-to-client` | JWT do usuário (RLS) + papel admin/gestor · verify_jwt | só POST | quote_id, channels, custom_message | JSON {error, success} |
| `winloss-webhook-dispatcher` | nenhuma detectada no handler · verify_jwt | qualquer | __request_id, event, __target_subscription_id, __replay_of | JSON |
| `winloss-webhook-health-monitor` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {checked, fired, suppressed, error} |
| `winloss-webhook-replay` | JWT do usuário · verify_jwt | qualquer | requestId, userId, userEmail, source, summary, durationMs, ids | JSON |
| `winloss-webhook-replay-batch` | Bearer manual · verify_jwt | só POST | dead_letter_ids, delivery_ids, chunk_size, stop_on_error | JSON |
| `winloss-webhook-timeline` | JWT do usuário · verify_jwt | GET | query: limit, requestId, subscriptionId, since | JSON |

### Cadências / Workflows (11)

| Function | Auth exigida | Método | Payload (campos principais) | Resposta |
|----------|--------------|--------|------------------------------|----------|
| `auto-enroll-cadence` | nenhuma detectada no handler · verify_jwt | POST | sale_ids | JSON {processed, error} |
| `execute-workflow` | JWT do usuário (RLS) · verify_jwt | qualquer | workflow_id, trigger_payload, title, description, delay_hours, activity_type, notes, stage, contrato:workfl… | JSON {error, skipped} |
| `process-cadence-tasks` | segredo interno (cron/service_role) + JWT do usuário (RLS) + papel admin/gestor · verify_jwt | só POST | — | JSON {ok} |
| `process-scheduled-sends` | segredo interno (cron/service_role) · verify_jwt | só POST | — | JSON |
| `schedule-optimal-send` | JWT do usuário · verify_jwt | qualquer | sale_id, channel, payload, force_now | JSON {error, id, scheduled_for} |
| `send-time-optimizer` | Bearer manual · verify_jwt | qualquer | sale_ids, recompute_all | JSON {error} |
| `sequence-ab-promote` | JWT do usuário · verify_jwt | qualquer | — | JSON {error, ok} |
| `sequence-enroll` | JWT do usuário · verify_jwt | qualquer | sequence_id, contacts | JSON {error, ok, enrolled, skipped_duplicates} |
| `sequence-record-reply` | JWT do usuário · verify_jwt | qualquer | — | JSON {error, ok} |
| `sequence-runner` | segredo interno (cron/service_role) + JWT do usuário (RLS) · verify_jwt | só POST | — | JSON {ok, duration_ms, errors} |
| `workflow-executor` | JWT do usuário · verify_jwt | qualquer | — | JSON {error, execution_id} |

### Coaching (8)

| Function | Auth exigida | Método | Payload (campos principais) | Resposta |
|----------|--------------|--------|------------------------------|----------|
| `aggregate-coaching-scorecard` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {error} |
| `coaching-impact-summary` | Bearer manual · verify_jwt | só POST | — | JSON {error, summary} |
| `coaching-session-prep` | Bearer manual · verify_jwt | qualquer | — | JSON {error} |
| `detect-coaching-opportunities` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {success, reps_analyzed, opportunities_detected, cri… |
| `extract-coaching-actions` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {error} |
| `generate-coaching-actions` | segredo interno (cron/service_role) + JWT do usuário · verify_jwt | só POST | — | JSON {error, ok} |
| `generate-loss-coaching` | nenhuma detectada no handler · verify_jwt | qualquer | salesperson_id | JSON {error, skipped} |
| `salesperson-coaching` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {error, salesperson, id, name, avatar_url} |

### Customer Success (6)

| Function | Auth exigida | Método | Payload (campos principais) | Resposta |
|----------|--------------|--------|------------------------------|----------|
| `csat-ces-trigger` | nenhuma detectada no handler · verify_jwt | qualquer | account_id, contact_email, survey_type, trigger_event, score, comment | JSON |
| `customer-success-360` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {accounts, tickets, renewals, error} |
| `customer-success-hub` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {accounts, error} |
| `expansion-detector` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {ok, playbooks, accounts, opportunities_created, ski… |
| `qbr-generator` | Bearer manual · verify_jwt | qualquer | period_start, period_end, period_label, salesperson_id | JSON {error} |
| `qbr-scheduler` | nenhuma detectada no handler · verify_jwt | qualquer | action | JSON {ok, schedules_updated, upcoming_qbrs, events_create… |

### Email (9)

| Function | Auth exigida | Método | Payload (campos principais) | Resposta |
|----------|--------------|--------|------------------------------|----------|
| `ai-email-composer` | JWT do usuário (RLS) · verify_jwt | qualquer | custom_instructions, mode, goal, tone, language, length, contact_context, recipient_id, recipient_type | JSON {error, subject, body, body_text, body_html} |
| `email-bulk-retry` | segredo interno (cron/service_role) + JWT do usuário (RLS) + papel admin/gestor · verify_jwt off | só POST | — | JSON |
| `email-bulk-send` | JWT do usuário · verify_jwt | qualquer | — | JSON {error, needsEmailSetup} |
| `email-composer-bulk` | JWT do usuário · verify_jwt | qualquer | sale_ids, tone, language, prompt | JSON {error, job_id} |
| `email-engagement-scorer` | nenhuma detectada no handler · verify_jwt | POST | sale_ids, recompute_all | JSON {ok} |
| `email-unsubscribe` | nenhuma detectada no handler · verify_jwt off | GET ou POST | query: e, t, r | HTML |
| `inbound-email-webhook` | assinatura do provedor · verify_jwt off | só POST | ts, contrato:inboundEmail, form-urlencoded/texto | JSON |
| `send-churn-alert-email` | JWT do usuário (RLS) + papel admin/gestor · verify_jwt | só POST | clientName, level, daysSince, salespersonName, test | JSON {ok, error} |
| `send-transactional-email` | segredo interno (cron/service_role) + JWT do usuário (RLS) + papel admin/gestor · verify_jwt | só POST | length, purpose, html, text, to, subject, status, errorCode, requestId, providerMessageId | JSON |

### Gamificação (11)

| Function | Auth exigida | Método | Payload (campos principais) | Resposta |
|----------|--------------|--------|------------------------------|----------|
| `account-engagement-aggregator` | nenhuma detectada no handler · verify_jwt | qualquer | account_ids, recompute_all | JSON {error, ok} |
| `broadcast-sale-notification` | JWT do usuário (RLS) · verify_jwt | qualquer | sale_id | JSON {error, success} |
| `challenge-expiration-alerts` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON |
| `collect-race-powerup` | JWT do usuário · verify_jwt | qualquer | powerup_id | JSON {error, ok} |
| `engagement-score-recompute` | nenhuma detectada no handler · verify_jwt | POST | — | JSON {ok} |
| `notify-ranking-position` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {sent, error} |
| `process-race-event` | JWT do usuário (RLS) · verify_jwt | qualquer | sale_id | JSON {error, ok} |
| `race-commentary` | nenhuma detectada no handler · verify_jwt | qualquer | leaderboard, roleType, seasonName, recentEvents, secondsToEnd, context | JSON {commentary, error, skipped, reason} |
| `ranking-api` | Bearer manual · verify_jwt | GET, POST, PUT | email, type, value, set_value, set_points, role | JSON {error, data, name, token_id} |
| `rotate-daily-challenges` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {message, challenges, error} |
| `start-race-season` | papel admin/gestor + JWT do usuário · verify_jwt | qualquer | name, start_date, end_date, goal_amount, track_type, role_type, scoring_rules | JSON {error, ok, cars_created, powerups_spawned, rules_cr… |

### IA / Forecast (26)

| Function | Auth exigida | Método | Payload (campos principais) | Resposta |
|----------|--------------|--------|------------------------------|----------|
| `ai-agent-orchestrator` | JWT do usuário · verify_jwt | qualquer | agent_type, target_entity_type, target_entity_id, goal, auto_execute | JSON {error, run_id} |
| `ai-copilot` | JWT do usuário · verify_jwt | qualquer | context, salespersonId, action, contrato:aiCopilot | JSON {error, contract_version, suggestion, disabled, fall… |
| `automation-suggestions` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {roi_metrics, total_runs_30d, success_rate_pct, avg_… |
| `coaching-intelligence` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {error} |
| `compute-forecast-accuracy` | JWT do usuário · verify_jwt | qualquer | — | JSON {error} |
| `demand-forecast` | nenhuma detectada no handler · verify_jwt | qualquer | supabaseServiceKey, product_id | JSON {success, generated_at, total_products, critical_ite… |
| `forecast-narrative` | JWT do usuário · verify_jwt | só POST | — | JSON {error, narrative} |
| `generate-revenue-forecast` | Bearer manual · verify_jwt | qualquer | period_type, period_start, owner_id | JSON {error} |
| `next-best-action` | nenhuma detectada no handler · verify_jwt | qualquer | limit | JSON {error} |
| `nlq-query` | JWT do usuário (RLS) · verify_jwt | só POST | question, conversation | JSON {error, answer, data, tool_calls, period, start} |
| `personal-assistant-stream` | JWT do usuário (RLS) · verify_jwt | qualquer | mode, salespersonId, message, conversationHistory, pipeThrough | SSE/stream {error} |
| `predict-quota-attainment` | nenhuma detectada no handler · verify_jwt | qualquer | quota, p50, salespersonName, prob, risk, forecastId, period, salesperson_id | JSON {predictions_count, error} |
| `predictive-intelligence` | nenhuma detectada no handler · verify_jwt | qualquer | horizon_days, include_ai | JSON {error} |
| `predictive-scoring-explain` | nenhuma detectada no handler · verify_jwt | qualquer | sale_id, sale_ids | JSON {error} |
| `pricing-intelligence` | nenhuma detectada no handler · verify_jwt | qualquer | query: days, threshold | JSON {threshold, kpis, total_revenue, deals_count, avg_ti… |
| `purchase-intelligence-forecast` | JWT do usuário (RLS) · verify_jwt | qualquer | — | JSON {error, ai_prediction, ai_error} |
| `revenue-forecast-ai` | nenhuma detectada no handler · verify_jwt | POST | owner_id, horizon_days, include_ai | JSON {horizon_days, metrics, total_open_pipeline, weighte… |
| `revenue-intelligence` | JWT do usuário (RLS) · verify_jwt | qualquer | query: horizon, dimension | JSON {error, horizon_days, forecast_rollup, coverage, ratio} |
| `sales-assistant-chat` | JWT do usuário (RLS) · verify_jwt | qualquer | message, salespersonId, conversationHistory, dealContext, aiAssistantName, salespersonName | SSE/stream {error} |
| `semantic-coverage` | JWT do usuário (RLS) · verify_jwt | qualquer | — | JSON {error, ok} |
| `semantic-index-entity` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {error, skipped, ok} |
| `semantic-reindex-batch` | papel admin/gestor + JWT do usuário · verify_jwt | qualquer | entity_types, only_missing, batch_size, concurrency | JSON {error, ok} |
| `semantic-search` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {error} |
| `semantic-search-universal` | JWT do usuário (RLS) · verify_jwt | qualquer | — | JSON {error} |
| `snapshot-forecast` | JWT do usuário · verify_jwt | qualquer | period_start, period_end, source | JSON {error, inserted} |
| `visual-search` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {error, results, count} |

### Integrações (6)

| Function | Auth exigida | Método | Payload (campos principais) | Resposta |
|----------|--------------|--------|------------------------------|----------|
| `bitrix24-oauth` | nenhuma detectada no handler · verify_jwt | qualquer | form-urlencoded/texto · query: code, action | HTML {success, connected, needsReauth, domain, error, mes… |
| `bitrix24-sync` | nenhuma detectada no handler · verify_jwt | qualquer | action, triggered_by | JSON {success, message, duration_ms, timestamp, error} |
| `dispatch-webhook` | JWT do usuário (RLS) + papel admin/gestor · verify_jwt | só POST | — | JSON {error, dispatched} |
| `external-db-bridge` | JWT do usuário · verify_jwt | qualquer | table, rpcName, columns, filters, data, limit, offset, countMode | JSON {error, data} |
| `helpdesk-sync` | nenhuma detectada no handler · verify_jwt | qualquer | provider, account_id | JSON {error, ok} |
| `test-integration-connection` | Bearer manual · verify_jwt | qualquer | — | SSE/stream {error, ok} |

### Leads / Roteamento (8)

| Function | Auth exigida | Método | Payload (campos principais) | Resposta |
|----------|--------------|--------|------------------------------|----------|
| `auto-reassign-inactive` | segredo interno (cron/service_role) · verify_jwt | só POST | — | JSON |
| `behavioral-analysis` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {error} |
| `check-lead-sla` | nenhuma detectada no handler · verify_jwt | qualquer | criticalHours, notifyEmail | JSON |
| `dialer-queue-builder` | JWT do usuário · verify_jwt | qualquer | queue_id, max_items | JSON {error, ok} |
| `enrich-lead` | JWT do usuário (RLS) · verify_jwt | só POST | — | JSON |
| `lead-scoring` | nenhuma detectada no handler · verify_jwt | qualquer | dealIds, contrato:leadScoring | JSON {error} |
| `onboarding-launcher` | nenhuma detectada no handler · verify_jwt | qualquer | account_id, template_key, owner_salesperson_id, action | JSON {ok, error} |
| `territory-optimization` | nenhuma detectada no handler · verify_jwt | qualquer | query: days | JSON {kpis, total_territories, healthy_count, underserved… |

### Multichannel / Push (4)

| Function | Auth exigida | Método | Payload (campos principais) | Resposta |
|----------|--------------|--------|------------------------------|----------|
| `multichannel-status-webhook` | assinatura do provedor · verify_jwt off | só POST | ts, entry, messageId, id, status, form-urlencoded/texto | JSON |
| `push-subscribe` | JWT do usuário · verify_jwt | qualquer | Deno, user_id, action | JSON |
| `send-multichannel-message` | segredo interno (cron/service_role) + JWT do usuário (RLS) + papel admin/gestor · verify_jwt | só POST | trim, length, enrollmentId, stepId, ownerId, channel, to, body, templateId | JSON |
| `send-push-notification` | JWT do usuário · verify_jwt | qualquer | supabaseServiceKey, title, body, icon, tag, data | JSON {error, success} |

### Ops / Outros (15)

| Function | Auth exigida | Método | Payload (campos principais) | Resposta |
|----------|--------------|--------|------------------------------|----------|
| `admin-conversion-trail` | Bearer manual · verify_jwt | só GET | query: quote_id, sale_id | JSON |
| `analyze-objection-handling` | JWT do usuário · verify_jwt | qualquer | recording_id | JSON {error} |
| `analyze-question-quality` | JWT do usuário · verify_jwt | qualquer | — | JSON {error, recording_id} |
| `analyze-sentiment-timeline` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {error} |
| `analyze-skill-gaps` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {assessments, error} |
| `calibrate-win-probabilities` | JWT do usuário (RLS) + papel admin/gestor · verify_jwt | só POST | — | JSON {error, ok, buckets_written, calibrations_written, g… |
| `calibrate-win-probability` | JWT do usuário (RLS) + papel admin/gestor · verify_jwt | só POST | lookback_days, min_sample | JSON {error, ok, calibrations_written, deal_scores_writte… |
| `create-stagnant-tasks` | nenhuma detectada no handler · verify_jwt | qualquer | — | JSON {message, tasksCreated, error} |
| `detect-competitor-mentions` | JWT do usuário · verify_jwt | qualquer | recording_id | JSON {error, mentions_count, competitors} |
| `detect-critical-moments` | JWT do usuário · verify_jwt | qualquer | — | JSON {error, recording_id} |
| `generate-urgent-client-tasks` | segredo interno (cron/service_role) + JWT do usuário (RLS) + papel admin/gestor · verify_jwt off | só POST | query: force | JSON |
| `notify-critical-pattern` | nenhuma detectada no handler · verify_jwt | qualquer | name, confidence, pattern_id | JSON {ok} |
| `run-retry-tests` | nenhuma detectada no handler · verify_jwt | qualquer | event | JSON {file, ran_at, total_duration_ms, total, error} |
| `simulate-load` | JWT do usuário · verify_jwt | qualquer | total, targetUrl | JSON {error, total, passed, failed, avgLatencyMs, maxLate… |
| `stress-test-contracts` | nenhuma detectada no handler · verify_jwt | qualquer | targetContract | JSON {error} |

### Reports / Export (6)

| Function | Auth exigida | Método | Payload (campos principais) | Resposta |
|----------|--------------|--------|------------------------------|----------|
| `generate-executive-briefing` | Bearer manual · verify_jwt | qualquer | headline, narrative, key_wins, key_risks, recommended_actions | JSON {error} |
| `report-builder-execute` | JWT do usuário · verify_jwt | qualquer | report_id, override_config, page, page_size | JSON {error, ok, rows, total, is_cross, viz_type} |
| `report-embed-public` | token de embed · verify_jwt | qualquer | query: token | JSON {error, ok, name, viz_type, generated_at} |
| `revops-hub` | nenhuma detectada no handler · verify_jwt | qualquer | query: horizon | JSON {horizon_days, kpis, total_pipeline, weighted_foreca… |
| `scheduled-report-trigger` | JWT do usuário · verify_jwt | qualquer | schedule_id | JSON {error, ok} |
| `scheduled-reports-runner` | nenhuma detectada no handler · verify_jwt | qualquer | schedule_id | JSON {ok, error} |

### Voz / Dialer (15)

| Function | Auth exigida | Método | Payload (campos principais) | Resposta |
|----------|--------------|--------|------------------------------|----------|
| `analyze-call` | JWT do usuário (RLS) · verify_jwt | qualquer | recording_id, transcript_text | JSON {error, success} |
| `analyze-conversation` | JWT do usuário · verify_jwt | qualquer | transcript, source, sale_id, client_id | JSON {error, success} |
| `analyze-conversation-metrics` | JWT do usuário · verify_jwt | qualquer | — | JSON {error, pace_score, engagement_score} |
| `check-v4-callback-alerts` | segredo interno (cron/service_role) · verify_jwt off | só POST | — | JSON {error, success} |
| `conversational-intelligence` | JWT do usuário · verify_jwt | qualquer | query: days | JSON {error, horizon_days, kpis, total_calls, analyzed_ca… |
| `diarize-call-recording` | JWT do usuário · verify_jwt | qualquer | — | JSON |
| `elevenlabs-stt` | JWT do usuário (RLS) · verify_jwt | qualquer | audio | JSON {error, message, text, language} |
| `elevenlabs-tts` | JWT do usuário (RLS) · verify_jwt | qualquer | text, voiceId | JSON {error, message, audioContent} |
| `elevenlabs-voice` | nenhuma detectada no handler · verify_jwt | qualquer | voiceId, action | JSON {error, message} |
| `process-call-recording-ingest` | segredo interno (cron/service_role) · verify_jwt off | só POST | — | JSON |
| `summarize-call-recording` | Bearer manual · verify_jwt | qualquer | recording_id, summary, action_items, decisions, objections, next_steps, key_topics, sentiment | JSON |
| `transcribe-call-recording` | JWT do usuário · verify_jwt | qualquer | — | JSON |
| `twilio-call-status` | assinatura do provedor · verify_jwt off | qualquer | ts, form-urlencoded/texto | JSON {error} |
| `twilio-call-twiml` | assinatura do provedor · verify_jwt off | GET | ts, form-urlencoded/texto · query: owner_id | TwiML/XML {error} |
| `twilio-click-to-call` | JWT do usuário · verify_jwt | qualquer | to_number, from_number, toString, sale_id, queue_item_id | JSON {error, message, ok} |

## Rotas do frontend

Rotas declaradas em `src/routes/AppRoutes.tsx`. `autenticado` = dentro de
`<ProtectedRoute>`; `admin`/`admin ou gestor` = guarda de papel adicional.

| Rota | Componente | Acesso |
|------|-----------|--------|
| `/auth` | Auth | pública |
| `/reset-password` | ResetPassword | pública |
| `/embed/report/:token` | EmbedReport | pública |
| `/race-arena/tv` | RaceArenaTV | autenticado |
| `/race-arena/spectator/:seasonId` | RaceSpectator | pública |
| `/*` | — | autenticado |
| `/` | — | autenticado |
| `/dashboard` | Index | autenticado |
| `/dashboard/:section` | Index | autenticado |
| `/dashboard/*` | NotFound | autenticado |
| `/sdr` | SDRDashboard | autenticado |
| `/closer` | CloserDashboard | autenticado |
| `/dashboard-custom` | DashboardCustom | autenticado |
| `/vendedor/:id` | VendedorDashboard | autenticado |
| `/docs` | Docs | autenticado |
| `/vendas` | Vendas | autenticado |
| `/clientes` | Clientes | autenticado |
| `/produtos` | Produtos | autenticado |
| `/pipeline` | Pipeline | autenticado |
| `/kanban-clientes` | KanbanClientes | autenticado |
| `/mapa-clientes` | MapaClientes | autenticado |
| `/calendario` | Calendario | autenticado |
| `/portfolio` | Portfolio | admin ou gestor |
| `/atividades` | Atividades | autenticado |
| `/cadencias` | Cadencias | autenticado |
| `/cadencias-orcamentos` | QuoteCadencias | autenticado |
| `/tarefas` | Tarefas | autenticado |
| `/icp` | ICP | admin ou gestor |
| `/fonte-leads` | FonteLeads | admin ou gestor |
| `/playbooks` | Playbooks | admin ou gestor |
| `/follow-up` | FollowUpInteligente | autenticado |
| `/follow-up/audit` | FollowUpAudit | admin ou gestor |
| `/sequences` | Sequences | autenticado |
| `/engagement/bulk-composer` | BulkComposer | autenticado |
| `/engagement/send-time` | SendTimeOptimization | autenticado |
| `/engagement/email-scoring` | EmailEngagementScoring | autenticado |
| `/engagement/abm` | AccountBasedEngagement | autenticado |
| `/engagement/abm/:accountId` | AccountDetail | autenticado |
| `/engagement/dialer` | PowerDialer | autenticado |
| `/lead-scoring` | LeadScoring | autenticado |
| `/multichannel` | Multichannel | autenticado |
| `/email-tracking` | EmailTracking | autenticado |
| `/automacoes` | Automacoes | autenticado |
| `/conversational-intelligence` | ConversationalIntelligence | autenticado |
| `/revenue-intelligence` | RevenueIntelligence | admin ou gestor |
| `/revenue-forecast` | RevenueForecast | admin ou gestor |
| `/revenue-forecast-v2` | RevenueForecastV2 | admin ou gestor |
| `/abm` | AccountBasedSelling | autenticado |
| `/workflow-builder` | AutomationBuilder | admin ou gestor |
| `/automacao-inteligente` | AutomacaoInteligente | admin ou gestor |
| `/coaching-inteligente` | CoachingInteligente | admin ou gestor |
| `/orcamentos` | Orcamentos | autenticado |
| `/assinatura-digital` | AssinaturaDigital | admin ou gestor |
| `/fornecedores` | Fornecedores | admin ou gestor |
| `/comparador-precos` | ComparadorPrecos | admin ou gestor |
| `/comissoes` | Comissoes | autenticado |
| `/agenda` | Agenda | autenticado |
| `/admin/comissoes` | AdminComissoes | admin ou gestor |
| `/admin/regras-comissao` | CommissionRules | admin ou gestor |
| `/admin/premiacoes` | AdminPremiacoes | admin ou gestor |
| `/admin/premiacoes/auditoria` | AdminAuditoriaPremiacoes | admin ou gestor |
| `/admin/fila-tarefas-automaticas` | AdminFilaTarefasAutomaticas | admin ou gestor |
| `/admin/regras-inatividade` | AdminRegrasInatividade | admin ou gestor |
| `/admin/alertas-churn` | AdminAlertasChurn | admin ou gestor |
| `/admin/alertas-churn/historico` | AdminHistoricoAlertasChurn | admin ou gestor |
| `/admin/supressao-emails` | AdminSupressaoEmails | admin ou gestor |
| `/minhas-premiacoes` | MinhasPremiacoes | autenticado |
| `/aprovacoes` | ApprovalWorkflows | autenticado |
| `/webhooks` | Webhooks | admin ou gestor |
| `/audit-logs` | AuditLogs | admin ou gestor |
| `/sla-tracking` | SLATracking | admin ou gestor |
| `/lead-routing` | LeadRouting | admin ou gestor |
| `/workflows` | Workflows | admin ou gestor |
| `/analytics` | Analytics | admin ou gestor |
| `/analytics/abc` | ABCAnalysisPage | admin ou gestor |
| `/analytics/closing-time` | ClosingTimePage | admin ou gestor |
| `/analytics/deal-velocity` | DealVelocityPage | admin ou gestor |
| `/analytics/evolution` | EvolutionCurvesPage | admin ou gestor |
| `/analytics/objections` | ObjectionsLibraryPage | admin ou gestor |
| `/analytics/win-loss` | WinLossAnalysisPage | admin ou gestor |
| `/relatorios` | Relatorios | admin ou gestor |
| `/bi-vendedor` | BIVendedor | autenticado |
| `/bi-sdr` | BISDR | autenticado |
| `/bi-closer` | BICloser | autenticado |
| `/bi-gestor` | BIGestor | admin ou gestor |
| `/relatorio-atividades` | RelatorioAtividades | admin ou gestor |
| `/relatorios-email` | RelatoriosEmail | autenticado |
| `/analytics/emails` | EmailAnalyticsPage | admin ou gestor |
| `/relatorios-executivos` | RelatoriosExecutivos | admin ou gestor |
| `/relatorios-agendados` | ScheduledReports | admin ou gestor |
| `/relatorios-custom` | CustomReports | autenticado |
| `/relatorios-custom/:id` | CustomReports | autenticado |
| `/roi` | ROIDashboard | admin ou gestor |
| `/forecast` | ForecastPonderado | admin ou gestor |
| `/previsao-demanda` | PrevisaoDemanda | admin ou gestor |
| `/inteligencia-preditiva` | InteligenciaPreditiva | autenticado |
| `/inteligencia-compras` | PurchaseIntelligence | autenticado |
| `/deal-intelligence` | DealIntelligence | autenticado |
| `/win-loss-intelligence` | WinLossIntelligence | autenticado |
| `/revops` | RevOpsHub | admin ou gestor |
| `/inteligencia` | Intelligence | autenticado |
| `/funil` | FunnelAnalysis | autenticado |
| `/ferramentas/bi` | BusinessIntelligencePage | admin ou gestor |
| `/relatorios/vendas` | SalesReportPage | autenticado |
| `/relatorios/funil` | FunnelReport | admin ou gestor |
| `/relatorios/cohort` | CohortReport | admin ou gestor |
| `/top-produtos` | TopProductsRanking | autenticado |
| `/evolucao-precos` | PriceEvolution | admin ou gestor |
| `/metricas-categoria` | CategoryMetrics | autenticado |
| `/benchmarking` | HistoricalBenchmark | autenticado |
| `/health-score` | ClientHealthScore | autenticado |
| `/customer-success` | CustomerSuccessHubPage | admin ou gestor |
| `/sales-enablement` | SalesEnablementHubPage | autenticado |
| `/pricing-intelligence` | PricingIntelligenceHubPage | admin ou gestor |
| `/territory-optimization` | TerritoryOptimizationHubPage | admin ou gestor |
| `/customer-success-360` | CustomerSuccess360Page | admin ou gestor |
| `/competencias` | Competencias | autenticado |
| `/ranking` | RankingCompetitivo | autenticado |
| `/gamificacao/badges` | BadgesGalleryPage | autenticado |
| `/perfil-gamer` | GamifiedProfilePage | autenticado |
| `/arena` | ArenaCompetitiva | autenticado |
| `/race-arena` | RaceTransitionWrapper | autenticado |
| `/race-arena/closer` | RaceTransitionWrapper | autenticado |
| `/race-arena/sdr` | RaceTransitionWrapper | autenticado |
| `/race-arena/garage` | RaceTransitionWrapper | autenticado |
| `/race-arena/career` | RaceTransitionWrapper | autenticado |
| `/admin/race-arena` | RaceArenaAdmin | admin |
| `/desafios` | DesafiosSemanais | autenticado |
| `/desafios-diarios` | HistoricoDesafiosDiarios | autenticado |
| `/victory-feed` | VictoryFeedPage | autenticado |
| `/competitive-seasons` | CompetitiveSeasonsAdmin | admin ou gestor |
| `/team-activity` | TeamActivityFeed | autenticado |
| `/vendedores` | Vendedores | admin ou gestor |
| `/metas` | Metas | admin ou gestor |
| `/metas-atividades` | MetasAtividades | autenticado |
| `/times` | Times | admin ou gestor |
| `/territorios` | Territorios | autenticado |
| `/estoque` | Estoque | admin ou gestor |
| `/nps` | NPSDashboard | autenticado |
| `/deduplicacao` | Deduplication | admin ou gestor |
| `/importar-exportar` | ImportExport | admin ou gestor |
| `/onboarding-tracking` | OnboardingTracking | autenticado |
| `/gatilhos-inatividade` | InactivityTriggers | admin ou gestor |
| `/bitrix24` | Bitrix24 | admin ou gestor |
| `/assistente` | Assistente | autenticado |
| `/meu-assistente` | MeuAssistente | autenticado |
| `/perguntar` | AskAnything | autenticado |
| `/busca-inteligente` | SmartSearch | autenticado |
| `/busca` | SemanticSearch | autenticado |
| `/agentes` | AIAgents | autenticado |
| `/notificacoes` | Notificacoes | autenticado |
| `/configuracoes` | Configuracoes | autenticado |
| `/admin` | AdminDashboard | admin |
| `/admin/conexoes` | AdminConexoesPage | admin |
| `/admin/v4-callbacks` | AdminV4CallbacksPage | admin |
| `/admin/quote-sync-inbound` | AdminQuoteSyncInboundPage | admin |
| `/admin/quote-conversions` | AdminQuoteConversionsPage | admin |
| `/admin/platform-slo` | AdminPlatformSLOPage | admin |
| `/admin/web-vitals` | AdminWebVitalsPage | admin |
| `/admin/telemetria` | AdminTelemetria | admin ou gestor |
| `/admin/comercial` | AdminComercial | admin ou gestor |
| `/usage-analytics` | UsageAnalytics | admin |
| `/feature-flags` | FeatureFlagsAdmin | admin |
| `/seguranca` | SecurityDashboard | admin |
| `/admin/tarefas` | AdminTasksPage | admin |
| `/admin/webhooks-dead-letters` | WebhooksDeadLettersAdmin | admin |
| `/admin/webhooks-timeline` | WebhookTimelinePage | admin |
| `/admin/webhooks-alert-history` | WebhookAlertHistoryPage | admin |
| `/admin/webhooks-alert-settings` | WebhookAlertSettingsPage | admin |
| `/admin/retry-test-status` | RetryTestStatusPage | admin |
| `/meus-pedidos/:id` | OrderDetailPage | autenticado |
| `/acompanhamento-pedidos` | AcompanhamentoPedidos | autenticado |
| `/acompanhamento-pedidos/:id` | AcompanhamentoPedidoDetalhe | autenticado |
| `/acesso-negado` | AccessDenied | autenticado |
| `*` | NotFound | autenticado |

## RPCs (Postgres functions)

Functions SQL criadas nas migrations. "Uso no front" = chamada `.rpc()`
encontrada em `src/`; EXECUTE grants conforme `GRANT EXECUTE` nas migrations.

| RPC | Última definição | Grants | Uso no front |
|-----|------------------|--------|--------------|
| `add_league_weekly_xp` | 20260412115439_2c138808-113d-4264-aa0d-82a9a94875fa.sql | authenticated, service_role | — |
| `add_salesperson_xp` | 20260412115439_2c138808-113d-4264-aa0d-82a9a94875fa.sql | — | — |
| `admin_capture_rollback_snapshot` | 20260712215611_39d586d5-863d-4617-903b-cbfcc9f544a7.sql | service_role | — |
| `admin_get_cron_job_stats` | 20260712213630_85d48e51-71fa-4a2f-8161-ece309fe0345.sql | authenticated, service_role | 1 arquivo(s) |
| `admin_get_rollback_rate_series` | 20260712215611_39d586d5-863d-4617-903b-cbfcc9f544a7.sql | authenticated, service_role | 1 arquivo(s) |
| `admin_reset_query_stats` | 20260712220239_7d875e88-07c9-45c0-a739-7cc51a5dce4a.sql | authenticated | 1 arquivo(s) |
| `admin_top_queries` | 20260712220239_7d875e88-07c9-45c0-a739-7cc51a5dce4a.sql | authenticated | 1 arquivo(s) |
| `aggregate_sales_stats` | 20260105000005_stored_procedures.sql | — | — |
| `append_agent_step` | 20260417150930_73c2611e-f064-4b26-94d2-c4095e49076d.sql | — | — |
| `approve_agent_run` | 20260417150930_73c2611e-f064-4b26-94d2-c4095e49076d.sql | — | 1 arquivo(s) |
| `archive_old_activities` | 20260104181000_stored_procedures_additional.sql | — | — |
| `archive_old_data` | 20260104170152_stored_procedures.sql | — | — |
| `assign_cadence_variant` | 20260416195006_fefd2801-b414-41e2-842c-1914a9fdb276.sql | — | — |
| `assign_task_to_squad` | 20260418151200_f3721bce-9ab4-4188-aacd-524d2fbc3ffe.sql | — | 1 arquivo(s) |
| `audit_activity_changes` | 20260509184206_ce500ccc-d327-4234-abad-200a7a136bac.sql | — | — |
| `audit_trigger` | 20260104200100_audit_trail_complete.sql | — | — |
| `audit_trigger_func` | 20260814210000_fix_clients_update_triggers.sql | — | — |
| `auto_add_client_to_portfolio` | 20260706160605_b3261767-3d5c-4a1e-9f5a-f5a5847ecc3d.sql | service_role | — |
| `auto_assign_lead` | 20260830000002_harden_lead_routing.sql | authenticated, service_role | 1 arquivo(s) |
| `auto_create_commission` | 20260512174142_73f7e0f7-d80e-4c9f-8493-97027a0d9672.sql | — | — |
| `auto_create_sale_followup` | 20260509162507_90a60455-df25-4ebc-844e-d47c5dc02cdf.sql | — | — |
| `auto_enroll_in_cadence` | 20260513192406_ef2d75ae-77a0-44d8-be60-b4f1a6aba82b.sql | — | — |
| `auto_enroll_quote_cadence` | 20260420123930_76e7578c-8365-49dc-84a7-448a1307ab4f.sql | — | — |
| `auto_link_sale_to_account` | 20260417174827_5d14e75f-67d1-4c4d-b663-cac1ab830b39.sql | — | — |
| `auto_pause_cadence_on_response` | 20260416194617_15964d76-f47d-46e4-8278-553b2a12f680.sql | — | — |
| `auto_pause_enrollment` | 20260417110613_75829d1b-cd98-4ce9-b51b-2c0ba819bf43.sql | — | — |
| `auto_promote_sequence_winners` | 20260417171744_c2d3563b-ba1c-4e4a-92ca-dc21d1729a3c.sql | authenticated | — |
| `auto_set_forecast_category` | 20260416231940_a82b593c-b778-454c-b3ac-97ab40286cfd.sql | — | — |
| `auto_victory_post` | 20260814190000_fix_broken_sales_triggers.sql | — | — |
| `award_achievement_if_not_exists` | 20260513192607_6ac577a4-6ab2-4c3e-b5c7-656f81de14b1.sql | — | — |
| `award_bonus_if_eligible` | 20260723131706_70222a42-2805-40d7-946a-96b83c9d2b91.sql | authenticated | 1 arquivo(s) |
| `award_salesperson_xp` | 20260517112315_9fb13796-481a-460c-81d5-e8cc5bcf713f.sql | — | 1 arquivo(s) |
| `award_xp_on_quote_approved_via_cadence` | 20260420164159_cf92ebaa-ec97-47bc-8050-148172459663.sql | — | — |
| `award_xp_on_quote_cadence_task_complete` | 20260420164159_cf92ebaa-ec97-47bc-8050-148172459663.sql | — | — |
| `backfill_orders_conversion_seq` | 20260708134149_43dd5c32-2363-4663-8718-3469140ad8fd.sql | service_role | — |
| `broadcast_sale_completed` | 20260512214007_64196e26-e33f-4899-987f-ca2db55743f7.sql | — | — |
| `bulk_approve_assignments` | 20260418151200_f3721bce-9ab4-4188-aacd-524d2fbc3ffe.sql | — | 1 arquivo(s) |
| `bulk_recompute_engagement` | 20260417105640_f90fe72d-ce4d-4999-9ab0-239b02795e32.sql | — | — |
| `bulk_update_deal_stages` | 20260104181000_stored_procedures_additional.sql | — | — |
| `calculate_account_score` | 20260416195950_1a2c27e7-aa6b-4149-8cfa-9fe6cf894af3.sql | — | 1 arquivo(s) |
| `calculate_asset_efficiency` | 20260513192524_0d483376-feda-4a3b-8407-4904a6a0b6d1.sql | — | 1 arquivo(s) |
| `calculate_daily_challenge_streak` | 20251220142553_58df5395-4e0a-4a82-83ea-f398f8977013.sql | — | 1 arquivo(s) |
| `calculate_deal_health` | 20260416195725_4d7ca4a9-1812-4b95-83ca-d216d7fc129c.sql | — | 1 arquivo(s) |
| `calculate_deal_health_score` | 20260104181000_stored_procedures_additional.sql | — | — |
| `calculate_deal_probability` | 20260105000005_stored_procedures.sql | — | — |
| `calculate_deal_risk_score` | 20260513194322_de774cc9-8b6f-4814-9c4e-3f80fbffaadb.sql | — | — |
| `calculate_lead_distribution` | 20260513192039_fd28a7be-6453-4c57-8641-e230e85db2f5.sql | — | — |
| `calculate_performance_pace` | 20260511192130_c4275dc5-b910-48d1-b4ac-77964f83aaee.sql | — | — |
| `calculate_source_roi` | 20260513192406_ef2d75ae-77a0-44d8-be60-b4f1a6aba82b.sql | — | — |
| `calculate_team_performance` | 20260104181000_stored_procedures_additional.sql | — | — |
| `check_2fa_failed_attempts` | 20260831130000_harden_public_access_and_privileged_rpcs.sql | authenticated, service_role | — |
| `check_battle_achievements` | 20260619145322_df537bec-72b5-4e50-8778-17637a1e009d.sql | — | — |
| `check_failed_attempts` | 20260104183000_security_enhancements.sql | — | — |
| `check_is_first_activation` | 20260517141803_59e85b61-a7ba-42e9-ace3-190cf721e280.sql | — | — |
| `check_is_first_sale` | 20260517132342_8859b5fc-de51-484f-ada7-1992f48a62c7.sql | — | — |
| `check_performance_bets_completion` | 20260512184157_4fb6807e-164e-43ef-92ea-00266e437054.sql | — | — |
| `check_price_threats` | 20260513192039_fd28a7be-6453-4c57-8641-e230e85db2f5.sql | — | — |
| `check_quote_expirations` | 20260513192406_ef2d75ae-77a0-44d8-be60-b4f1a6aba82b.sql | — | — |
| `check_rate_limit` | 20251231120039_b2152855-d5fa-4fa1-8557-b2884e44108d.sql | — | 1 arquivo(s) |
| `check_sla_violations` | 20260416181418_6d978eeb-e572-497a-be87-f6935ebd7af2.sql | — | 1 arquivo(s) |
| `claim_pending_cadence_tasks` | 20260718000003_add_claim_pending_cadence_tasks.sql | service_role | — |
| `cleanup_deleted_records` | 20260104210000_soft_delete_enhanced.sql | — | — |
| `cleanup_expired_narrative_cache` | 20260712222949_56531d44-d326-4545-84ff-2aafdde2d2a3.sql | service_role | — |
| `cleanup_old_audit_logs` | 20260105000002_audit_trail.sql | — | — |
| `cleanup_old_records` | 20260105000005_stored_procedures.sql | — | — |
| `coaching_progress_by_salesperson` | 20260417193918_df10455e-4b6a-486a-8fcc-3ebc3d43dccf.sql | — | 1 arquivo(s) |
| `complete_agent_run` | 20260417150930_73c2611e-f064-4b26-94d2-c4095e49076d.sql | — | — |
| `complete_call_recording_ingest_job` | 20260712230117_598d71a5-beaa-46b3-876a-df1bde70d0f7.sql | service_role | — |
| `compute_cohort_retention` | 20260416234424_66fbe1df-5677-4a6c-bea6-daf700e06009.sql | authenticated | — |
| `compute_customer_health_v2` | 20260416232618_f6dcab79-5212-4086-b46f-7ff5f3532a80.sql | — | — |
| `compute_forecast_rollup` | 20260416231940_a82b593c-b778-454c-b3ac-97ab40286cfd.sql | — | — |
| `compute_optimal_send_time` | 20260417011542_fc8fac96-2267-42a9-83f9-fde79549238b.sql | authenticated, service_role | — |
| `compute_pipeline_inspection` | 20260416231940_a82b593c-b778-454c-b3ac-97ab40286cfd.sql | — | 1 arquivo(s) |
| `compute_salesperson_retention_cohort` | 20260712222235_9e62e6db-2673-42b4-bdef-a2022108b162.sql | authenticated, service_role | 1 arquivo(s) |
| `compute_scheduled_report_next_run` | 20260417000949_a89d07df-24c2-4acf-9877-e041ba2414ef.sql | — | — |
| `convert_quote_to_order` | 20260718000005_fix_trg_convert_quote_to_order_guard.sql | service_role | — |
| `count_failed_login_attempts` | 20251231120039_b2152855-d5fa-4fa1-8557-b2884e44108d.sql | — | — |
| `count_reset_requests_24h` | 20251231131342_a0f87441-d86b-49d8-a197-f97973da46fc.sql | — | — |
| `create_activities_from_action_items` | 20260417122626_dc9224cc-f218-47fe-8306-93dcad7150f4.sql | — | 1 arquivo(s) |
| `create_agent_run` | 20260417150930_73c2611e-f064-4b26-94d2-c4095e49076d.sql | — | — |
| `create_version` | 20250102_versioning.sql | — | — |
| `declare_step_winner` | 20260417004724_5b69c678-9bcb-4757-afa3-c7f08a0bd49c.sql | — | 1 arquivo(s) |
| `dequeue_call_recording_ingest_jobs` | 20260712230117_598d71a5-beaa-46b3-876a-df1bde70d0f7.sql | service_role | — |
| `detect_renewal_risks` | 20260416232618_f6dcab79-5212-4086-b46f-7ff5f3532a80.sql | — | — |
| `detect_slow_queries` | 20260831130001_repair_cron_and_fk_indexes.sql | service_role | — |
| `detect_stalled_cron_jobs` | 20260831130001_repair_cron_and_fk_indexes.sql | service_role | — |
| `disable_sms` | 20260321195552_1a939365-b697-4a37-870b-c118281c25b2.sql | — | 1 arquivo(s) |
| `disable_totp` | 20260321195552_1a939365-b697-4a37-870b-c118281c25b2.sql | — | 1 arquivo(s) |
| `enforce_telemetry_retention` | 20260712213509_3b994669-1c3f-47ef-90fa-a5e71a1093b2.sql | service_role | — |
| `enqueue_v4_callback` | 20260706160203_849fd5c0-44df-47ae-8fe5-96a9dddd27e7.sql | service_role | — |
| `enrich_lead_data` | 20260513192406_ef2d75ae-77a0-44d8-be60-b4f1a6aba82b.sql | — | — |
| `enroll_quote_in_cadence` | 20260420172423_b783d097-77a3-471f-a38a-52570de26911.sql | — | 1 arquivo(s) |
| `ensure_single_default_filter` | 20260106183941_1d5b39a6-d3ee-48cb-9840-c9a068f5d84b.sql | — | — |
| `extensions` | 20251228_move_extensions_to_schema.sql | — | — |
| `finalize_race_season` | 20260418162310_4e1bd709-f02a-48bd-a65e-c9a4f0036498.sql | authenticated | 1 arquivo(s) |
| `find_matching_cadence_rule` | 20260416194432_c11a9419-4322-4cbb-a68e-c82a354b1440.sql | — | — |
| `fn_admin_cleanup_stale_logs` | 20260711153757_a957a586-25a5-45a6-8ace-6f4e9f859d0f.sql | authenticated | — |
| `fn_admin_conversion_trail` | 20260711151406_fd14194a-1b24-422f-bd8a-c274b1fe60e6.sql | authenticated, service_role | — |
| `fn_admin_cron_alert_breakdown` | 20260712231828_3451b85e-69b0-47db-89dd-b2e9e05519ee.sql | authenticated, service_role | 1 arquivo(s) |
| `fn_admin_cron_alert_metrics` | 20260712231310_b4d39c3c-b39d-45f4-a1f5-ae4cb06587aa.sql | authenticated, service_role | 1 arquivo(s) |
| `fn_admin_get_new_cron_failures` | 20260712231501_204c3ba6-97ac-4159-9d75-4785991db844.sql | service_role | — |
| `fn_admin_list_dead_letter_ingest_jobs` | 20260712231649_1cc215fd-80c1-4e9e-badb-b88ef75c6317.sql | authenticated, service_role | 1 arquivo(s) |
| `fn_admin_mark_cron_failure_alerted` | 20260712214818_6474e22f-a332-4b40-928d-0e4b1c15ea6d.sql | service_role | — |
| `fn_admin_platform_slo` | 20260711145130_b2c8eda9-8da9-46fe-aefe-3b950fa412d1.sql | authenticated | 1 arquivo(s) |
| `fn_admin_replay_dead_letter_ingest_job` | 20260712232718_6cfc1884-5c14-4d44-b3b3-ba91edde064a.sql | authenticated, service_role | 1 arquivo(s) |
| `fn_admin_reset_circuit` | 20260711153757_a957a586-25a5-45a6-8ace-6f4e9f859d0f.sql | authenticated | — |
| `fn_admin_security_definer_exposure` | 20260711134320_f46c46d9-295a-4e9e-a0da-ca57174d135d.sql | authenticated, service_role | — |
| `fn_admin_wal_health` | 20260711134320_f46c46d9-295a-4e9e-a0da-ca57174d135d.sql | authenticated, service_role | — |
| `fn_admin_web_vitals_p75` | 20260711153757_a957a586-25a5-45a6-8ace-6f4e9f859d0f.sql | authenticated | 1 arquivo(s) |
| `fn_auto_map_inbound_seller` | 20260707102536_6fc73674-9a8f-4a4d-93a5-98d8e1e9ca36.sql | service_role | — |
| `fn_backfill_orders_conversion_seq` | 20260708134842_fd3e5f78-b315-4078-8bb1-315778671975.sql | authenticated, service_role | — |
| `fn_calculate_icp_score` | 20260511203112_2dd0b918-e14b-411d-bfd7-1c4018d0432d.sql | — | — |
| `fn_cleanup_stale_logs` | 20260711153757_a957a586-25a5-45a6-8ace-6f4e9f859d0f.sql | service_role | — |
| `fn_cleanup_webhook_dedupe` | 20260707112143_36a63a51-b9c2-4922-a4c8-0ebfa1dbfba3.sql | service_role | — |
| `fn_convert_quote_to_sale` | 20260710142606_502f6e24-0b43-463f-9cc3-202ff44796a6.sql | authenticated, service_role | — |
| `fn_cron_expected_interval` | 20260715184427_8e4ec70a-caf2-4a8d-9042-e26e29fa3a54.sql | anon, authenticated, service_role | — |
| `fn_cron_stalled_threshold` | 20260715184427_8e4ec70a-caf2-4a8d-9042-e26e29fa3a54.sql | anon, authenticated, service_role | — |
| `fn_gc_call_recording_ingest_jobs` | 20260712232346_aec818ed-0486-4b47-8528-f607bf2d2811.sql | service_role | — |
| `fn_get_orders_conversion_seq_last` | 20260708134842_fd3e5f78-b315-4078-8bb1-315778671975.sql | authenticated, service_role | — |
| `fn_list_cron_jobs` | 20260707114840_4586855c-9d65-4288-9eee-e06b1b311446.sql | authenticated, service_role | — |
| `fn_normalize_quotes_inbound` | 20260707102536_6fc73674-9a8f-4a4d-93a5-98d8e1e9ca36.sql | — | — |
| `fn_notify_victory` | 20260814190000_fix_broken_sales_triggers.sql | — | — |
| `fn_purge_rollback_snapshots` | 20260712215611_39d586d5-863d-4617-903b-cbfcc9f544a7.sql | service_role | — |
| `fn_record_conversion_attempt` | 20260711151406_fd14194a-1b24-422f-bd8a-c274b1fe60e6.sql | authenticated, service_role | — |
| `fn_test_backdate_cron_alert` | 20260712230734_420fceb1-d58c-42bb-bf6e-5b61c50d6020.sql | anon, authenticated, service_role | — |
| `fn_test_cleanup_cron_alerts` | 20260712230734_420fceb1-d58c-42bb-bf6e-5b61c50d6020.sql | anon, authenticated, service_role | — |
| `fn_test_cleanup_dedupe_privileges` | 20260707112143_36a63a51-b9c2-4922-a4c8-0ebfa1dbfba3.sql | anon, authenticated, service_role | — |
| `fn_test_mark_cron_failure` | 20260712230906_1031d7dd-3d6d-4eca-9312-36fdb4432c9b.sql | anon, authenticated, service_role | — |
| `fn_test_simulate_stalled_check` | 20260712230734_420fceb1-d58c-42bb-bf6e-5b61c50d6020.sql | anon, authenticated, service_role | — |
| `generate_api_token` | 20260330135126_2e3c42f1-5cc7-4566-8e0b-2196a312249f.sql | — | 1 arquivo(s) |
| `generate_cadence_tasks` | 20260513192524_0d483376-feda-4a3b-8407-4904a6a0b6d1.sql | — | — |
| `generate_device_fingerprint` | 20251231121413_c4826621-81ba-45f1-86f9-092fac5d9ee4.sql | — | — |
| `generate_mfa_backup_codes` | 20251231120846_562120aa-f001-412e-8054-805485a4cfb6.sql | — | — |
| `generate_sales_forecast` | 20260104181000_stored_procedures_additional.sql | — | — |
| `get_ab_test_results` | 20260416195006_fefd2801-b414-41e2-842c-1914a9fdb276.sql | — | 1 arquivo(s) |
| `get_account_engagement_summary` | 20260417174827_5d14e75f-67d1-4c4d-b663-cac1ab830b39.sql | — | 1 arquivo(s) |
| `get_active_salespeople` | 20260317232651_91700624-5f5f-49e4-b7fb-32b621dd1b10.sql | — | 7 arquivo(s) |
| `get_auto_paused_count` | 20260416194617_15964d76-f47d-46e4-8278-553b2a12f680.sql | — | 1 arquivo(s) |
| `get_bulk_job_summary` | 20260417172401_58a897ab-98e9-45fb-a275-94c9112b6be4.sql | authenticated | — |
| `get_cadence_metrics` | 20260416194718_556dc61c-9560-41ad-950e-ac7823601ae2.sql | — | 1 arquivo(s) |
| `get_campaign_delivery_stats` | 20260726201829_a1a4c133-a273-49ce-90de-29793d0be153.sql | authenticated, service_role | 1 arquivo(s) |
| `get_campaign_optout_rates` | 20260726201605_3607fd5d-02c0-4cd5-954f-0934fc3b2dbe.sql | authenticated, service_role | 1 arquivo(s) |
| `get_campaign_recovery_rates` | 20260802150910_dbc250ba-8d86-47fb-8b72-f7ce31d58576.sql | authenticated, service_role | 1 arquivo(s) |
| `get_client_purchase_heatmap` | 20260417195120_e6042ca1-c9ed-4411-ad92-08f88fff9a24.sql | authenticated | 1 arquivo(s) |
| `get_client_seasonality` | 20260524194411_8e8af783-c606-4d73-9c4f-d79d5bfa277b.sql | authenticated, service_role | 3 arquivo(s) |
| `get_client_top_products` | 20260524194411_8e8af783-c606-4d73-9c4f-d79d5bfa277b.sql | — | 2 arquivo(s) |
| `get_current_salesperson_id` | 20251214025653_0cf4785a-e064-43d9-9147-8030f118c23c.sql | anon, authenticated | 4 arquivo(s) |
| `get_current_user_email` | 20251214203613_0747efdb-aa79-4b67-96d1-43465422df9a.sql | — | — |
| `get_dashboard_kpis` | 20260627185517_2ad2ea8a-25bf-4972-a0fe-c533b2571a13.sql | authenticated, service_role | 4 arquivo(s) |
| `get_deleted_records` | 20260831130000_harden_public_access_and_privileged_rpcs.sql | authenticated, service_role | — |
| `get_detailed_kpis` | 20260522142405_6778f36e-85b5-459c-86da-b477c1f1e694.sql | — | 1 arquivo(s) |
| `get_dialer_queue_stats` | 20260417181059_373308ac-cd9e-4c9f-b695-1c5b3ba6d799.sql | — | 1 arquivo(s) |
| `get_embedded_report_by_token` | 20260416234424_66fbe1df-5677-4a6c-bea6-daf700e06009.sql | anon, authenticated | — |
| `get_engagement_leaderboard` | 20260417174122_6ffab81c-1745-49c8-9551-aa285faf02f3.sql | — | 1 arquivo(s) |
| `get_global_send_time_stats` | 20260417173508_8c5e3567-b605-4680-883e-e4e336d4b305.sql | authenticated, service_role | 1 arquivo(s) |
| `get_historical_benchmark` | 20260512184319_c82514dd-ce87-4dce-8921-916ef258a7a5.sql | — | — |
| `get_industry_benchmark_stats` | 20260524194411_8e8af783-c606-4d73-9c4f-d79d5bfa277b.sql | authenticated, service_role | 2 arquivo(s) |
| `get_industry_seasonality` | 20260524194411_8e8af783-c606-4d73-9c4f-d79d5bfa277b.sql | authenticated, service_role | 2 arquivo(s) |
| `get_industry_top_products` | 20260524194411_8e8af783-c606-4d73-9c4f-d79d5bfa277b.sql | authenticated, service_role | 2 arquivo(s) |
| `get_login_lockout_status` | 20260831130000_harden_public_access_and_privileged_rpcs.sql | anon, authenticated, service_role | 1 arquivo(s) |
| `get_mfa_status` | 20260317232412_85638406-bf3a-4459-a8ec-0950531a5b6d.sql | — | 1 arquivo(s) |
| `get_monthly_sales_benchmark` | 20260512175631_b0636deb-fb97-49da-b54e-82c70bafd65f.sql | — | 1 arquivo(s) |
| `get_purchase_intelligence_summary` | 20260417195120_e6042ca1-c9ed-4411-ad92-08f88fff9a24.sql | authenticated | 1 arquivo(s) |
| `get_recovery_by_failure_type` | 20260802150910_dbc250ba-8d86-47fb-8b72-f7ce31d58576.sql | authenticated, service_role | 1 arquivo(s) |
| `get_revenue_forecast` | 20260416195725_4d7ca4a9-1812-4b95-83ca-d216d7fc129c.sql | — | 1 arquivo(s) |
| `get_score_trend` | 20260417163016_10247063-3375-460e-b955-9678367cde57.sql | — | 1 arquivo(s) |
| `get_semantic_coverage` | 20260417155732_08d9a90e-f30b-4744-8c96-8f455d1b5a03.sql | authenticated | — |
| `get_top_accounts` | 20260417174827_5d14e75f-67d1-4c4d-b663-cac1ab830b39.sql | — | 1 arquivo(s) |
| `get_user_permissions` | 20251231125636_26067a0b-d8f7-4c1e-9081-28906716994d.sql | — | — |
| `get_user_role` | 20251214103344_640296e4-5119-4bf4-aefe-f0749de6003f.sql | — | — |
| `grant_task_xp` | 20260418150311_9352a6b4-c8a3-4503-a0ff-c3fc0f22d8f3.sql | — | 1 arquivo(s) |
| `grants` | 20260722112916_c7c2c805-f441-4f27-995c-8c0dada0b675.sql | — | — |
| `handle_audit_logging` | 20260511142015_6c8cb361-ec2c-4387-9718-d90205a9fb1b.sql | — | — |
| `handle_client_activation` | 20260517164212_34ed2f20-28ad-4b7b-8602-d1aa2b9aa499.sql | — | — |
| `handle_client_ltv_update` | 20260509162507_90a60455-df25-4ebc-844e-d47c5dc02cdf.sql | — | — |
| `handle_new_user_role` | 20251214103344_640296e4-5119-4bf4-aefe-f0749de6003f.sql | — | — |
| `handle_performance_update` | 20260512191103_395a3146-26cb-43f1-904d-59fa4d441723.sql | — | — |
| `handle_sale_commissions` | 20260517141803_59e85b61-a7ba-42e9-ace3-190cf721e280.sql | — | — |
| `handle_stock_management` | 20260509162507_90a60455-df25-4ebc-844e-d47c5dc02cdf.sql | — | — |
| `handle_stock_on_sale` | 20260513192039_fd28a7be-6453-4c57-8641-e230e85db2f5.sql | — | — |
| `handle_template_versioning` | 20260513192524_0d483376-feda-4a3b-8407-4904a6a0b6d1.sql | — | — |
| `handle_territory_conquest` | 20260512191103_395a3146-26cb-43f1-904d-59fa4d441723.sql | — | — |
| `handle_updated_at` | 20260519114051_b744fae6-d3fd-45c5-9f94-6032cff12b8e.sql | — | — |
| `hard_delete_record` | 20260831130000_harden_public_access_and_privileged_rpcs.sql | authenticated, service_role | — |
| `harden_function` | 20260514211202_a6925846-148b-41a2-a354-f5391d6c5051.sql | — | — |
| `has_pending_reset_request` | 20251231131342_a0f87441-d86b-49d8-a197-f97973da46fc.sql | — | — |
| `has_permission` | 20251231125636_26067a0b-d8f7-4c1e-9081-28906716994d.sql | — | — |
| `has_role` | 20251214103344_640296e4-5119-4bf4-aefe-f0749de6003f.sql | authenticated | — |
| `increment_asset_view_count` | 20260416215425_1ba06426-5891-47eb-bac8-3f8aea6119f4.sql | — | — |
| `increment_combo` | 20260412115439_2c138808-113d-4264-aa0d-82a9a94875fa.sql | authenticated, service_role | — |
| `increment_goal_progress` | 20260412115439_2c138808-113d-4264-aa0d-82a9a94875fa.sql | authenticated, service_role | — |
| `increment_race_car_overtakes` | 20260418105237_c858c8c8-9022-4de0-8bc3-07202890cc53.sql | service_role | — |
| `increment_race_car_wins` | 20260418105237_c858c8c8-9022-4de0-8bc3-07202890cc53.sql | service_role | — |
| `increment_sales_streak` | 20260412115439_2c138808-113d-4264-aa0d-82a9a94875fa.sql | — | — |
| `increment_v4_callback_metric` | 20260706163053_2452df1f-1769-439c-87fd-46103e8bedbc.sql | service_role | — |
| `initialize_totp` | 20260321195552_1a939365-b697-4a37-870b-c118281c25b2.sql | — | 1 arquivo(s) |
| `is_admin_or_manager` | 20260517123736_d4d7b1c2-f841-4a67-9670-508437764896.sql | anon, authenticated | — |
| `is_authenticated` | 20251214025653_0cf4785a-e064-43d9-9147-8030f118c23c.sql | — | — |
| `is_email_opted_out` | 20260726200015_4da82c03-38f9-4478-b6f8-5ba0e25d9cbe.sql | authenticated, service_role | — |
| `is_ip_blocked` | 20251231120039_b2152855-d5fa-4fa1-8557-b2884e44108d.sql | — | 1 arquivo(s) |
| `is_ip_whitelisted` | 20251231120039_b2152855-d5fa-4fa1-8557-b2884e44108d.sql | — | 1 arquivo(s) |
| `is_known_device` | 20251231121413_c4826621-81ba-45f1-86f9-092fac5d9ee4.sql | — | — |
| `is_mfa_enabled` | 20251231120846_562120aa-f001-412e-8054-805485a4cfb6.sql | — | — |
| `log_audit` | 20250102_audit_log.sql | — | — |
| `log_audit_event` | 20260416181124_7ac5204a-43b3-4cdc-aa9e-70b44426c96b.sql | postgres, service_role | 1 arquivo(s) |
| `log_data_access` | 20260104183000_security_enhancements.sql | — | — |
| `log_lead_stage_transition` | 20260513192607_6ac577a4-6ab2-4c3e-b5c7-656f81de14b1.sql | — | — |
| `log_order_creation` | 20260422151947_37e13489-51d3-4414-8a2d-9f0b34c481b0.sql | — | — |
| `log_order_status_change` | 20260422151947_37e13489-51d3-4414-8a2d-9f0b34c481b0.sql | — | — |
| `log_rate_limit` | 20251231120039_b2152855-d5fa-4fa1-8557-b2884e44108d.sql | — | 1 arquivo(s) |
| `log_security_event` | 20260831130000_harden_public_access_and_privileged_rpcs.sql | authenticated, service_role | — |
| `log_soft_delete` | 20251228_add_soft_delete.sql | — | — |
| `maintain_sales_streaks` | 20260815110000_fix_maintain_sales_streaks.sql | — | — |
| `manage_stock_on_sale` | 20260513192406_ef2d75ae-77a0-44d8-be60-b4f1a6aba82b.sql | — | — |
| `manual_xp_adjustment` | 20260418150311_9352a6b4-c8a3-4503-a0ff-c3fc0f22d8f3.sql | — | 1 arquivo(s) |
| `mark_all_notifications_read` | 20260416204457_1d50cec8-6696-4792-9bd7-9c8aec65f8b2.sql | — | 1 arquivo(s) |
| `mark_entity_for_reindex` | 20260417155732_08d9a90e-f30b-4744-8c96-8f455d1b5a03.sql | authenticated | — |
| `match_reply_to_enrollment` | 20260417110613_75829d1b-cd98-4ce9-b51b-2c0ba819bf43.sql | — | — |
| `match_semantic` | 20260417123624_68ec9996-f000-46cf-958d-418554185750.sql | — | — |
| `match_weekly_players` | 20260831130001_repair_cron_and_fk_indexes.sql | service_role | — |
| `merge_clients` | 20260513143248_93b16c35-2f21-4554-bfe6-699f703512ee.sql | — | 1 arquivo(s) |
| `next_dialer_item` | 20260417181059_373308ac-cd9e-4c9f-b695-1c5b3ba6d799.sql | — | 1 arquivo(s) |
| `normalize_bulk_failure_reason` | 20260802150910_dbc250ba-8d86-47fb-8b72-f7ce31d58576.sql | — | — |
| `notify_asset_ai_status` | 20260513192607_6ac577a4-6ab2-4c3e-b5c7-656f81de14b1.sql | — | — |
| `notify_asset_influence_boost` | 20260511193055_5e3b9a97-97de-4f2d-af49-4b5fc1d4672c.sql | — | — |
| `notify_critical_moment_created` | 20260417202813_6803938d-e003-42c1-8b38-f8515132e8f5.sql | — | — |
| `notify_critical_winloss_pattern` | 20260420210849_5e5fd280-33bb-4015-9d44-9aea02b83b83.sql | — | — |
| `notify_sale_completion` | 20260512192931_a3224c81-646c-41f5-9efe-bf59c6850c9c.sql | — | — |
| `notify_salesperson_on_bonus_paid` | 20260723132212_21cd0f38-cda7-4ffd-9fff-31d375ce1722.sql | — | — |
| `pick_step_variant` | 20260417004724_5b69c678-9bcb-4757-afa3-c7f08a0bd49c.sql | — | — |
| `private` | 20260712195109_93d2c7b7-7fbb-4e7c-8a3f-ebae3d404292.sql | — | — |
| `process_audit_log` | 20260519114133_a91a5ce9-d50c-49a6-b517-de49bed3abf9.sql | — | — |
| `process_lead_intent_event` | 20260508140523_28e78fde-2027-440d-b35a-5630b561af6d.sql | — | 1 arquivo(s) |
| `process_performance_bet_event` | 20260512184157_4fb6807e-164e-43ef-92ea-00266e437054.sql | — | — |
| `process_weekly_league_reset` | 20260512143013_d0ee44c6-25d4-42a1-8f86-4492bda7491c.sql | — | 1 arquivo(s) |
| `protect_pa_nudge_content` | 20260723122258_04332939-3a35-43e1-b47e-9ec896a02355.sql | — | — |
| `purge_old_telemetry` | 20260712220130_4232377c-8085-469d-af1b-ea13afa5219a.sql | service_role | — |
| `purge_telemetry_retention` | 20260831130001_repair_cron_and_fk_indexes.sql | service_role | — |
| `reassign_inactive_client_portfolio` | 20260830000002_harden_lead_routing.sql | service_role | — |
| `recompute_engagement_score` | 20260417105640_f90fe72d-ce4d-4999-9ab0-239b02795e32.sql | — | 1 arquivo(s) |
| `reconcile_forecast_accuracy` | 20260513192524_0d483376-feda-4a3b-8407-4904a6a0b6d1.sql | — | — |
| `record_email_opt_out` | 20260726200015_4da82c03-38f9-4478-b6f8-5ba0e25d9cbe.sql | service_role | — |
| `record_engagement_signal` | 20260417011542_fc8fac96-2267-42a9-83f9-fde79549238b.sql | authenticated, service_role | — |
| `record_failed_login_attempt` | 20260831130000_harden_public_access_and_privileged_rpcs.sql | anon, authenticated, service_role | 1 arquivo(s) |
| `record_lead_score_history` | 20260417163016_10247063-3375-460e-b955-9678367cde57.sql | — | — |
| `record_login_attempt` | 20260719000001_restore_login_attempts_insert_policy.sql | service_role | — |
| `record_outbound_message` | 20260417112931_1cd3847f-3cf1-44bb-853f-20cd0066df36.sql | — | — |
| `record_price_history` | 20251227180950_1c4db781-f1ed-4c0e-8e5a-feed06d3270d.sql | — | — |
| `record_sale_stage_transition` | 20260418122352_0616b0f7-20cd-4165-b811-f996899f13df.sql | — | — |
| `record_successful_login_attempt` | 20260831130000_harden_public_access_and_privileged_rpcs.sql | authenticated, service_role | 1 arquivo(s) |
| `refresh_competitive_ranking` | 20260517113746_ba2cd7eb-24e5-40ef-a0e6-2b2a233dedb2.sql | authenticated | — |
| `refresh_materialized_views` | 20260104181000_materialized_views_enhanced.sql | — | — |
| `refresh_monthly_sales_summary` | 20260513192406_ef2d75ae-77a0-44d8-be60-b4f1a6aba82b.sql | — | — |
| `refresh_session` | 20251231120846_562120aa-f001-412e-8054-805485a4cfb6.sql | — | 1 arquivo(s) |
| `regenerate_backup_codes` | 20260321195552_1a939365-b697-4a37-870b-c118281c25b2.sql | — | 1 arquivo(s) |
| `register_race_daily_checkin` | 20260619145322_df537bec-72b5-4e50-8778-17637a1e009d.sql | authenticated | 1 arquivo(s) |
| `reindex_tables` | 20260104184000_performance_indexes_additional.sql | — | — |
| `reset_pg_stat_statements_weekly` | 20260831130001_repair_cron_and_fk_indexes.sql | service_role | — |
| `restore_deleted_record` | 20260831130000_harden_public_access_and_privileged_rpcs.sql | authenticated, service_role | — |
| `restore_record` | 20260831130000_harden_public_access_and_privileged_rpcs.sql | authenticated, service_role | — |
| `route_unassigned_client_portfolio` | 20260830000002_harden_lead_routing.sql | authenticated, service_role | 2 arquivo(s) |
| `schedule_next_qbrs` | 20260416232618_f6dcab79-5212-4086-b46f-7ff5f3532a80.sql | — | — |
| `search_call_library` | 20260417193322_744fd297-7c0e-4c6d-8ce7-79fb68e00dca.sql | — | 1 arquivo(s) |
| `search_products_semantic` | 20260416182649_6e133557-89ac-41bc-b1b9-0f6b89b01f1c.sql | — | — |
| `search_products_vector` | 20260512175755_6b79f43e-8c98-44cd-83ca-31fdacae57e4.sql | — | — |
| `send_notification` | 20260512213357_15e3dcb3-7cf3-4f6e-9af2-21233a6401d4.sql | — | 1 arquivo(s) |
| `set_mfa_preferred_method` | 20260321195552_1a939365-b697-4a37-870b-c118281c25b2.sql | — | 1 arquivo(s) |
| `set_quotes_inbound_updated_at` | 20260706211719_475beda8-d84e-451f-b5f1-b6f483b8a782.sql | — | — |
| `set_sdr_id_on_insert` | 20260517131244_419ed71c-170d-4a29-a1b9-66aa785fd0ec.sql | — | — |
| `set_updated_at` | 20260706215158_5ff9ab03-a44a-40de-a023-912020d1cb3e.sql | — | — |
| `settle_performance_bets` | 20260512174528_edb98a5b-cb15-451f-928c-7bb53757cd11.sql | — | — |
| `setup_sms_mfa` | 20260321195552_1a939365-b697-4a37-870b-c118281c25b2.sql | — | 1 arquivo(s) |
| `snapshot_committee_coverage` | 20260418121800_50392e48-27b4-44b2-a825-26ca2f846981.sql | — | — |
| `snapshot_engagement_score` | 20260417174122_6ffab81c-1745-49c8-9551-aa285faf02f3.sql | — | — |
| `snapshot_race_daily` | 20260418182126_59dea17a-40da-48e8-9327-fe84ef6d6194.sql | authenticated | — |
| `soft_delete_record` | 20260831130000_harden_public_access_and_privileged_rpcs.sql | authenticated, service_role | — |
| `spin_prize_wheel` | 20260830000001_secure_prize_wheel_spins.sql | authenticated | 1 arquivo(s) |
| `start_of_week` | 20260513192607_6ac577a4-6ab2-4c3e-b5c7-656f81de14b1.sql | — | — |
| `sync_battle_score` | 20260902180000_fix_sync_battle_score_stale_v_score.sql | — | — |
| `sync_performance_bets` | 20260512174528_edb98a5b-cb15-451f-928c-7bb53757cd11.sql | — | — |
| `sync_quote_to_sale_status` | 20260718000001_fix_sync_quote_no_status_downgrade.sql | — | — |
| `sync_sales_statuses` | 20260513192524_0d483376-feda-4a3b-8407-4904a6a0b6d1.sql | — | — |
| `sync_territory_ownership` | 20260708133426_ef822259-f8e4-47f1-b156-962c1fdfd863.sql | — | — |
| `sync_total_xp` | 20260513192406_ef2d75ae-77a0-44d8-be60-b4f1a6aba82b.sql | — | — |
| `sync_weekly_xp` | 20260513192524_0d483376-feda-4a3b-8407-4904a6a0b6d1.sql | — | — |
| `to` | 20260511203112_2dd0b918-e14b-411d-bfd7-1c4018d0432d.sql | authenticated, service_role | — |
| `toggle_workflow_active` | 20260416200128_9a349ada-690b-440b-b745-6f94b7e4160e.sql | — | 2 arquivo(s) |
| `touch_winloss_alert_settings` | 20260422163009_2c772f27-0fbe-4eaa-a764-e0a4d67a0837.sql | — | — |
| `track_bulk_draft_recovery` | 20260802150910_dbc250ba-8d86-47fb-8b72-f7ce31d58576.sql | — | — |
| `track_deal_health_change` | 20260417233223_364fa3d6-8e4f-4f76-8e5c-071358f29020.sql | — | — |
| `trg_activities_auto_pause_sequences` | 20260417110613_75829d1b-cd98-4ce9-b51b-2c0ba819bf43.sql | — | — |
| `trg_invalidate_forecast_narrative_cache` | 20260712232606_1587a3f1-2450-4a43-acc5-c7d6b47ad17b.sql | — | — |
| `trg_process_email_tracking_event` | 20260513192524_0d483376-feda-4a3b-8407-4904a6a0b6d1.sql | — | — |
| `trg_recompute_engagement` | 20260417105640_f90fe72d-ce4d-4999-9ab0-239b02795e32.sql | — | — |
| `trg_refresh_ranking_on_sale` | 20260619145322_df537bec-72b5-4e50-8778-17637a1e009d.sql | — | — |
| `trigger_campaign_health_alert` | 20260831130003_fix_campaign_health_cron.sql | service_role | — |
| `trigger_detect_client_churn_alerts` | 20260831163000_secure_churn_and_task_crons.sql | service_role | — |
| `trigger_generate_urgent_client_tasks` | 20260831163000_secure_churn_and_task_crons.sql | service_role | — |
| `trigger_internal_edge_job` | 20261001144000_schedule_wal_and_webhook_health_crons.sql | service_role | — |
| `trigger_recalculate_deal_health` | 20260513192406_ef2d75ae-77a0-44d8-be60-b4f1a6aba82b.sql | — | — |
| `trigger_refresh_monthly_summary` | 20260513192607_6ac577a4-6ab2-4c3e-b5c7-656f81de14b1.sql | — | — |
| `trigger_update_performance_bets` | 20260513192607_6ac577a4-6ab2-4c3e-b5c7-656f81de14b1.sql | — | — |
| `trigger_update_territories` | 20260513192607_6ac577a4-6ab2-4c3e-b5c7-656f81de14b1.sql | — | — |
| `unlock_race_item` | 20260904190000_fix_unlock_race_item_missing_arena_user_stats.sql | — | 1 arquivo(s) |
| `update_2fa_updated_at` | 20260105000001_2fa_system.sql | — | — |
| `update_call_recording_diarization` | 20260417120210_00a66fee-a4de-44a1-97ab-db5926583629.sql | — | — |
| `update_call_recording_summary` | 20260417122626_dc9224cc-f218-47fe-8306-93dcad7150f4.sql | — | — |
| `update_call_recording_transcript` | 20260417115509_514f0fe4-af62-4b72-aec8-3ce37b4ed9ac.sql | — | — |
| `update_call_recording_tsv` | 20260417193322_744fd297-7c0e-4c6d-8ce7-79fb68e00dca.sql | — | — |
| `update_client_ltv_on_sale` | 20260513191959_5056e64f-3123-42f4-b84c-03035d301fa5.sql | — | — |
| `update_client_portfolio_status` | 20260827000001_harden_webhooks_portfolio_and_idempotency.sql | authenticated | 2 arquivo(s) |
| `update_client_score` | 20260105000005_stored_procedures.sql | — | — |
| `update_client_total_value` | 20260513192524_0d483376-feda-4a3b-8407-4904a6a0b6d1.sql | — | — |
| `update_lead_score` | 20260104170152_stored_procedures.sql | — | — |
| `update_own_profile` | 20260317230752_59f7cd10-885e-4b37-8df8-d05cf8731a58.sql | — | — |
| `update_own_sale` | 20260412115357_dcf9ab46-7f4b-484f-bf6f-7a87bcbc40f7.sql | — | — |
| `update_performance_bet_progress` | 20260513192607_6ac577a4-6ab2-4c3e-b5c7-656f81de14b1.sql | — | — |
| `update_product_stock` | 20260513191959_5056e64f-3123-42f4-b84c-03035d301fa5.sql | — | — |
| `update_saved_filters_updated_at` | 20241231000000_saved_filters.sql | — | — |
| `update_territory_conquests` | 20260513192607_6ac577a4-6ab2-4c3e-b5c7-656f81de14b1.sql | — | — |
| `update_updated_at_column` | 20260513191959_5056e64f-3123-42f4-b84c-03035d301fa5.sql | — | — |
| `update_user_mfa_settings` | 20260404155258_7109bf7e-3093-412b-97a9-e67436fd98ba.sql | — | — |
| `upsert_client_from_quote` | 20260706160203_849fd5c0-44df-47ae-8fe5-96a9dddd27e7.sql | service_role | — |
| `upsert_semantic_entry` | 20260417123624_68ec9996-f000-46cf-958d-418554185750.sql | — | — |
| `user_owns_engagement_contact` | 20260417105640_f90fe72d-ce4d-4999-9ab0-239b02795e32.sql | — | — |
| `user_owns_sequence_step` | 20260417004724_5b69c678-9bcb-4757-afa3-c7f08a0bd49c.sql | — | — |
| `validate_api_token` | 20260330135126_2e3c42f1-5cc7-4566-8e0b-2196a312249f.sql | — | — |
| `validate_mood_value` | 20260402110711_bc8566d0-e7aa-476b-870c-7d517defb199.sql | — | — |
| `validate_race_event` | 20260419145440_18e5089e-576c-497e-8cb9-3fce68746a1b.sql | — | — |
| `validate_session` | 20251231120846_562120aa-f001-412e-8054-805485a4cfb6.sql | — | 1 arquivo(s) |
| `verify_and_enable_sms` | 20260321195552_1a939365-b697-4a37-870b-c118281c25b2.sql | — | 1 arquivo(s) |
| `verify_and_enable_totp` | 20260402114944_69ceffa7-70a2-44d1-9c6d-ba4872fdbc77.sql | — | 1 arquivo(s) |
| `verify_mfa_code` | 20260402114944_69ceffa7-70a2-44d1-9c6d-ba4872fdbc77.sql | — | 1 arquivo(s) |
| `win_rate_breakdown` | 20260416231940_a82b593c-b778-454c-b3ac-97ab40286cfd.sql | — | — |

### RPCs chamadas no front sem definição encontrada nas migrations

Nenhuma.
