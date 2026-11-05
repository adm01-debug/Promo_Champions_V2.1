# Relacionamentos (chaves estrangeiras)


| de | colunas | para | colunas | on delete | on update |
|---|---|---|---|---|---|
| public.account_activities | account_id | public.accounts | id | CASCADE | NO ACTION |
| public.account_activities | contact_id | public.account_contacts | id | SET NULL | NO ACTION |
| public.account_activities | salesperson_id | public.salespeople | id | SET NULL | NO ACTION |
| public.account_contacts | account_id | public.accounts | id | CASCADE | NO ACTION |
| public.account_contacts | sale_id | public.sales | id | SET NULL | NO ACTION |
| public.account_plans | account_id | public.accounts | id | CASCADE | NO ACTION |
| public.account_plans | created_by | auth.users | id | SET NULL | NO ACTION |
| public.accounts | owner_id | public.salespeople | id | SET NULL | NO ACTION |
| public.accounts | parent_account_id | public.accounts | id | SET NULL | NO ACTION |
| public.achievements | salesperson_id | public.salespeople | id | RESTRICT | NO ACTION |
| public.active_power_ups | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.active_sessions | user_id | auth.users | id | CASCADE | NO ACTION |
| public.activities | client_id | public.clients | id | SET NULL | NO ACTION |
| public.activities | deleted_by | auth.users | id | NO ACTION | NO ACTION |
| public.activities | sale_id | public.sales | id | SET NULL | NO ACTION |
| public.activities | salesperson_id | public.salespeople | id | SET NULL | NO ACTION |
| public.activity_audit_logs | activity_id | public.activities | id | CASCADE | NO ACTION |
| public.activity_audit_logs | changed_by | auth.users | id | SET NULL | NO ACTION |
| public.activity_goals | salesperson_id | public.salespeople | id | RESTRICT | NO ACTION |
| public.agenda_events | client_id | public.clients | id | SET NULL | NO ACTION |
| public.agenda_events | sale_id | public.sales | id | SET NULL | NO ACTION |
| public.agenda_events | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.ai_agent_actions | run_id | public.ai_agent_runs | id | CASCADE | NO ACTION |
| public.ai_sales_insights | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.api_tokens | team_id | public.teams | id | SET NULL | NO ACTION |
| public.approval_decisions | approver_id | auth.users | id | RESTRICT | NO ACTION |
| public.approval_decisions | request_id | public.approval_requests | id | CASCADE | NO ACTION |
| public.approval_requests | deal_id | public.sales | id | SET NULL | NO ACTION |
| public.approval_requests | requester_id | auth.users | id | NO ACTION | NO ACTION |
| public.approval_requests | workflow_id | public.approval_workflows | id | CASCADE | NO ACTION |
| public.approval_workflows | created_by | auth.users | id | SET NULL | NO ACTION |
| public.asset_usage_logs | asset_id | public.sales_enablement_assets | id | CASCADE | NO ACTION |
| public.audit_log | user_id | auth.users | id | SET NULL | NO ACTION |
| public.automation_runs | workflow_id | public.automation_workflows | id | CASCADE | NO ACTION |
| public.automation_workflows | created_by | auth.users | id | SET NULL | NO ACTION |
| public.available_spins | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.battle_participants | battle_id | public.sales_battles | id | CASCADE | NO ACTION |
| public.battle_participants | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.blocked_ips | blocked_by | auth.users | id | SET NULL | NO ACTION |
| public.buying_committee | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.buying_committee_members | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.buying_signals | company_id | public.enriched_company_intelligence | id | CASCADE | NO ACTION |
| public.cadence_ab_assignments | ab_test_id | public.cadence_ab_tests | id | CASCADE | NO ACTION |
| public.cadence_ab_assignments | prospect_cadence_id | public.prospect_cadences | id | CASCADE | NO ACTION |
| public.cadence_ab_tests | variant_a_id | public.cadences | id | CASCADE | NO ACTION |
| public.cadence_ab_tests | variant_b_id | public.cadences | id | CASCADE | NO ACTION |
| public.cadence_advanced_stats | cadence_id | public.cadences | id | CASCADE | NO ACTION |
| public.cadence_enrollment_rules | cadence_id | public.cadences | id | CASCADE | NO ACTION |
| public.cadence_funnel_rules | cadence_id | public.cadences | id | CASCADE | NO ACTION |
| public.cadence_outcome_rules | email_template_id | public.cadence_alert_templates | id | SET NULL | NO ACTION |
| public.cadence_outcome_rules | push_template_id | public.cadence_alert_templates | id | SET NULL | NO ACTION |
| public.cadence_steps | cadence_id | public.cadences | id | CASCADE | NO ACTION |
| public.cadence_tasks | cadence_step_id | public.cadence_steps | id | CASCADE | NO ACTION |
| public.cadence_tasks | prospect_cadence_id | public.prospect_cadences | id | CASCADE | NO ACTION |
| public.call_coaching_scorecards | recording_id | public.call_recordings | id | CASCADE | NO ACTION |
| public.call_conversation_metrics | recording_id | public.call_recordings | id | CASCADE | NO ACTION |
| public.call_critical_moments | recording_id | public.call_recordings | id | CASCADE | NO ACTION |
| public.call_critical_moments | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.call_insights | recording_id | public.call_recordings | id | CASCADE | NO ACTION |
| public.call_intelligence_triggers | target_asset_id | public.sales_enablement_assets | id | SET NULL | NO ACTION |
| public.call_logs | queue_item_id | public.dialer_queue_items | id | SET NULL | NO ACTION |
| public.call_logs | sale_id | public.sales | id | SET NULL | NO ACTION |
| public.call_objection_analysis | recording_id | public.call_recordings | id | CASCADE | NO ACTION |
| public.call_objections | recording_id | public.call_recordings | id | CASCADE | NO ACTION |
| public.call_question_analysis | recording_id | public.call_recordings | id | CASCADE | NO ACTION |
| public.call_questions | recording_id | public.call_recordings | id | CASCADE | NO ACTION |
| public.call_recordings | client_id | public.clients | id | SET NULL | NO ACTION |
| public.call_recordings | sale_id | public.sales | id | SET NULL | NO ACTION |
| public.call_recordings | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.call_sentiment_timeline | recording_id | public.call_recordings | id | CASCADE | NO ACTION |
| public.call_transcripts | recording_id | public.call_recordings | id | CASCADE | NO ACTION |
| public.campaign_health_alerts | job_id | public.email_bulk_jobs | id | CASCADE | NO ACTION |
| public.challenge_progress | challenge_id | public.weekly_challenges | id | CASCADE | NO ACTION |
| public.challenge_progress | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.channel_interactions | deal_id | public.sales | id | SET NULL | NO ACTION |
| public.channel_interactions | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.channel_interactions | template_id | public.message_templates | id | SET NULL | NO ACTION |
| public.chat_conversations | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.chat_messages | conversation_id | public.chat_conversations | id | CASCADE | NO ACTION |
| public.client_churn_alerts_state | last_task_id | public.tasks | id | SET NULL | NO ACTION |
| public.client_interactions | client_id | public.clients | id | CASCADE | NO ACTION |
| public.client_interactions | user_id | auth.users | id | SET NULL | NO ACTION |
| public.client_portfolio | assigned_by | public.salespeople | id | SET NULL | NO ACTION |
| public.client_portfolio | client_id | public.clients | id | CASCADE | NO ACTION |
| public.client_portfolio | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.client_renewals | client_id | public.clients | id | CASCADE | NO ACTION |
| public.clients | deleted_by | auth.users | id | NO ACTION | NO ACTION |
| public.clients | user_id | auth.users | id | SET NULL | NO ACTION |
| public.coaching_actions | recording_id | public.call_recordings | id | CASCADE | NO ACTION |
| public.coaching_actions | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.coaching_opportunities | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.coaching_sessions | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.combo_tracking | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.commercial_approval_requests | approver_id | auth.users | id | SET NULL | NO ACTION |
| public.commercial_approval_requests | requester_id | auth.users | id | SET NULL | NO ACTION |
| public.commission_bonus_awards | bonus_id | public.commission_bonuses | id | CASCADE | NO ACTION |
| public.commission_bonus_awards | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.commission_bonuses | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.commission_rules | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.commissions | rule_id | public.commission_rules | id | SET NULL | NO ACTION |
| public.commissions | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.commissions | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.committee_coverage_history | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.committee_extraction_runs | recording_id | public.call_recordings | id | CASCADE | NO ACTION |
| public.committee_extraction_runs | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.competitive_chat_messages | matchup_id | public.weekly_matchups | id | CASCADE | NO ACTION |
| public.competitive_chat_messages | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.competitive_chat_messages | target_salesperson_id | public.salespeople | id | SET NULL | NO ACTION |
| public.competitor_mentions | competitor_id | public.competitors_registry | id | SET NULL | NO ACTION |
| public.competitor_mentions | recording_id | public.call_recordings | id | CASCADE | NO ACTION |
| public.competitors_pricing | competitor_id | public.competitors_registry | id | CASCADE | NO ACTION |
| public.competitors_pricing | product_id | public.products | id | CASCADE | NO ACTION |
| public.consent_records | subject_client_id | public.clients | id | SET NULL | NO ACTION |
| public.consent_records | subject_id | auth.users | id | SET NULL | NO ACTION |
| public.conversation_analyses | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.critical_moment_notifications | moment_id | public.call_critical_moments | id | CASCADE | NO ACTION |
| public.cs_tickets | assigned_to | auth.users | id | SET NULL | NO ACTION |
| public.cs_tickets | client_id | public.clients | id | CASCADE | NO ACTION |
| public.csat_ces_surveys | account_id | public.accounts | id | CASCADE | NO ACTION |
| public.daily_challenge_progress | challenge_id | public.daily_challenges | id | CASCADE | NO ACTION |
| public.daily_challenge_progress | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.daily_streak_achievements | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.dashboard_layouts | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.data_access_log | user_id | auth.users | id | SET NULL | NO ACTION |
| public.data_subject_requests | subject_client_id | public.clients | id | SET NULL | NO ACTION |
| public.data_subject_requests | subject_id | auth.users | id | SET NULL | NO ACTION |
| public.deal_chat_history | deal_id | public.sales | id | CASCADE | NO ACTION |
| public.deal_chat_history | salesperson_id | public.salespeople | id | SET NULL | NO ACTION |
| public.deal_committee_coverage | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.deal_health_history | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.deal_health_scores | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.deal_outcomes | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.deal_outcomes | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.deal_probability_scores | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.deal_risk_signals | resolved_by | public.salespeople | id | SET NULL | NO ACTION |
| public.deal_risk_signals | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.deal_stage_history | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.deal_stage_transitions | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.deal_stakeholders | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.deal_velocity_alerts | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.deal_velocity_predictions | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.demand_forecasts | product_id | public.products | id | CASCADE | NO ACTION |
| public.dialer_queue_items | queue_id | public.dialer_queues | id | CASCADE | NO ACTION |
| public.dialer_queue_items | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.digital_signatures | created_by | public.salespeople | id | SET NULL | NO ACTION |
| public.document_signers | document_id | public.digital_signatures | id | CASCADE | NO ACTION |
| public.email_bulk_drafts | job_id | public.email_bulk_jobs | id | CASCADE | NO ACTION |
| public.email_engagement_score_history | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.email_engagement_scores | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.email_tracking_events | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.email_tracking_events | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.embedded_report_tokens | report_id | public.custom_reports | id | CASCADE | NO ACTION |
| public.entity_versions | changed_by | auth.users | id | SET NULL | NO ACTION |
| public.expansion_opportunities | account_id | public.accounts | id | CASCADE | NO ACTION |
| public.expansion_opportunities | owner_salesperson_id | public.salespeople | id | SET NULL | NO ACTION |
| public.expansion_opportunities | playbook_id | public.expansion_playbooks | id | SET NULL | NO ACTION |
| public.experiment_assignments | experiment_id | public.experiments | id | CASCADE | NO ACTION |
| public.experiment_assignments | user_id | auth.users | id | CASCADE | NO ACTION |
| public.experiment_assignments | variant_id | public.experiment_variants | id | CASCADE | NO ACTION |
| public.experiment_variants | experiment_id | public.experiments | id | CASCADE | NO ACTION |
| public.external_seller_map | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.feed_comments | feed_item_id | public.victory_feed | id | CASCADE | NO ACTION |
| public.feed_comments | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.feed_reactions | feed_item_id | public.victory_feed | id | CASCADE | NO ACTION |
| public.feed_reactions | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.follow_up_audit_logs | sale_id | public.sales | id | SET NULL | NO ACTION |
| public.follow_up_audit_logs | user_id | auth.users | id | SET NULL | NO ACTION |
| public.follow_up_notifications | audit_log_id | public.follow_up_audit_logs | id | SET NULL | NO ACTION |
| public.follow_up_notifications | sale_id | public.sales | id | SET NULL | NO ACTION |
| public.follow_up_notifications | user_id | auth.users | id | SET NULL | NO ACTION |
| public.follow_up_settings | current_whatsapp_version_id | public.whatsapp_template_versions | id | SET NULL | NO ACTION |
| public.follow_up_templates | created_by | auth.users | id | SET NULL | NO ACTION |
| public.follow_up_territory_rules | salesperson_id | auth.users | id | SET NULL | NO ACTION |
| public.follow_up_territory_rules | whatsapp_template_id | public.follow_up_templates | id | SET NULL | NO ACTION |
| public.forecast_accuracy | snapshot_id | public.forecast_snapshots | id | CASCADE | NO ACTION |
| public.forecast_deal_contributions | forecast_id | public.revenue_forecasts | id | CASCADE | NO ACTION |
| public.forecast_deal_contributions | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.geo_blocked_regions | blocked_by | auth.users | id | NO ACTION | NO ACTION |
| public.icp_data | client_id | public.clients | id | CASCADE | NO ACTION |
| public.inbound_reply_events | matched_enrollment_id | public.sequence_enrollments | id | SET NULL | NO ACTION |
| public.integration_health_checks | connection_id | public.integration_connections | id | CASCADE | NO ACTION |
| public.integration_secret_refs | credential_id | public.channel_credentials | id | CASCADE | NO ACTION |
| public.inventory_levels | product_id | public.products | id | CASCADE | NO ACTION |
| public.ip_whitelist | added_by | auth.users | id | SET NULL | NO ACTION |
| public.known_devices | user_id | auth.users | id | CASCADE | NO ACTION |
| public.kudos | from_salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.kudos | to_salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.lead_assignments | rule_id | public.lead_routing_rules | id | SET NULL | NO ACTION |
| public.lead_assignments | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.lead_assignments | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.lead_churn_risk | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.lead_detailed_logs | client_id | public.clients | id | CASCADE | NO ACTION |
| public.lead_detailed_logs | created_by | auth.users | id | SET NULL | NO ACTION |
| public.lead_routing_log | client_id | public.clients | id | SET NULL | NO ACTION |
| public.lead_routing_log | from_salesperson_id | public.salespeople | id | SET NULL | NO ACTION |
| public.lead_routing_log | to_salesperson_id | public.salespeople | id | SET NULL | NO ACTION |
| public.lead_score_explanations | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.lead_score_history | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.lead_scores | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.league_history | league_id | public.leagues | id | CASCADE | NO ACTION |
| public.league_history | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.league_members | league_id | public.leagues | id | CASCADE | NO ACTION |
| public.league_members | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.login_alerts | user_id | auth.users | id | CASCADE | NO ACTION |
| public.message_templates | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.mfa_verification_attempts | user_id | auth.users | id | CASCADE | NO ACTION |
| public.mood_entries | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.mql_qualifications | qualified_by | public.salespeople | id | SET NULL | NO ACTION |
| public.mql_qualifications | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.nps_surveys | sale_id | public.sales | id | SET NULL | NO ACTION |
| public.nps_surveys | salesperson_id | public.salespeople | id | SET NULL | NO ACTION |
| public.objection_library | best_response_recording_id | public.call_recordings | id | SET NULL | NO ACTION |
| public.objections_library | created_by | public.salespeople | id | SET NULL | NO ACTION |
| public.onboarding_journeys | account_id | public.accounts | id | CASCADE | NO ACTION |
| public.onboarding_journeys | owner_salesperson_id | public.salespeople | id | SET NULL | NO ACTION |
| public.onboarding_steps | journey_id | public.onboarding_journeys | id | CASCADE | NO ACTION |
| public.order_items | order_id | public.orders | id | CASCADE | NO ACTION |
| public.order_status_events | order_id | public.orders | id | CASCADE | NO ACTION |
| public.orders | client_id | public.clients | id | SET NULL | NO ACTION |
| public.orders | quote_id | public.quotes | id | SET NULL | NO ACTION |
| public.orders | salesperson_id | public.salespeople | id | SET NULL | NO ACTION |
| public.outbound_messages | enrollment_id | public.sequence_enrollments | id | SET NULL | NO ACTION |
| public.outbound_messages | step_id | public.sequence_steps | id | SET NULL | NO ACTION |
| public.page_analytics | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.password_history | user_id | auth.users | id | CASCADE | NO ACTION |
| public.password_reset_requests | user_id | auth.users | id | SET NULL | NO ACTION |
| public.performance_bets | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.personal_assistant_nudges | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.pipeline_coverage_recommendations | snapshot_id | public.pipeline_coverage_snapshots | id | CASCADE | NO ACTION |
| public.pipeline_inspection_snapshots | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.pipeline_inspections | inspector_id | auth.users | id | SET NULL | NO ACTION |
| public.pipeline_inspections | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.pipeline_stages | pipeline_id | public.pipelines | id | CASCADE | NO ACTION |
| public.playbook_items | asset_id | public.sales_enablement_assets | id | SET NULL | NO ACTION |
| public.playbook_items | playbook_id | public.playbooks | id | CASCADE | NO ACTION |
| public.playbook_progress | completed_by | public.salespeople | id | SET NULL | NO ACTION |
| public.playbook_progress | playbook_item_id | public.playbook_items | id | CASCADE | NO ACTION |
| public.playbook_progress | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.price_alerts | product_id | public.products | id | CASCADE | NO ACTION |
| public.price_alerts | supplier_id | public.suppliers | id | CASCADE | NO ACTION |
| public.price_history | product_id | public.products | id | CASCADE | NO ACTION |
| public.price_history | supplier_id | public.suppliers | id | CASCADE | NO ACTION |
| public.price_history | supplier_product_id | public.supplier_products | id | CASCADE | NO ACTION |
| public.price_protection_rules | product_id | public.products | id | CASCADE | NO ACTION |
| public.pricing_rules | product_id | public.products | id | CASCADE | NO ACTION |
| public.prize_wheel_spins | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.product_stock_log | product_id | public.products | id | CASCADE | NO ACTION |
| public.product_usage | client_id | public.clients | id | CASCADE | NO ACTION |
| public.product_usage_events | account_id | public.accounts | id | CASCADE | NO ACTION |
| public.product_usage_summary | account_id | public.accounts | id | CASCADE | NO ACTION |
| public.products | deleted_by | auth.users | id | NO ACTION | NO ACTION |
| public.progressive_goals | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.prospect_cadences | cadence_id | public.cadences | id | CASCADE | NO ACTION |
| public.prospect_cadences | enrolled_via_rule_id | public.cadence_enrollment_rules | id | SET NULL | NO ACTION |
| public.prospect_cadences | quote_id | public.quotes | id | CASCADE | NO ACTION |
| public.prospect_cadences | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.prospect_cadences | salesperson_id | public.salespeople | id | SET NULL | NO ACTION |
| public.push_subscriptions | user_id | auth.users | id | CASCADE | NO ACTION |
| public.qbr_reports | salesperson_id | public.salespeople | id | SET NULL | NO ACTION |
| public.qbr_schedule | account_id | public.accounts | id | CASCADE | NO ACTION |
| public.qbr_schedule | owner_salesperson_id | public.salespeople | id | SET NULL | NO ACTION |
| public.quota_attainment_actions | forecast_id | public.quota_attainment_forecasts | id | CASCADE | NO ACTION |
| public.quota_attainment_alerts | prediction_id | public.quota_attainment_predictions | id | CASCADE | NO ACTION |
| public.quota_attainment_alerts | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.quota_attainment_forecasts | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.quota_attainment_predictions | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.quote_items | product_id | public.products | id | SET NULL | NO ACTION |
| public.quote_items | quote_id | public.quotes | id | CASCADE | NO ACTION |
| public.quotes | client_id | public.clients | id | SET NULL | NO ACTION |
| public.quotes | created_by | public.salespeople | id | SET NULL | NO ACTION |
| public.quotes | sale_id | public.sales | id | SET NULL | NO ACTION |
| public.race_badges | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.race_badges | season_id | public.race_seasons | id | SET NULL | NO ACTION |
| public.race_cars | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.race_daily_snapshots | season_id | public.race_seasons | id | CASCADE | NO ACTION |
| public.race_events | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.race_events | season_id | public.race_seasons | id | CASCADE | NO ACTION |
| public.race_powerups | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.race_powerups | season_id | public.race_seasons | id | CASCADE | NO ACTION |
| public.race_rivalries_persistent | car_id | public.race_cars | id | CASCADE | NO ACTION |
| public.race_rivalries_persistent | rival_car_id | public.race_cars | id | CASCADE | NO ACTION |
| public.race_rivalries_persistent | season_id | public.race_seasons | id | CASCADE | NO ACTION |
| public.race_scoring_rules | season_id | public.race_seasons | id | CASCADE | NO ACTION |
| public.race_seasons | winner_id | public.salespeople | id | SET NULL | NO ACTION |
| public.race_team_members | car_id | public.race_cars | id | CASCADE | NO ACTION |
| public.race_team_members | team_id | public.race_teams | id | CASCADE | NO ACTION |
| public.race_teams | season_id | public.race_seasons | id | CASCADE | NO ACTION |
| public.race_user_daily_checkins | season_id | public.race_seasons | id | CASCADE | NO ACTION |
| public.race_user_daily_checkins | user_id | auth.users | id | CASCADE | NO ACTION |
| public.rank_change_notifications | overtaken_by_id | public.salespeople | id | CASCADE | NO ACTION |
| public.rank_change_notifications | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.ranking_notifications | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.reauthentication_requests | user_id | auth.users | id | CASCADE | NO ACTION |
| public.renewals | account_id | public.accounts | id | CASCADE | NO ACTION |
| public.renewals | owner_salesperson_id | public.salespeople | id | SET NULL | NO ACTION |
| public.report_embed_tokens | report_id | public.custom_reports | id | CASCADE | NO ACTION |
| public.report_executions | report_id | public.custom_reports | id | CASCADE | NO ACTION |
| public.report_executions | schedule_id | public.report_schedules | id | SET NULL | NO ACTION |
| public.report_schedules | report_id | public.custom_reports | id | CASCADE | NO ACTION |
| public.revenue_forecasts | owner_id | public.salespeople | id | CASCADE | NO ACTION |
| public.role_permissions | permission_id | public.permissions | id | CASCADE | NO ACTION |
| public.sale_notifications_audit | recipient_id | public.salespeople | id | SET NULL | NO ACTION |
| public.sale_notifications_audit | sale_id | public.sales | id | SET NULL | NO ACTION |
| public.sale_notifications_audit | seller_id | public.salespeople | id | SET NULL | NO ACTION |
| public.sales | account_id | public.accounts | id | SET NULL | NO ACTION |
| public.sales | client_id | public.clients | id | SET NULL | NO ACTION |
| public.sales | closer_id | public.salespeople | id | SET NULL | NO ACTION |
| public.sales | lost_to_competitor_id | public.competitors_registry | id | SET NULL | NO ACTION |
| public.sales | pipeline_id | public.pipelines | id | SET NULL | NO ACTION |
| public.sales | product_id | public.products | id | SET NULL | NO ACTION |
| public.sales | salesperson_id | public.salespeople | id | SET NULL | NO ACTION |
| public.sales | sdr_id | public.salespeople | id | SET NULL | NO ACTION |
| public.sales | territory_id | public.territories | id | SET NULL | NO ACTION |
| public.sales_battles | created_by | public.salespeople | id | SET NULL | NO ACTION |
| public.sales_battles | winner_id | public.salespeople | id | SET NULL | NO ACTION |
| public.sales_goals | salesperson_id | public.salespeople | id | RESTRICT | NO ACTION |
| public.sales_streaks | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.sales_territories | current_owner_id | public.salespeople | id | SET NULL | NO ACTION |
| public.salespeople | squad_id | public.squads | id | SET NULL | NO ACTION |
| public.salesperson_badges | badge_id | public.collectible_badges | id | CASCADE | NO ACTION |
| public.salesperson_badges | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.salesperson_commission_configs | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.salesperson_custom_field_values | field_id | public.team_custom_fields | id | CASCADE | NO ACTION |
| public.salesperson_custom_field_values | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.salesperson_leagues | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.salesperson_preferences | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.salesperson_xp | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.saved_filters | user_id | auth.users | id | CASCADE | NO ACTION |
| public.scheduled_report_runs | schedule_id | public.scheduled_reports | id | CASCADE | NO ACTION |
| public.scheduled_reports | report_id | public.custom_reports | id | CASCADE | NO ACTION |
| public.scheduled_sends | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.score_change_logs | api_token_id | public.api_tokens | id | SET NULL | NO ACTION |
| public.score_change_logs | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.sdr_alert_configs | user_id | auth.users | id | CASCADE | NO ACTION |
| public.sdr_performance_settings | user_id | auth.users | id | CASCADE | NO ACTION |
| public.security_events | user_id | auth.users | id | SET NULL | NO ACTION |
| public.send_time_profiles | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.sequence_enrollments | sequence_id | public.sequences | id | CASCADE | NO ACTION |
| public.sequence_step_assignments | enrollment_id | public.sequence_enrollments | id | CASCADE | NO ACTION |
| public.sequence_step_assignments | step_id | public.sequence_steps | id | CASCADE | NO ACTION |
| public.sequence_step_assignments | variant_id | public.sequence_step_variants | id | SET NULL | NO ACTION |
| public.sequence_step_executions | enrollment_id | public.sequence_enrollments | id | CASCADE | NO ACTION |
| public.sequence_step_executions | step_id | public.sequence_steps | id | CASCADE | NO ACTION |
| public.sequence_step_executions | variant_id | public.sequence_step_variants | id | SET NULL | NO ACTION |
| public.sequence_step_variants | step_id | public.sequence_steps | id | CASCADE | NO ACTION |
| public.sequence_steps | sequence_id | public.sequences | id | CASCADE | NO ACTION |
| public.session_activity | user_id | auth.users | id | CASCADE | NO ACTION |
| public.skill_assessments | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.skill_development_tracks | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.sla_violations | policy_id | public.sla_policies | id | SET NULL | NO ACTION |
| public.sla_violations | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.slow_query_alerts | acknowledged_by | auth.users | id | SET NULL | NO ACTION |
| public.sms_verification_codes | user_id | auth.users | id | CASCADE | NO ACTION |
| public.squad_members | squad_id | public.squads | id | CASCADE | NO ACTION |
| public.stock_movements | product_id | public.products | id | CASCADE | NO ACTION |
| public.supplier_order_items | order_id | public.supplier_orders | id | CASCADE | NO ACTION |
| public.supplier_order_items | product_id | public.products | id | SET NULL | NO ACTION |
| public.supplier_orders | supplier_id | public.suppliers | id | CASCADE | NO ACTION |
| public.supplier_products | product_id | public.products | id | CASCADE | NO ACTION |
| public.supplier_products | supplier_id | public.suppliers | id | CASCADE | NO ACTION |
| public.supplier_risk_assessments | supplier_id | public.suppliers | id | CASCADE | NO ACTION |
| public.suppliers | deleted_by | auth.users | id | NO ACTION | NO ACTION |
| public.support_tickets | account_id | public.accounts | id | CASCADE | NO ACTION |
| public.task_assignments | catalog_id | public.task_catalog | id | CASCADE | NO ACTION |
| public.task_assignments | squad_id | public.squads | id | SET NULL | NO ACTION |
| public.tasks | client_id | public.clients | id | CASCADE | NO ACTION |
| public.tasks | sale_id | public.sales | id | SET NULL | NO ACTION |
| public.tasks | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.tasks | source_insight_id | public.win_loss_insights | id | SET NULL | NO ACTION |
| public.team_closers | closer_id | public.salespeople | id | CASCADE | NO ACTION |
| public.team_closers | team_id | public.teams | id | CASCADE | NO ACTION |
| public.team_custom_fields | team_id | public.teams | id | CASCADE | NO ACTION |
| public.teams | deleted_by | auth.users | id | NO ACTION | NO ACTION |
| public.teams | sdr_id | public.salespeople | id | SET NULL | NO ACTION |
| public.territories | current_owner_id | public.salespeople | id | SET NULL | NO ACTION |
| public.territory_history | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.territory_history | territory_id | public.territories | id | CASCADE | NO ACTION |
| public.tournament_matches | player1_id | public.salespeople | id | SET NULL | NO ACTION |
| public.tournament_matches | player2_id | public.salespeople | id | SET NULL | NO ACTION |
| public.tournament_matches | tournament_id | public.tournaments | id | CASCADE | NO ACTION |
| public.tournament_matches | winner_id | public.salespeople | id | SET NULL | NO ACTION |
| public.tournament_participants | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.tournament_participants | tournament_id | public.tournaments | id | CASCADE | NO ACTION |
| public.tournaments | created_by | public.salespeople | id | SET NULL | NO ACTION |
| public.twilio_call_sessions | queue_item_id | public.dialer_queue_items | id | SET NULL | NO ACTION |
| public.twilio_call_sessions | sale_id | public.sales | id | SET NULL | NO ACTION |
| public.user_2fa | user_id | auth.users | id | CASCADE | NO ACTION |
| public.user_2fa_backup_codes | user_id | auth.users | id | CASCADE | NO ACTION |
| public.user_2fa_log | user_id | auth.users | id | CASCADE | NO ACTION |
| public.user_app_settings | user_id | auth.users | id | CASCADE | NO ACTION |
| public.user_mfa_settings | user_id | auth.users | id | CASCADE | NO ACTION |
| public.user_roles | user_id | auth.users | id | CASCADE | NO ACTION |
| public.v4_callback_dead_letters | quote_id | public.quotes | id | SET NULL | NO ACTION |
| public.victory_feed | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.webhook_deliveries | webhook_id | public.webhooks | id | CASCADE | NO ACTION |
| public.webhook_events | webhook_id | public.webhooks | id | CASCADE | NO ACTION |
| public.webhook_logs | webhook_id | public.webhooks | id | CASCADE | NO ACTION |
| public.webhooks | created_by | auth.users | id | SET NULL | NO ACTION |
| public.website_visitor_logs | consent_record_id | public.consent_records | id | SET NULL | NO ACTION |
| public.weekly_matchups | salesperson_a_id | public.salespeople | id | CASCADE | NO ACTION |
| public.weekly_matchups | salesperson_b_id | public.salespeople | id | CASCADE | NO ACTION |
| public.weekly_matchups | winner_id | public.salespeople | id | SET NULL | NO ACTION |
| public.whatsapp_conversations | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.whatsapp_conversations | sender_id | auth.users | id | SET NULL | NO ACTION |
| public.win_loss_analyses | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.win_loss_insight_comments | insight_id | public.win_loss_insights | id | CASCADE | NO ACTION |
| public.win_probability_deal_calibrations | sale_id | public.sales | id | CASCADE | NO ACTION |
| public.winloss_alert_settings | updated_by | auth.users | id | SET NULL | NO ACTION |
| public.winloss_webhook_alerts | subscription_id | public.winloss_webhook_subscriptions | id | CASCADE | NO ACTION |
| public.winloss_webhook_dead_letters | subscription_id | public.winloss_webhook_subscriptions | id | CASCADE | NO ACTION |
| public.winloss_webhook_deliveries | subscription_id | public.winloss_webhook_subscriptions | id | CASCADE | NO ACTION |
| public.winloss_webhook_replay_audit | dead_letter_id | public.winloss_webhook_dead_letters | id | CASCADE | NO ACTION |
| public.workflow_executions | workflow_id | public.workflows | id | CASCADE | NO ACTION |
| public.workflow_rules | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |
| public.xp_adjustments | related_assignment_id | public.task_assignments | id | SET NULL | NO ACTION |
| public.xp_history | salesperson_id | public.salespeople | id | CASCADE | NO ACTION |


_Diagrama omitido: mais de 120 tabelas._
