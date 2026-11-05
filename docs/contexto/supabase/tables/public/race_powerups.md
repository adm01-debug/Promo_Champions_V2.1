# public.race_powerups

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `season_id` | `uuid` | não |  |  |  |
| 3 | `salesperson_id` | `uuid` | não |  |  |  |
| 4 | `powerup_type` | `text` | não |  |  |  |
| 5 | `collected_at` | `timestamp with time zone` | não | `now()` |  |  |
| 6 | `used_at` | `timestamp with time zone` | sim |  |  |  |
| 7 | `effect_data` | `jsonb` | não | `'{}'::jsonb` |  |  |


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

_nenhum_
