# public.call_recordings

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `sale_id` | `uuid` | sim |  |  |  |
| 4 | `client_id` | `uuid` | sim |  |  |  |
| 5 | `title` | `text` | não |  |  |  |
| 6 | `audio_url` | `text` | sim |  |  |  |
| 7 | `duration_seconds` | `integer` | sim | `0` |  |  |
| 8 | `recorded_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `status` | `text` | não | `'pending'::text` |  |  |
| 10 | `participants` | `jsonb` | sim | `'[]'::jsonb` |  |  |
| 11 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  |  |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 13 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 14 | `transcript` | `text` | sim |  |  |  |
| 15 | `transcript_language` | `text` | sim | `'pt'::text` |  |  |
| 16 | `transcribed_at` | `timestamp with time zone` | sim |  |  |  |
| 17 | `transcription_error` | `text` | sim |  |  |  |
| 18 | `talk_ratio_seller` | `numeric` | sim |  |  |  |
| 19 | `talk_ratio_client` | `numeric` | sim |  |  |  |
| 20 | `longest_monologue_sec` | `integer` | sim |  |  |  |
| 21 | `interruptions_count` | `integer` | sim |  |  |  |
| 22 | `turns_count` | `integer` | sim |  |  |  |
| 23 | `diarization` | `jsonb` | sim |  |  |  |
| 24 | `diarized_at` | `timestamp with time zone` | sim |  |  |  |
| 25 | `summary` | `text` | sim |  |  |  |
| 26 | `action_items` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 27 | `decisions` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 28 | `objections_summary` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 29 | `next_steps` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 30 | `key_topics` | `text[]` | não | `ARRAY[]::text[]` |  |  |
| 31 | `sentiment` | `text` | sim |  |  |  |
| 32 | `summarized_at` | `timestamp with time zone` | sim |  |  |  |
| 33 | `transcript_tsv` | `tsvector` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| call_recordings_client_id_fkey | FOREIGN KEY | `FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| call_recordings_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| call_recordings_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| call_recordings_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| call_recordings_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'transcribing'::text, 'analyzing'::text, 'ready'::text, 'failed'::text]))` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.call_coaching_scorecards | call_coaching_scorecards_recording_id_fkey | recording_id | CASCADE |
| public.call_conversation_metrics | call_conversation_metrics_recording_id_fkey | recording_id | CASCADE |
| public.call_critical_moments | call_critical_moments_recording_id_fkey | recording_id | CASCADE |
| public.call_insights | call_insights_recording_id_fkey | recording_id | CASCADE |
| public.call_objection_analysis | call_objection_analysis_recording_id_fkey | recording_id | CASCADE |
| public.call_objections | call_objections_recording_id_fkey | recording_id | CASCADE |
| public.call_question_analysis | call_question_analysis_recording_id_fkey | recording_id | CASCADE |
| public.call_questions | call_questions_recording_id_fkey | recording_id | CASCADE |
| public.call_sentiment_timeline | call_sentiment_timeline_recording_id_fkey | recording_id | CASCADE |
| public.call_transcripts | call_transcripts_recording_id_fkey | recording_id | CASCADE |
| public.coaching_actions | coaching_actions_recording_id_fkey | recording_id | CASCADE |
| public.committee_extraction_runs | committee_extraction_runs_recording_id_fkey | recording_id | CASCADE |
| public.competitor_mentions | competitor_mentions_recording_id_fkey | recording_id | CASCADE |
| public.objection_library | objection_library_best_response_recording_id_fkey | best_response_recording_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| call_recordings_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX call_recordings_pkey ON public.call_recordings USING btree (id)` |
| call_recordings_uniq_sp_audio | btree | salesperson_id, audio_url | sim | sim | `(audio_url IS NOT NULL)` | `CREATE UNIQUE INDEX call_recordings_uniq_sp_audio ON public.call_recordings USING btree (salesperson_id, audio_url) WHERE (audio_url IS NOT NULL)` |
| idx_call_recordings_client_id | btree | client_id | não | sim |  | `CREATE INDEX idx_call_recordings_client_id ON public.call_recordings USING btree (client_id)` |
| idx_call_recordings_recorded_at | btree | recorded_at | não | sim |  | `CREATE INDEX idx_call_recordings_recorded_at ON public.call_recordings USING btree (recorded_at DESC)` |
| idx_call_recordings_sale | btree | sale_id | não | sim |  | `CREATE INDEX idx_call_recordings_sale ON public.call_recordings USING btree (sale_id)` |
| idx_call_recordings_salesperson | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_call_recordings_salesperson ON public.call_recordings USING btree (salesperson_id)` |
| idx_call_recordings_transcript_tsv | gin | transcript_tsv | não | sim |  | `CREATE INDEX idx_call_recordings_transcript_tsv ON public.call_recordings USING gin (transcript_tsv)` |


## Policies (RLS)

### `Admins delete recordings`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Salespeople create own recordings`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(salesperson_id = get_current_salesperson_id())` |

### `Salespeople update own recordings`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Salespeople view own recordings`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_auto_coaching_after_summary | AFTER | INSERT OR UPDATE | ROW | enabled | public.trigger_auto_coaching_on_recording |
| trg_recording_generate_coaching | AFTER | INSERT OR UPDATE | ROW | enabled | public.trg_recording_generate_coaching |
| trg_update_call_recording_tsv | BEFORE | INSERT OR UPDATE | ROW | enabled | public.update_call_recording_tsv |
| update_call_recordings_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
