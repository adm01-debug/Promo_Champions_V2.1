#!/usr/bin/env bash
# Executor das suites SQL de RLS/contrato (supabase/tests/).
#
# Modos:
#   static — verificações que não precisam de banco:
#     1. gate de higiene de migrations (scripts/check-migrations.mjs, quando
#        presente no checkout — entregue pelo pacote db-migration-hygiene);
#     2. matriz de cobertura public × suite (scripts/sql-coverage-matrix.mjs),
#        escrita em sql-coverage-matrix.md para upload como artefato.
#   remote — executa as suites contra o banco real via psql. Requer o secret
#     SUPABASE_DB_URL (postgres://postgres:<senha>@db.<ref>.supabase.co:5432/postgres
#     — em CI, preferir a URL do pooler IPv4, aws-<regiao>.pooler.supabase.com,
#     pois runners GitHub não alcançam o host direto db.<ref> que é IPv6-only).
#     Sem o secret, ou com o banco inalcançável: imprime o comando manual e sai
#     0 (skip com ::warning::), nunca reprova por credencial/conectividade.
#
# Uso:
#   scripts/run-sql-tests.sh static
#   SUPABASE_DB_URL=postgres://... scripts/run-sql-tests.sh remote
#   scripts/run-sql-tests.sh all        # static + remote (se houver secret)
set -u

cd "$(dirname "$0")/.."
MODE="${1:-all}"
FAILED=0

static_checks() {
  echo "[sql-tests] static — higiene de migrations"
  if [ -f scripts/check-migrations.mjs ]; then
    if [ -n "${GITHUB_BASE_REF:-}" ]; then
      node scripts/check-migrations.mjs --base "origin/${GITHUB_BASE_REF}" || FAILED=1
    else
      node scripts/check-migrations.mjs || FAILED=1
    fi
  else
    echo "::warning::scripts/check-migrations.mjs ainda não existe neste checkout — gate de higiene pulado (chega com o pacote db-migration-hygiene)."
  fi

  echo "[sql-tests] static — matriz de cobertura public × suite"
  node scripts/sql-coverage-matrix.mjs --output sql-coverage-matrix.md || FAILED=1
}

remote_suite_psql() {
  # Suites que rodam inteiras dentro de transação própria ou toleram -f direto.
  local file="$1"; shift
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 "$@" -f "supabase/tests/$file"
}

remote_checks() {
  if [ -z "${SUPABASE_DB_URL:-}" ]; then
    echo "::warning::SUPABASE_DB_URL não configurado — suites SQL remotas puladas."
    echo "::warning::Para rodar localmente: SUPABASE_DB_URL=postgres://postgres:<senha>@db.usyxfpqlsspldubptrdl.supabase.co:5432/postgres scripts/run-sql-tests.sh remote"
    return 0
  fi
  if ! command -v psql >/dev/null 2>&1; then
    echo "::error::SUPABASE_DB_URL presente mas psql não está instalado no runner."
    return 1
  fi

  # Pre-flight de conectividade: runners GitHub não alcançam o host direto
  # db.<ref>.supabase.co (IPv6-only) — é preciso a URL do pooler IPv4.
  if ! PGCONNECT_TIMEOUT=10 psql "$SUPABASE_DB_URL" -tAc 'select 1' >/dev/null 2>&1; then
    local host
    host=$(printf '%s' "$SUPABASE_DB_URL" | sed -E 's|.*@([^:/]+).*|\1|')
    echo "::warning::Banco inalcançável em $host — suites SQL remotas puladas."
    echo "::warning::Confira SUPABASE_DB_URL: hosts db.<ref>.supabase.co são IPv6-only; use a URL do pooler IPv4 (aws-<regiao>.pooler.supabase.com) do projeto usyxfpqlsspldubptrdl."
    return 0
  fi

  echo "[sql-tests] remote — rls_test_suite.sql (transacional, RLS das tabelas críticas)"
  remote_suite_psql rls_test_suite.sql || return 1

  echo "[sql-tests] remote — canonical_post_migration_assertions.sql (single-transaction)"
  psql "$SUPABASE_DB_URL" --single-transaction -v ON_ERROR_STOP=1 \
    -f supabase/tests/canonical_post_migration_assertions.sql || return 1

  echo "[sql-tests] remote — canonical_role_simulation.sql (single-transaction)"
  psql "$SUPABASE_DB_URL" --single-transaction -v ON_ERROR_STOP=1 \
    -f supabase/tests/canonical_role_simulation.sql || return 1

  echo "[sql-tests] remote — quote-to-sale-stress.sql (auto-descobre admin + salesperson)"
  ADMIN=$(psql "$SUPABASE_DB_URL" -tAc \
    "SELECT user_id FROM public.user_roles WHERE role='admin' LIMIT 1") || return 1
  SP=$(psql "$SUPABASE_DB_URL" -tAc \
    "SELECT id FROM public.salespeople LIMIT 1") || return 1
  if [ -z "$ADMIN" ] || [ -z "$SP" ]; then
    echo "::error::Não foi possível descobrir admin/salesperson para o stress de quote→sale."
    return 1
  fi
  remote_suite_psql quote-to-sale-stress.sql \
    -v admin_uuid="'$ADMIN'" -v salesperson_uuid="'$SP'" || return 1
}

case "$MODE" in
  static) static_checks ;;
  remote) remote_checks || FAILED=1 ;;
  all) static_checks; remote_checks || FAILED=1 ;;
  *) echo "modo desconhecido: $MODE (use static|remote|all)" >&2; exit 2 ;;
esac

if [ "$FAILED" -ne 0 ]; then
  echo "[sql-tests] FALHOU"
  exit 1
fi
echo "[sql-tests] ok"
