#!/usr/bin/env bash
# dev-kpis-as-role.sh
#
# Run `public.get_dashboard_kpis` against the live database while
# simulating a specific JWT identity, without needing a real browser
# session. Useful for validating the SECURITY INVOKER refactor.
#
# How it works:
#   Our RLS policies read identity from `auth.uid()`, which itself reads
#   `request.jwt.claims->>'sub'`. We set that claim inside a transaction
#   with `SET LOCAL`, then call the function and ROLLBACK.
#
# Requirements:
#   - psql in $PATH
#   - PG* env vars exported, OR a connection string in $DATABASE_URL
#   - Connecting role must be allowed to `SET LOCAL request.jwt.claims`
#     (managed Supabase: use the service role connection)
#
# Usage:
#   ./scripts/dev-kpis-as-role.sh <auth_user_uuid> [start] [end]
#
# Tip: find candidate UUIDs with
#   psql -c "select user_id, role from public.user_roles order by role"

set -euo pipefail

UID_ARG="${1:-}"
START="${2:-$(date -u +%Y-%m-01)}"
END="${3:-$(date -u -d "$(date -u +%Y-%m-01) +1 month -1 day" +%Y-%m-%d 2>/dev/null \
            || date -u -v1d -v+1m -v-1d +%Y-%m-%d)}"

if [[ -z "$UID_ARG" ]]; then
  echo "usage: $0 <auth_user_uuid> [start YYYY-MM-DD] [end YYYY-MM-DD]" >&2
  exit 64
fi

PSQL=(psql -X -v ON_ERROR_STOP=1
            -v "uid=$UID_ARG"
            -v "start=$START"
            -v "end=$END")
[[ -n "${DATABASE_URL:-}" ]] && PSQL+=("$DATABASE_URL")

"${PSQL[@]}" <<'SQL'
BEGIN;

-- Simulate the PostgREST request context. `auth.uid()` reads this claim.
SELECT set_config(
  'request.jwt.claims',
  json_build_object('sub', :'uid', 'role', 'authenticated')::text,
  true
);

-- What does the function actually see?
SELECT
  current_user                                                AS pg_role,
  (current_setting('request.jwt.claims', true)::jsonb->>'sub') AS jwt_sub,
  :'start'::date                                              AS period_start,
  :'end'::date                                                AS period_end;

-- KPI payload under this identity.
SELECT jsonb_pretty(
  public.get_dashboard_kpis(:'start'::date, :'end'::date)
) AS kpis;

ROLLBACK;
SQL
