# public.race_events

> Tabela public.race_events. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), season_id uuid NOT NULL, salesperson_id uuid NOT NULL, event_type text NOT NULL, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: salesperson_id → public.salespeople(id); season_id → public.race_seasons(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 1 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |
| usada por views | public.race_rivalries_view |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.race_events. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `season_id` | `uuid` | não |  |  | Coluna season_id da tabela public.race_events. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.race_seasons(id). |
| 3 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.race_events. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 4 | `event_type` | `text` | não |  |  | Coluna event_type da tabela public.race_events. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (event_type = ANY (ARRAY['boost'::text, 'overtake'::text, 'checkpoint'::text, 'powerup'::text, 'victory'::text, 'pitstop'::text, 'powerup_unlocked'::text, 'monthly_champion'::text])). |
| 5 | `metadata` | `jsonb` | não | `'{}'::jsonb` |  | Coluna metadata da tabela public.race_events. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 6 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.race_events. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| race_events_event_type_check | CHECK | `CHECK (event_type = ANY (ARRAY['boost'::text, 'overtake'::text, 'checkpoint'::text, 'powerup'::text, 'victory'::text, 'pitstop'::text, 'powerup_unlocked'::text, 'monthly_champion'::text]))` |  |  | sim |
| race_events_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| race_events_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| race_events_season_id_fkey | FOREIGN KEY | `FOREIGN KEY (season_id) REFERENCES race_seasons(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_champ_race_events_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_champ_race_events_salesperson_id ON public.race_events USING btree (salesperson_id)` |
| idx_race_events_season | btree | season_id, created_at | não | sim |  | `CREATE INDEX idx_race_events_season ON public.race_events USING btree (season_id, created_at DESC)` |
| race_events_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX race_events_pkey ON public.race_events USING btree (id)` |
| race_events_sale_dedup_idx | btree | season_id, salesperson_id, event_type | sim | sim | `((metadata ->> 'sale_id'::text) IS NOT NULL)` | `CREATE UNIQUE INDEX race_events_sale_dedup_idx ON public.race_events USING btree (season_id, salesperson_id, event_type, ((metadata ->> 'sale_id'::text)), COALESCE((metadata ->> 'dedup_key'::text), ''::text)) WHERE ((metadata ->> 'sale_id'::text) IS NOT NULL)` |
| race_events_season_salesperson_idx | btree | season_id, salesperson_id, created_at | não | sim |  | `CREATE INDEX race_events_season_salesperson_idx ON public.race_events USING btree (season_id, salesperson_id, created_at DESC)` |


## Policies (RLS)

### `view_race_events`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| validate_race_event_trigger | BEFORE | INSERT | ROW | enabled | public.validate_race_event |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
