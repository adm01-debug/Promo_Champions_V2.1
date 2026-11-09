# public.semantic_index

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 1 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `entity_type` | `text` | não |  |  |  |
| 3 | `entity_id` | `uuid` | não |  |  |  |
| 4 | `salesperson_id` | `uuid` | sim |  |  |  |
| 5 | `content` | `text` | não |  |  |  |
| 6 | `embedding` | `vector(768)` | sim |  |  |  |
| 7 | `metadata` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 8 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `source_updated_at` | `timestamp with time zone` | sim |  |  |  |
| 10 | `content_hash` | `text` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| semantic_index_entity_type_check | CHECK | `CHECK (entity_type = ANY (ARRAY['client'::text, 'lead'::text, 'deal'::text, 'activity'::text, 'call_recording'::text, 'note'::text, 'email_message'::text, 'whatsapp_message'::text, 'proposal'::text, 'task'::text, 'playbook'::text]))` |  |  | sim |
| semantic_index_entity_type_entity_id_key | UNIQUE | `UNIQUE (entity_type, entity_id)` |  |  | sim |
| semantic_index_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_semantic_index_content_hash | btree | entity_type, entity_id, content_hash | não | sim |  | `CREATE INDEX idx_semantic_index_content_hash ON public.semantic_index USING btree (entity_type, entity_id, content_hash)` |
| idx_semantic_index_embedding | ivfflat | embedding | não | sim |  | `CREATE INDEX idx_semantic_index_embedding ON public.semantic_index USING ivfflat (embedding vector_cosine_ops) WITH (lists='100')` |
| idx_semantic_index_entity | btree | entity_type, entity_id | não | sim |  | `CREATE INDEX idx_semantic_index_entity ON public.semantic_index USING btree (entity_type, entity_id)` |
| idx_semantic_index_salesperson | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_semantic_index_salesperson ON public.semantic_index USING btree (salesperson_id)` |
| semantic_index_entity_type_entity_id_key | btree | entity_type, entity_id | sim | sim |  | `CREATE UNIQUE INDEX semantic_index_entity_type_entity_id_key ON public.semantic_index USING btree (entity_type, entity_id)` |
| semantic_index_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX semantic_index_pkey ON public.semantic_index USING btree (id)` |


## Policies (RLS)

### `semantic_index_select_own_or_admin`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (salesperson_id = get_current_salesperson_id()))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
