#!/bin/bash
cd "$(dirname "$0")/.." || exit 1
T=.tmp/drift; mkdir -p "$T"
extract() {
  local file="$1"
  HEADER=$(grep -im1 "remote" "$file" || true)
  REMOTE_COL=$(printf '%s' "$HEADER" | awk -F'[|│]' '{for(i=1;i<=NF;i++){gsub(/[ \t]/,"",$i); if(tolower($i) ~ /^remote/) {print i; exit}}}')
  if [ -z "$REMOTE_COL" ]; then echo "ERRO: sem coluna Remote"; return 1; fi
  awk -F'[|│]' -v col="$REMOTE_COL" '{v=$col; gsub(/[^0-9]/,"",v); if(v ~ /^[0-9]{8,}$/) print v}' "$file" | sort -u
}

echo "--- formato unicode, Remote na col 2 ---"
cat > "$TMPDIR/ml1.txt" <<EOT
        Local       │     Remote      │     Time (UTC)
  ──────────────────┼─────────────────┼───────────────────
   20261001000000   │ 20261001000000  │ 2026-10-01 00:00
                    │ 20261018152917  │ 2026-10-18 15:29
EOT
extract "$TMPDIR/ml1.txt"

echo "--- formato ascii, Remote na col 1 (INVERTIDO) ---"
cat > "$TMPDIR/ml2.txt" <<EOT
 Remote | Local | Time (UTC)
 20261111000000 | 20261111000000 | x
EOT
extract "$TMPDIR/ml2.txt"

echo "--- sem header Remote ---"
cat > "$TMPDIR/ml3.txt" <<EOT
version applied at
20261111000000
EOT
extract "$TMPDIR/ml3.txt"; echo "exit=$?"
