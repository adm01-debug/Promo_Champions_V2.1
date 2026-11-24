# public.tournament_matches

> Tabela public.tournament_matches. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), tournament_id uuid NOT NULL, round_number integer NOT NULL, match_order integer NOT NULL DEFAULT 0, player1_id uuid NULLABLE, player2_id uuid NULLABLE, player1_score numeric NOT NULL DEFAULT 0, player2_score numeric NOT NULL DEFAULT 0, winner_id uuid NULLABLE, status text NOT NULL DEFAULT 'pending'::text, started_at timestamp with time zone NULLABLE, completed_at timestamp with time zone NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: player1_id → public.salespeople(id); player2_id → public.salespeople(id); tournament_id → public.tournaments(id); winner_id → public.salespeople(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.tournament_matches. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `tournament_id` | `uuid` | não |  |  | Coluna tournament_id da tabela public.tournament_matches. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.tournaments(id). |
| 3 | `round_number` | `integer` | não |  |  | Coluna round_number da tabela public.tournament_matches. Tipo PostgreSQL: integer. Não aceita NULL. |
| 4 | `match_order` | `integer` | não | `0` |  | Coluna match_order da tabela public.tournament_matches. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 5 | `player1_id` | `uuid` | sim |  |  | Coluna player1_id da tabela public.tournament_matches. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.salespeople(id). |
| 6 | `player2_id` | `uuid` | sim |  |  | Coluna player2_id da tabela public.tournament_matches. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.salespeople(id). |
| 7 | `player1_score` | `numeric` | não | `0` |  | Coluna player1_score da tabela public.tournament_matches. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 8 | `player2_score` | `numeric` | não | `0` |  | Coluna player2_score da tabela public.tournament_matches. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 9 | `winner_id` | `uuid` | sim |  |  | Coluna winner_id da tabela public.tournament_matches. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.salespeople(id). |
| 10 | `status` | `text` | não | `'pending'::text` |  | Coluna status da tabela public.tournament_matches. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'pending'::text. Validação CHECK: CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'completed'::text])). |
| 11 | `started_at` | `timestamp with time zone` | sim |  |  | Coluna started_at da tabela public.tournament_matches. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 12 | `completed_at` | `timestamp with time zone` | sim |  |  | Coluna completed_at da tabela public.tournament_matches. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.tournament_matches. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| tournament_matches_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| tournament_matches_player1_id_fkey | FOREIGN KEY | `FOREIGN KEY (player1_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| tournament_matches_player2_id_fkey | FOREIGN KEY | `FOREIGN KEY (player2_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| tournament_matches_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'completed'::text]))` |  |  | sim |
| tournament_matches_tournament_id_fkey | FOREIGN KEY | `FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| tournament_matches_winner_id_fkey | FOREIGN KEY | `FOREIGN KEY (winner_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_tournament_matches_player1_id | btree | player1_id | não | sim |  | `CREATE INDEX idx_tournament_matches_player1_id ON public.tournament_matches USING btree (player1_id)` |
| idx_tournament_matches_player2_id | btree | player2_id | não | sim |  | `CREATE INDEX idx_tournament_matches_player2_id ON public.tournament_matches USING btree (player2_id)` |
| idx_tournament_matches_tournament_id | btree | tournament_id | não | sim |  | `CREATE INDEX idx_tournament_matches_tournament_id ON public.tournament_matches USING btree (tournament_id)` |
| idx_tournament_matches_winner_id | btree | winner_id | não | sim |  | `CREATE INDEX idx_tournament_matches_winner_id ON public.tournament_matches USING btree (winner_id)` |
| tournament_matches_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX tournament_matches_pkey ON public.tournament_matches USING btree (id)` |


## Policies (RLS)

### `Admins can insert matches`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins can update matches`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Auth users can read matches`

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
