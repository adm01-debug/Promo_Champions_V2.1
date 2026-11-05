# public.salespeople

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 5 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |
| usada por views | public.follow_up_audit_view, public.mv_competitive_ranking, public.race_leaderboard_view, public.salespeople_public |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `name` | `text` | não |  |  |  |
| 3 | `email` | `text` | sim |  |  |  |
| 4 | `avatar_url` | `text` | sim |  |  |  |
| 5 | `commission_rate` | `numeric(5,2)` | não | `10.00` |  |  |
| 6 | `is_active` | `boolean` | não | `true` |  |  |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 8 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `role` | `salesperson_role` | não | `'hybrid'::salesperson_role` |  |  |
| 10 | `auth_user_id` | `uuid` | sim |  |  |  |
| 11 | `score_total` | `numeric` | não | `0` |  |  |
| 12 | `squad_id` | `uuid` | sim |  |  |  |
| 13 | `notify_sales_in_app` | `boolean` | sim | `true` |  |  |
| 14 | `notify_sales_email` | `boolean` | sim | `false` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| salespeople_auth_user_id_key | UNIQUE | `UNIQUE (auth_user_id)` |  |  | sim |
| salespeople_email_key | UNIQUE | `UNIQUE (email)` |  |  | sim |
| salespeople_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| salespeople_squad_id_fkey | FOREIGN KEY | `FOREIGN KEY (squad_id) REFERENCES squads(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.account_activities | account_activities_salesperson_id_fkey | salesperson_id | SET NULL |
| public.accounts | accounts_owner_id_fkey | owner_id | SET NULL |
| public.achievements | achievements_salesperson_id_fkey | salesperson_id | RESTRICT |
| public.active_power_ups | active_power_ups_salesperson_id_fkey | salesperson_id | CASCADE |
| public.activities | activities_salesperson_id_fkey | salesperson_id | SET NULL |
| public.activity_goals | activity_goals_salesperson_id_fkey | salesperson_id | RESTRICT |
| public.agenda_events | agenda_events_salesperson_id_fkey | salesperson_id | CASCADE |
| public.available_spins | available_spins_salesperson_id_fkey | salesperson_id | CASCADE |
| public.battle_participants | battle_participants_salesperson_id_fkey | salesperson_id | CASCADE |
| public.call_critical_moments | call_critical_moments_salesperson_id_fkey | salesperson_id | CASCADE |
| public.call_recordings | call_recordings_salesperson_id_fkey | salesperson_id | CASCADE |
| public.challenge_progress | challenge_progress_salesperson_id_fkey | salesperson_id | CASCADE |
| public.channel_interactions | channel_interactions_salesperson_id_fkey | salesperson_id | CASCADE |
| public.chat_conversations | chat_conversations_salesperson_id_fkey | salesperson_id | CASCADE |
| public.client_portfolio | client_portfolio_assigned_by_fkey | assigned_by | SET NULL |
| public.client_portfolio | client_portfolio_salesperson_id_fkey | salesperson_id | CASCADE |
| public.coaching_actions | coaching_actions_salesperson_id_fkey | salesperson_id | CASCADE |
| public.coaching_opportunities | coaching_opportunities_salesperson_id_fkey | salesperson_id | CASCADE |
| public.coaching_sessions | coaching_sessions_salesperson_id_fkey | salesperson_id | CASCADE |
| public.combo_tracking | combo_tracking_salesperson_id_fkey | salesperson_id | CASCADE |
| public.commission_bonus_awards | commission_bonus_awards_salesperson_id_fkey | salesperson_id | CASCADE |
| public.commission_bonuses | commission_bonuses_salesperson_id_fkey | salesperson_id | CASCADE |
| public.commission_rules | commission_rules_salesperson_id_fkey | salesperson_id | CASCADE |
| public.commissions | commissions_salesperson_id_fkey | salesperson_id | CASCADE |
| public.competitive_chat_messages | competitive_chat_messages_salesperson_id_fkey | salesperson_id | CASCADE |
| public.competitive_chat_messages | competitive_chat_messages_target_salesperson_id_fkey | target_salesperson_id | SET NULL |
| public.daily_challenge_progress | daily_challenge_progress_salesperson_id_fkey | salesperson_id | CASCADE |
| public.daily_streak_achievements | daily_streak_achievements_salesperson_id_fkey | salesperson_id | CASCADE |
| public.dashboard_layouts | dashboard_layouts_salesperson_id_fkey | salesperson_id | CASCADE |
| public.deal_chat_history | deal_chat_history_salesperson_id_fkey | salesperson_id | SET NULL |
| public.deal_outcomes | deal_outcomes_salesperson_id_fkey | salesperson_id | CASCADE |
| public.deal_risk_signals | deal_risk_signals_resolved_by_fkey | resolved_by | SET NULL |
| public.digital_signatures | digital_signatures_created_by_fkey | created_by | SET NULL |
| public.email_tracking_events | email_tracking_events_salesperson_id_fkey | salesperson_id | CASCADE |
| public.expansion_opportunities | expansion_opportunities_owner_salesperson_id_fkey | owner_salesperson_id | SET NULL |
| public.external_seller_map | external_seller_map_salesperson_id_fkey | salesperson_id | CASCADE |
| public.feed_comments | feed_comments_salesperson_id_fkey | salesperson_id | CASCADE |
| public.feed_reactions | feed_reactions_salesperson_id_fkey | salesperson_id | CASCADE |
| public.kudos | kudos_from_salesperson_id_fkey | from_salesperson_id | CASCADE |
| public.kudos | kudos_to_salesperson_id_fkey | to_salesperson_id | CASCADE |
| public.lead_assignments | lead_assignments_salesperson_id_fkey | salesperson_id | CASCADE |
| public.lead_routing_log | lead_routing_log_from_salesperson_id_fkey | from_salesperson_id | SET NULL |
| public.lead_routing_log | lead_routing_log_to_salesperson_id_fkey | to_salesperson_id | SET NULL |
| public.league_history | league_history_salesperson_id_fkey | salesperson_id | CASCADE |
| public.league_members | league_members_salesperson_id_fkey | salesperson_id | CASCADE |
| public.message_templates | message_templates_salesperson_id_fkey | salesperson_id | CASCADE |
| public.mood_entries | mood_entries_salesperson_id_fkey | salesperson_id | CASCADE |
| public.mql_qualifications | mql_qualifications_qualified_by_fkey | qualified_by | SET NULL |
| public.nps_surveys | nps_surveys_salesperson_id_fkey | salesperson_id | SET NULL |
| public.objections_library | objections_library_created_by_fkey | created_by | SET NULL |
| public.onboarding_journeys | onboarding_journeys_owner_salesperson_id_fkey | owner_salesperson_id | SET NULL |
| public.orders | orders_salesperson_id_fkey | salesperson_id | SET NULL |
| public.page_analytics | page_analytics_salesperson_id_fkey | salesperson_id | CASCADE |
| public.performance_bets | performance_bets_salesperson_id_fkey | salesperson_id | CASCADE |
| public.personal_assistant_nudges | personal_assistant_nudges_salesperson_id_fkey | salesperson_id | CASCADE |
| public.playbook_progress | playbook_progress_completed_by_fkey | completed_by | SET NULL |
| public.prize_wheel_spins | prize_wheel_spins_salesperson_id_fkey | salesperson_id | CASCADE |
| public.progressive_goals | progressive_goals_salesperson_id_fkey | salesperson_id | CASCADE |
| public.prospect_cadences | prospect_cadences_salesperson_id_fkey | salesperson_id | SET NULL |
| public.qbr_reports | qbr_reports_salesperson_id_fkey | salesperson_id | SET NULL |
| public.qbr_schedule | qbr_schedule_owner_salesperson_id_fkey | owner_salesperson_id | SET NULL |
| public.quota_attainment_alerts | quota_attainment_alerts_salesperson_id_fkey | salesperson_id | CASCADE |
| public.quota_attainment_forecasts | quota_attainment_forecasts_salesperson_id_fkey | salesperson_id | CASCADE |
| public.quota_attainment_predictions | quota_attainment_predictions_salesperson_id_fkey | salesperson_id | CASCADE |
| public.quotes | quotes_created_by_fkey | created_by | SET NULL |
| public.race_badges | race_badges_salesperson_id_fkey | salesperson_id | CASCADE |
| public.race_cars | race_cars_salesperson_id_fkey | salesperson_id | CASCADE |
| public.race_events | race_events_salesperson_id_fkey | salesperson_id | CASCADE |
| public.race_powerups | race_powerups_salesperson_id_fkey | salesperson_id | CASCADE |
| public.race_seasons | race_seasons_winner_id_fkey | winner_id | SET NULL |
| public.rank_change_notifications | rank_change_notifications_overtaken_by_id_fkey | overtaken_by_id | CASCADE |
| public.rank_change_notifications | rank_change_notifications_salesperson_id_fkey | salesperson_id | CASCADE |
| public.ranking_notifications | ranking_notifications_salesperson_id_fkey | salesperson_id | CASCADE |
| public.renewals | renewals_owner_salesperson_id_fkey | owner_salesperson_id | SET NULL |
| public.revenue_forecasts | revenue_forecasts_owner_id_fkey | owner_id | CASCADE |
| public.sale_notifications_audit | sale_notifications_audit_recipient_id_fkey | recipient_id | SET NULL |
| public.sale_notifications_audit | sale_notifications_audit_seller_id_fkey | seller_id | SET NULL |
| public.sales | sales_closer_id_fkey | closer_id | SET NULL |
| public.sales | sales_salesperson_id_fkey | salesperson_id | SET NULL |
| public.sales | sales_sdr_id_fkey | sdr_id | SET NULL |
| public.sales_battles | sales_battles_created_by_fkey | created_by | SET NULL |
| public.sales_battles | sales_battles_winner_id_fkey | winner_id | SET NULL |
| public.sales_goals | sales_goals_salesperson_id_fkey | salesperson_id | RESTRICT |
| public.sales_streaks | sales_streaks_salesperson_id_fkey | salesperson_id | CASCADE |
| public.sales_territories | sales_territories_current_owner_id_fkey | current_owner_id | SET NULL |
| public.salesperson_badges | salesperson_badges_salesperson_id_fkey | salesperson_id | CASCADE |
| public.salesperson_commission_configs | salesperson_commission_configs_salesperson_id_fkey | salesperson_id | CASCADE |
| public.salesperson_custom_field_values | salesperson_custom_field_values_salesperson_id_fkey | salesperson_id | CASCADE |
| public.salesperson_leagues | salesperson_leagues_salesperson_id_fkey | salesperson_id | CASCADE |
| public.salesperson_preferences | salesperson_preferences_salesperson_id_fkey | salesperson_id | CASCADE |
| public.salesperson_xp | salesperson_xp_salesperson_id_fkey | salesperson_id | CASCADE |
| public.score_change_logs | score_change_logs_salesperson_id_fkey | salesperson_id | CASCADE |
| public.skill_assessments | skill_assessments_salesperson_id_fkey | salesperson_id | CASCADE |
| public.skill_development_tracks | skill_development_tracks_salesperson_id_fkey | salesperson_id | CASCADE |
| public.tasks | tasks_salesperson_id_fkey | salesperson_id | CASCADE |
| public.team_closers | team_closers_closer_id_fkey | closer_id | CASCADE |
| public.teams | teams_sdr_id_fkey | sdr_id | SET NULL |
| public.territories | territories_current_owner_id_fkey | current_owner_id | SET NULL |
| public.territory_history | territory_history_salesperson_id_fkey | salesperson_id | CASCADE |
| public.tournament_matches | tournament_matches_player1_id_fkey | player1_id | SET NULL |
| public.tournament_matches | tournament_matches_player2_id_fkey | player2_id | SET NULL |
| public.tournament_matches | tournament_matches_winner_id_fkey | winner_id | SET NULL |
| public.tournament_participants | tournament_participants_salesperson_id_fkey | salesperson_id | CASCADE |
| public.tournaments | tournaments_created_by_fkey | created_by | SET NULL |
| public.victory_feed | victory_feed_salesperson_id_fkey | salesperson_id | CASCADE |
| public.weekly_matchups | weekly_matchups_salesperson_a_id_fkey | salesperson_a_id | CASCADE |
| public.weekly_matchups | weekly_matchups_salesperson_b_id_fkey | salesperson_b_id | CASCADE |
| public.weekly_matchups | weekly_matchups_winner_id_fkey | winner_id | SET NULL |
| public.workflow_rules | workflow_rules_salesperson_id_fkey | salesperson_id | CASCADE |
| public.xp_history | xp_history_salesperson_id_fkey | salesperson_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_salespeople_active_role | btree | is_active, role | não | sim |  | `CREATE INDEX idx_salespeople_active_role ON public.salespeople USING btree (is_active, role)` |
| idx_salespeople_auth_user_id | btree | auth_user_id | não | sim |  | `CREATE INDEX idx_salespeople_auth_user_id ON public.salespeople USING btree (auth_user_id)` |
| idx_salespeople_lower_email | btree |  | não | sim | `(email IS NOT NULL)` | `CREATE INDEX idx_salespeople_lower_email ON public.salespeople USING btree (lower(email)) WHERE (email IS NOT NULL)` |
| idx_salespeople_role | btree | role | não | sim |  | `CREATE INDEX idx_salespeople_role ON public.salespeople USING btree (role)` |
| idx_salespeople_squad_id | btree | squad_id | não | sim |  | `CREATE INDEX idx_salespeople_squad_id ON public.salespeople USING btree (squad_id)` |
| salespeople_auth_user_id_key | btree | auth_user_id | sim | sim |  | `CREATE UNIQUE INDEX salespeople_auth_user_id_key ON public.salespeople USING btree (auth_user_id)` |
| salespeople_email_key | btree | email | sim | sim |  | `CREATE UNIQUE INDEX salespeople_email_key ON public.salespeople USING btree (email)` |
| salespeople_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX salespeople_pkey ON public.salespeople USING btree (id)` |


## Policies (RLS)

### `Admin can update any salesperson`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins can insert salespeople`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Users can delete own salesperson record`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(auth_user_id = auth.uid())` |
| WITH CHECK |  |

### `Users can read own full salesperson data`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((auth_user_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Users can read own salesperson record`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((auth_user_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_salespeople_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
