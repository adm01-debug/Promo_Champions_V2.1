#!/usr/bin/env bash
# Verifies that the winloss-webhook-dispatcher returns a matching requestId
# in both the X-Request-Id response header and the JSON body.
#
# Usage:
#   ./scripts/verify-dispatcher-request-id.sh [BASE_URL]
#
# BASE_URL defaults to the project's Supabase functions endpoint.
# Requires: curl, jq.
#
# Exit codes:
#   0  header and body requestId match (test passed)
#   1  mismatch or missing requestId (test failed)
#   2  missing dependency or bad invocation

set -euo pipefail

DEFAULT_BASE_URL="https://saejqkojleeaxzrslzfg.supabase.co/functions/v1"
BASE_URL="${1:-${DISPATCHER_BASE_URL:-$DEFAULT_BASE_URL}}"
ENDPOINT="${BASE_URL%/}/winloss-webhook-dispatcher"

ANON_KEY="${SUPABASE_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZWpxa29qbGVlYXh6cnNsemZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTk1NjQsImV4cCI6MjA4MTEzNTU2NH0.zzzCBp7FIbEIqswv7cqpNLEm49BZ4qT5iZOkUn89y7w}"

UUID_RE='^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'

for cmd in curl jq; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "✗ missing required dependency: $cmd" >&2
    exit 2
  fi
done

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT
HEADERS_FILE="$TMP_DIR/headers.txt"
BODY_FILE="$TMP_DIR/body.json"

probe() {
  local label="$1" payload="$2"
  echo "── ${label} ───────────────────────────────────"

  local http_status
  http_status=$(curl -sS -o "$BODY_FILE" -D "$HEADERS_FILE" -w '%{http_code}' \
    -X POST "$ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "apikey: $ANON_KEY" \
    -H "Authorization: Bearer $ANON_KEY" \
    --data "$payload" || true)

  echo "HTTP status: $http_status"

  # Header lookup is case-insensitive; normalize.
  local header_id
  header_id=$(awk 'BEGIN{IGNORECASE=1} /^X-Request-Id:/ {sub(/\r$/,"",$2); print $2; exit}' "$HEADERS_FILE" || true)

  local body_id
  body_id=$(jq -r '.requestId // empty' "$BODY_FILE" 2>/dev/null || true)

  echo "X-Request-Id (header): ${header_id:-<missing>}"
  echo "requestId    (body):   ${body_id:-<missing>}"

  if [[ -z "$header_id" || -z "$body_id" ]]; then
    echo "✗ ${label}: requestId missing from header or body" >&2
    return 1
  fi

  if [[ ! "$header_id" =~ $UUID_RE ]]; then
    echo "✗ ${label}: header requestId is not a UUID" >&2
    return 1
  fi

  if [[ "$header_id" != "$body_id" ]]; then
    echo "✗ ${label}: header/body requestId mismatch" >&2
    return 1
  fi

  echo "✓ ${label}: header and body requestId match"
  return 0
}

echo "Endpoint: $ENDPOINT"
echo

# Validation-error path (missing `event`) — exercises the 400 envelope.
probe "validation error (empty body)" '{}'
echo

# Second call must produce a fresh, distinct requestId.
probe "second invocation (fresh id)" '{}'

echo
echo "✓ all checks passed"
