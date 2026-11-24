# public.competitor_mentions

> Tabela public.competitor_mentions. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), recording_id uuid NOT NULL, competitor_id uuid NULLABLE, competitor_name text NOT NULL, timestamp_sec integer NULLABLE, context_snippet text NULLABLE, battle_card_id uuid NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: competitor_id → public.competitors_registry(id); recording_id → public.call_recordings(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.competitor_mentions. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `recording_id` | `uuid` | não |  |  | Coluna recording_id da tabela public.competitor_mentions. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.call_recordings(id). |
| 3 | `competitor_id` | `uuid` | sim |  |  | Coluna competitor_id da tabela public.competitor_mentions. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.competitors_registry(id). |
| 4 | `competitor_name` | `text` | não |  |  | Coluna competitor_name da tabela public.competitor_mentions. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `timestamp_sec` | `integer` | sim |  |  | Coluna timestamp_sec da tabela public.competitor_mentions. Tipo PostgreSQL: integer. Aceita NULL. |
| 6 | `context_snippet` | `text` | sim |  |  | Coluna context_snippet da tabela public.competitor_mentions. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `battle_card_id` | `uuid` | sim |  |  | Coluna battle_card_id da tabela public.competitor_mentions. Tipo PostgreSQL: uuid. Aceita NULL. |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.competitor_mentions. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| competitor_mentions_competitor_id_fkey | FOREIGN KEY | `FOREIGN KEY (competitor_id) REFERENCES competitors_registry(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| competitor_mentions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| competitor_mentions_recording_id_fkey | FOREIGN KEY | `FOREIGN KEY (recording_id) REFERENCES call_recordings(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| competitor_mentions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX competitor_mentions_pkey ON public.competitor_mentions USING btree (id)` |
| idx_competitor_mentions_competitor | btree | competitor_id | não | sim |  | `CREATE INDEX idx_competitor_mentions_competitor ON public.competitor_mentions USING btree (competitor_id)` |
| idx_competitor_mentions_recording | btree | recording_id | não | sim |  | `CREATE INDEX idx_competitor_mentions_recording ON public.competitor_mentions USING btree (recording_id)` |


## Policies (RLS)

### `Owners delete mentions on their recordings`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(EXISTS ( SELECT 1    FROM (call_recordings cr      JOIN salespeople sp ON ((sp.id = cr.salesperson_id)))   WHERE ((cr.id = competitor_mentions.recording_id) AND ((sp.auth_user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |
| WITH CHECK |  |

### `Owners insert mentions on their recordings`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(EXISTS ( SELECT 1    FROM (call_recordings cr      JOIN salespeople sp ON ((sp.id = cr.salesperson_id)))   WHERE ((cr.id = competitor_mentions.recording_id) AND ((sp.auth_user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |

### `Owners view mentions of their recordings`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(EXISTS ( SELECT 1    FROM (call_recordings cr      JOIN salespeople sp ON ((sp.id = cr.salesperson_id)))   WHERE ((cr.id = competitor_mentions.recording_id) AND ((sp.auth_user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| tr_competitor_mention_health | AFTER | INSERT OR UPDATE | ROW | enabled | private.trigger_recalculate_deal_health |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
