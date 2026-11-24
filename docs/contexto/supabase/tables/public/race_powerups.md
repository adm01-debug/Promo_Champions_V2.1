# public.race_powerups

> Tabela public.race_powerups. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), season_id uuid NOT NULL, salesperson_id uuid NOT NULL, powerup_type text NOT NULL, collected_at timestamp with time zone NOT NULL DEFAULT now(), used_at timestamp with time zone NULLABLE, effect_data jsonb NOT NULL DEFAULT '{}'::jsonb. Relacionamentos FK: salesperson_id → public.salespeople(id); season_id → public.race_seasons(id).

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


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.race_powerups. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `season_id` | `uuid` | não |  |  | Coluna season_id da tabela public.race_powerups. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.race_seasons(id). |
| 3 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.race_powerups. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 4 | `powerup_type` | `text` | não |  |  | Coluna powerup_type da tabela public.race_powerups. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (powerup_type = ANY (ARRAY['turbo'::text, 'shield'::text, 'lightning'::text, 'xp_boost'::text, 'mega_boost'::text])). |
| 5 | `collected_at` | `timestamp with time zone` | não | `now()` |  | Coluna collected_at da tabela public.race_powerups. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 6 | `used_at` | `timestamp with time zone` | sim |  |  | Coluna used_at da tabela public.race_powerups. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 7 | `effect_data` | `jsonb` | não | `'{}'::jsonb` |  | Coluna effect_data da tabela public.race_powerups. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| race_powerups_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| race_powerups_powerup_type_check | CHECK | `CHECK (powerup_type = ANY (ARRAY['turbo'::text, 'shield'::text, 'lightning'::text, 'xp_boost'::text, 'mega_boost'::text]))` |  |  | sim |
| race_powerups_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| race_powerups_season_id_fkey | FOREIGN KEY | `FOREIGN KEY (season_id) REFERENCES race_seasons(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_champ_race_powerups_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_champ_race_powerups_salesperson_id ON public.race_powerups USING btree (salesperson_id)` |
| idx_race_powerups_sp | btree | season_id, salesperson_id | não | sim |  | `CREATE INDEX idx_race_powerups_sp ON public.race_powerups USING btree (season_id, salesperson_id)` |
| race_powerups_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX race_powerups_pkey ON public.race_powerups USING btree (id)` |
| race_powerups_source_sale_dedup_idx | btree | season_id, salesperson_id, powerup_type | sim | sim | `((effect_data ->> 'source_sale_id'::text) IS NOT NULL)` | `CREATE UNIQUE INDEX race_powerups_source_sale_dedup_idx ON public.race_powerups USING btree (season_id, salesperson_id, powerup_type, ((effect_data ->> 'source_sale_id'::text))) WHERE ((effect_data ->> 'source_sale_id'::text) IS NOT NULL)` |


## Policies (RLS)

### `view_powerups`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
