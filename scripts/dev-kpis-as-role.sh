#!/usr/bin/env bash
# dev-kpis-as-role.sh
#
# Run `public.get_dashboard_kpis` against the live database while
# simulating a specific role + user_id, *without* needing a real browser
# session. Useful for validating the SECURITY INVOKER refactor.
#
# How it works:
#   PostgREST and our RLS policies read identity from
#   `auth.uid()` (which itself reads `request.jwt.claims->>'sub'`)
#   and from the current Postgres role. We set both inside a single
#   transaction with `SET LOCAL`, then call the function.
#
# Requirements:
#   - psql in $PATH
#   - PG* env vars exported (PGHOST, PGUSER, PGPASSWORD, PGDATABASE)
#     OR a connection string passed via $DATABASE_URL.
#
# Usage:
#   ./scripts/dev-kpis-as-role.sh <pg_role> <auth_user_uuid> [start] [end]
#
# Examples:
#   ./scripts/dev-kpis-as-role.sh authenticated 11111111-1111-1111-1111-111111111111
#   ./scripts/dev-kpis-as-role.sh authenticated $UUID 2026-06-01 2026-06-30
#
# Tip: find candidate UUIDs with
#   psql -c "select user_id, role from public.user_roles order by role"

set -euo pipefail

ROLE="${1:-}"
UID_ARG="${2:-}"
START="${3:-$(date -u +%Y-%m-01)}"
END="${4:-$(date -u -d "$(date -u +%Y-%m-01) +1 month -1 day" +%Y-%m-%d 2>/dev/null \
            || date -u -v1d -v+1m -v-1d +%Y-%m-%d)}"

if [[ -z "$ROLE" || -z "$UID_ARG" ]]; then
  echo "usage: $0 <pg_role> <auth_user_uuid> [start YYYY-MM-DD] [end YYYY-MM-DD]" >&2
  exit 64
fi

PSQL=(psql -X -v ON_ERROR_STOP=1)
[[ -n "${DATABASE_URL:-}" ]] && PSQL+=("$DATABASE_URL")

"${PSQL[@]}" <<SQL
\set ON_ERROR_STOP on
BEGIN;

-- Simulate the PostgREST request context.
SET LOCAL role = '${ROLE}';
SET LOCAL request.jwt.claims = '{"sub":"${UID_ARG}","role":"${ROLE}"}';

-- Sanity check: what does the function see?
SELECT
  current_user                    AS pg_role,
  auth.uid()                      AS auth_uid,
  public.has_role(auth.uid(), 'admin'::app_role)       AS is_admin,
  public.has_role(auth.uid(), 'manager'::app_role)     AS is_manager,
  public.has_role(auth.uid(), 'salesperson'::app_role) AS is_salesperson;

-- The actual KPI payload.
SELECT jsonb_pretty(
  public.get_dashboard_kpis('${START}'::date, '${END}'::date)
) AS kpis;

ROLLBACK;
SQL
