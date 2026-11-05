# Tipos customizados (enums, domains, composites)

| tipo | kind | valores / definição | usado em |
|---|---|---|---|
| public.activity_outcome | enum | connected, no_answer, scheduled, voicemail, busy, callback, not_interested, qualified, bad_timing, wrong_person, unsubscribed | public.activities.outcome, public.activities_active.outcome, public.v_active_activities.outcome |
| public.activity_type | enum | call, email, meeting, linkedin, whatsapp, other, note | public.activities.activity_type, public.activities_active.activity_type, public.v_active_activities.activity_type |
| public.app_role | enum | admin, manager, salesperson | public.role_permissions.role, public.user_roles.role |
| public.cadence_type | enum | prospecting, quote_followup | public.cadences.cadence_type |
| public.cs_survey_type | enum | csat, ces | public.csat_ces_surveys.survey_type |
| public.deal_status | enum | pending, qualified, proposal, negotiation, completed, lost | public.sales.deal_status |
| public.expansion_opp_status | enum | identified, qualified, proposed, won, lost | public.expansion_opportunities.status |
| public.expansion_type | enum | upsell, cross_sell, expansion | public.expansion_opportunities.type, public.expansion_playbooks.expansion_type |
| public.forecast_category | enum | commit, best_case, pipeline, omitted, closed | public.pipeline_inspections.forecast_category_at_inspection, public.sales.forecast_category |
| public.integration_health_status | enum | success, failure, degraded, pending | public.integration_health_checks.status |
| public.integration_kind | enum | database, bitrix24, n8n, mcp, webhook, other | public.integration_connections.kind |
| public.integration_source | enum | db, env, secret | public.integration_connections.source |
| public.integration_trigger | enum | manual, auto | public.integration_health_checks.triggered_by |
| public.onboarding_status | enum | not_started, in_progress, completed, stalled | public.onboarding_journeys.status |
| public.qbr_frequency | enum | monthly, quarterly, biannual, annual | public.qbr_schedule.frequency |
| public.renewal_status | enum | upcoming, at_risk, renewed, churned, lost | public.renewals.status |
| public.sales_league | enum | bronze, silver, gold, diamond | public.salesperson_leagues.league |
| public.salesperson_role | enum | sdr, closer, hybrid | public.competitive_ranking.role, public.mv_competitive_ranking.role, public.salespeople.role, public.salespeople_public.role |
| public.support_ticket_priority | enum | low, normal, high, urgent | public.support_tickets.priority |
| public.support_ticket_status | enum | open, pending, resolved, closed | public.support_tickets.status |
| public.task_assignment_status | enum | pending, in_progress, submitted, approved, rejected | public.task_assignments.status |
| public.task_difficulty | enum | easy, medium, hard, epic | public.task_catalog.difficulty |
| public.task_priority | enum | high, medium, low, urgent | public.tasks.priority, public.tasks_active.priority |
| public.task_status | enum | pending, in_progress, completed, cancelled | public.tasks.status, public.tasks_active.status |
| public.task_type | enum | call, meeting, follow_up, email, proposal, other, discount | public.tasks.task_type, public.tasks_active.task_type |
