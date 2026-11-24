# public.call_recordings

> Tabela public.call_recordings. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), salesperson_id uuid NOT NULL, sale_id uuid NULLABLE, client_id uuid NULLABLE, title text NOT NULL, audio_url text NULLABLE, duration_seconds integer NULLABLE DEFAULT 0, recorded_at timestamp with time zone NOT NULL DEFAULT now(), status text NOT NULL DEFAULT 'pending'::text, participants jsonb NULLABLE DEFAULT '[]'::jsonb, metadata jsonb NULLABLE DEFAULT '{}'::jsonb, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), transcript text NULLABLE, transcript_language text NULLABLE DEFAULT 'pt'::text, transcribed_at timestamp with time zone NULLABLE, transcription_error text NULLABLE, talk_ratio_seller numeric NULLABLE, talk_ratio_client numeric NULLABLE, longest_monologue_sec integer NULLABLE, interruptions_count integer NULLABLE, turns_count integer NULLABLE, diarization jsonb NULLABLE, diarized_at timestamp with time zone NULLABLE, summary text NULLABLE, action_items jsonb NOT NULL DEFAULT '[]'::jsonb, decisions jsonb NOT NULL DEFAULT '[]'::jsonb, objections_summary jsonb NOT NULL DEFAULT '[]'::jsonb, next_steps jsonb NOT NULL DEFAULT '[]'::jsonb, key_topics text[] NOT NULL DEFAULT ARRAY[]::text[], sentiment text NULLABLE, summarized_at timestamp with time zone NULLABLE, transcript_tsv tsvector NULLABLE. Relacionamentos FK: client_id → public.clients(id); sale_id → public.sales(id); salesperson_id → public.salespeople(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.call_recordings. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.call_recordings. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 3 | `sale_id` | `uuid` | sim |  |  | Coluna sale_id da tabela public.call_recordings. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.sales(id). |
| 4 | `client_id` | `uuid` | sim |  |  | Coluna client_id da tabela public.call_recordings. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.clients(id). |
| 5 | `title` | `text` | não |  |  | Coluna title da tabela public.call_recordings. Tipo PostgreSQL: text. Não aceita NULL. |
| 6 | `audio_url` | `text` | sim |  |  | Coluna audio_url da tabela public.call_recordings. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `duration_seconds` | `integer` | sim | `0` |  | Coluna duration_seconds da tabela public.call_recordings. Tipo PostgreSQL: integer. Aceita NULL. Valor padrão: 0. |
| 8 | `recorded_at` | `timestamp with time zone` | não | `now()` |  | Coluna recorded_at da tabela public.call_recordings. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 9 | `status` | `text` | não | `'pending'::text` |  | Coluna status da tabela public.call_recordings. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'pending'::text. Validação CHECK: CHECK (status = ANY (ARRAY['pending'::text, 'transcribing'::text, 'analyzing'::text, 'ready'::text, 'failed'::text])). |
| 10 | `participants` | `jsonb` | sim | `'[]'::jsonb` |  | Coluna participants da tabela public.call_recordings. Tipo PostgreSQL: jsonb. Aceita NULL. Valor padrão: '[]'::jsonb. |
| 11 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  | Coluna metadata da tabela public.call_recordings. Tipo PostgreSQL: jsonb. Aceita NULL. Valor padrão: '{}'::jsonb. |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.call_recordings. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 13 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.call_recordings. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 14 | `transcript` | `text` | sim |  |  | Coluna transcript da tabela public.call_recordings. Tipo PostgreSQL: text. Aceita NULL. |
| 15 | `transcript_language` | `text` | sim | `'pt'::text` |  | Coluna transcript_language da tabela public.call_recordings. Tipo PostgreSQL: text. Aceita NULL. Valor padrão: 'pt'::text. |
| 16 | `transcribed_at` | `timestamp with time zone` | sim |  |  | Coluna transcribed_at da tabela public.call_recordings. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 17 | `transcription_error` | `text` | sim |  |  | Coluna transcription_error da tabela public.call_recordings. Tipo PostgreSQL: text. Aceita NULL. |
| 18 | `talk_ratio_seller` | `numeric` | sim |  |  | Coluna talk_ratio_seller da tabela public.call_recordings. Tipo PostgreSQL: numeric. Aceita NULL. |
| 19 | `talk_ratio_client` | `numeric` | sim |  |  | Coluna talk_ratio_client da tabela public.call_recordings. Tipo PostgreSQL: numeric. Aceita NULL. |
| 20 | `longest_monologue_sec` | `integer` | sim |  |  | Coluna longest_monologue_sec da tabela public.call_recordings. Tipo PostgreSQL: integer. Aceita NULL. |
| 21 | `interruptions_count` | `integer` | sim |  |  | Coluna interruptions_count da tabela public.call_recordings. Tipo PostgreSQL: integer. Aceita NULL. |
| 22 | `turns_count` | `integer` | sim |  |  | Coluna turns_count da tabela public.call_recordings. Tipo PostgreSQL: integer. Aceita NULL. |
| 23 | `diarization` | `jsonb` | sim |  |  | Coluna diarization da tabela public.call_recordings. Tipo PostgreSQL: jsonb. Aceita NULL. |
| 24 | `diarized_at` | `timestamp with time zone` | sim |  |  | Coluna diarized_at da tabela public.call_recordings. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 25 | `summary` | `text` | sim |  |  | Coluna summary da tabela public.call_recordings. Tipo PostgreSQL: text. Aceita NULL. |
| 26 | `action_items` | `jsonb` | não | `'[]'::jsonb` |  | Coluna action_items da tabela public.call_recordings. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 27 | `decisions` | `jsonb` | não | `'[]'::jsonb` |  | Coluna decisions da tabela public.call_recordings. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 28 | `objections_summary` | `jsonb` | não | `'[]'::jsonb` |  | Coluna objections_summary da tabela public.call_recordings. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 29 | `next_steps` | `jsonb` | não | `'[]'::jsonb` |  | Coluna next_steps da tabela public.call_recordings. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 30 | `key_topics` | `text[]` | não | `ARRAY[]::text[]` |  | Coluna key_topics da tabela public.call_recordings. Tipo PostgreSQL: text[]. Não aceita NULL. Valor padrão: ARRAY[]::text[]. |
| 31 | `sentiment` | `text` | sim |  |  | Coluna sentiment da tabela public.call_recordings. Tipo PostgreSQL: text. Aceita NULL. |
| 32 | `summarized_at` | `timestamp with time zone` | sim |  |  | Coluna summarized_at da tabela public.call_recordings. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 33 | `transcript_tsv` | `tsvector` | sim |  |  | Coluna transcript_tsv da tabela public.call_recordings. Tipo PostgreSQL: tsvector. Aceita NULL. |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
