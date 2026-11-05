# Realtime

## Publications

| publication | all tables | insert | update | delete | truncate |
|---|---|---|---|---|---|
| supabase_realtime | não | sim | sim | sim | sim |
| supabase_realtime_messages_publication | não | sim | sim | sim | sim |

## Tabelas publicadas (Postgres Changes)

| publication | tabela | replica identity |
|---|---|---|
| supabase_realtime | public.activities | default |
| supabase_realtime | public.ai_agent_runs | full |
| supabase_realtime | public.approval_requests | default |
| supabase_realtime | public.battle_participants | default |
| supabase_realtime | public.cadence_tasks | default |
| supabase_realtime | public.call_coaching_scorecards | full |
| supabase_realtime | public.call_conversation_metrics | default |
| supabase_realtime | public.call_critical_moments | full |
| supabase_realtime | public.call_metric_benchmarks | default |
| supabase_realtime | public.call_objection_analysis | full |
| supabase_realtime | public.call_objections | full |
| supabase_realtime | public.call_question_analysis | default |
| supabase_realtime | public.call_questions | default |
| supabase_realtime | public.coaching_opportunities | full |
| supabase_realtime | public.coaching_skill_benchmarks | full |
| supabase_realtime | public.commission_bonus_awards | full |
| supabase_realtime | public.committee_coverage_history | default |
| supabase_realtime | public.committee_extraction_runs | default |
| supabase_realtime | public.competitive_chat_messages | default |
| supabase_realtime | public.critical_moment_notifications | full |
| supabase_realtime | public.deal_chat_history | default |
| supabase_realtime | public.deal_committee_coverage | full |
| supabase_realtime | public.deal_health_history | full |
| supabase_realtime | public.deal_health_scores | full |
| supabase_realtime | public.deal_probability_scores | default |
| supabase_realtime | public.deal_stage_transitions | default |
| supabase_realtime | public.deal_stakeholders | full |
| supabase_realtime | public.deal_velocity_alerts | default |
| supabase_realtime | public.deal_velocity_predictions | full |
| supabase_realtime | public.forecast_accuracy | default |
| supabase_realtime | public.forecast_confidence_scores | default |
| supabase_realtime | public.forecast_deal_contributions | default |
| supabase_realtime | public.forecast_snapshots | default |
| supabase_realtime | public.kudos | default |
| supabase_realtime | public.league_members | default |
| supabase_realtime | public.notifications | full |
| supabase_realtime | public.objection_library | full |
| supabase_realtime | public.performance_bets | default |
| supabase_realtime | public.pipeline_coverage_recommendations | default |
| supabase_realtime | public.pipeline_coverage_snapshots | default |
| supabase_realtime | public.prize_wheel_spins | default |
| supabase_realtime | public.prospect_cadences | default |
| supabase_realtime | public.quota_attainment_actions | default |
| supabase_realtime | public.quota_attainment_alerts | default |
| supabase_realtime | public.quota_attainment_forecasts | default |
| supabase_realtime | public.quota_attainment_predictions | default |
| supabase_realtime | public.race_cars | default |
| supabase_realtime | public.race_events | default |
| supabase_realtime | public.race_powerups | default |
| supabase_realtime | public.race_reactions | full |
| supabase_realtime | public.race_scoring_rules | default |
| supabase_realtime | public.race_seasons | default |
| supabase_realtime | public.rank_change_notifications | default |
| supabase_realtime | public.ranking_notifications | full |
| supabase_realtime | public.revenue_forecasts | default |
| supabase_realtime | public.sales | default |
| supabase_realtime | public.sales_battles | default |
| supabase_realtime | public.sales_streaks | default |
| supabase_realtime | public.sales_territories | default |
| supabase_realtime | public.salesperson_badges | default |
| supabase_realtime | public.salesperson_coaching_aggregates | full |
| supabase_realtime | public.salesperson_xp | default |
| supabase_realtime | public.skill_assessments | full |
| supabase_realtime | public.skill_development_tracks | full |
| supabase_realtime | public.stage_bottleneck_insights | full |
| supabase_realtime | public.stage_conversion_metrics | full |
| supabase_realtime | public.stage_velocity_baselines | full |
| supabase_realtime | public.tournament_matches | default |
| supabase_realtime | public.v4_callback_dead_letters | default |
| supabase_realtime | public.victory_feed | default |
| supabase_realtime | public.win_calibration_buckets | default |
| supabase_realtime | public.win_loss_analyses | default |
| supabase_realtime | public.win_loss_insight_comments | default |
| supabase_realtime | public.win_loss_insights | default |
| supabase_realtime | public.win_loss_patterns | default |
| supabase_realtime | public.win_probability_calibrations | default |
| supabase_realtime | public.win_probability_deal_calibrations | default |
| supabase_realtime_messages_publication | realtime.messages_2026_11_01 |  |
| supabase_realtime_messages_publication | realtime.messages_2026_11_02 |  |
| supabase_realtime_messages_publication | realtime.messages_2026_11_03 |  |
| supabase_realtime_messages_publication | realtime.messages_2026_11_04 |  |
| supabase_realtime_messages_publication | realtime.messages_2026_11_05 |  |
| supabase_realtime_messages_publication | realtime.messages_2026_11_06 |  |
| supabase_realtime_messages_publication | realtime.messages_2026_11_07 |  |

## Broadcast / Presence (policies em realtime.messages)

| policy | cmd | roles | USING | WITH CHECK |
|---|---|---|---|---|
| Authenticated users can use realtime | ALL | authenticated | `true` | `true` |
| Scoped realtime subscriptions | ALL | authenticated | `((topic ~~ 'realtime:public:%'::text) OR (topic = ('user:'::text \|\| (auth.uid())::text)) OR (topic = ('presence:'::text \|\| (auth.uid())::text)))` | `((topic ~~ 'realtime:public:%'::text) OR (topic = ('user:'::text \|\| (auth.uid())::text)) OR (topic = ('presence:'::text \|\| (auth.uid())::text)))` |
