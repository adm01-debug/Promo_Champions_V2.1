#!/usr/bin/env bash
# =============================================================================
# ETAPA 5 — CORS Fix: Migrar 169 edge functions de corsHeaders estático
# para getCorsHeaders(req) dinâmico
#
# Uso: bash fix_cors.sh
# executado a partir da raiz do repo
# =============================================================================

set -euo pipefail

CORS_FILE="supabase/functions/_shared/cors.ts"

# Verificar que getCorsHeaders existe no ficheiro cors.ts
if ! grep -q "export function getCorsHeaders" "$CORS_FILE"; then
  echo "ERROR: getCorsHeaders nao encontrada em $CORS_FILE"
  exit 1
fi

count=0
skipped=0

# Processar cada ficheiro .ts na pasta functions
while IFS= read -r file; do
  # Ignorar _shared (nao sao handlers)
  if [[ "$file" == *"/_shared/"* ]]; then
    ((skipped++)) || true
    continue
  fi

  # Verificar se ja usa getCorsHeaders
  if grep -q "getCorsHeaders" "$file"; then
    ((skipped++)) || true
    continue
  fi

  # Verificar se usa corsHeaders estatico
  if ! grep -q "corsHeaders" "$file"; then
    ((skipped++)) || true
    continue
  fi

  # Backup antes de modificar
  cp "$file" "${file}.bak"

  # 1) Adicionar getCorsHeaders ao import (se ainda nao existe)
  if ! grep -q "getCorsHeaders" "$file"; then
    sed -i 's/import { corsHeaders } from "\.\.\/_shared\/cors\.ts";/import { corsHeaders, getCorsHeaders } from "\.\.\/_shared\/cors\.ts";/' "$file" 2>/dev/null || true
    # Se o caminho for diferente (_shared ao inves de ../_shared para subdirs)
    sed -i 's/import { corsHeaders } from "\.\.\/\.\.\/_shared\/cors\.ts";/import { corsHeaders, getCorsHeaders } from "\.\.\/\.\.\/_shared\/cors\.ts";/' "$file" 2>/dev/null || true
  fi

  # 2) Substituir { headers: corsHeaders } por { headers: getCorsHeaders(req) }
  # ONLY para linhas que tem Response — OPTIONS handlers nao recebem req no mesmo sitio
  # Entao fazer replacement cautious: so onde ha "new Response" ou "return"
  # Padrao seguro: quando corsHeaders aparece SOZINHO (sem variavel derivada)
  # Replace: { headers: corsHeaders } → { headers: getCorsHeaders(req) }
  # Excecao: linhas que ja tem getCorsHeaders(req) (ja verificado acima)

  # Usar perl para replacement multi-linha seguro
  perl -i -pe '
    s/\{ headers: corsHeaders \}/\{ headers: getCorsHeaders(req) \}/g;
  ' "$file"

  # Remover backup
  rm -f "${file}.bak"

  ((count++)) || true

done < <(find supabase/functions -name "index.ts" -type f)

echo "=== ETAPA 5 — CORS Fix Results ==="
echo "Ficheiros corrigidos: $count"
echo "Ignorados (ja corretos/nao aplicavelis): $skipped"
echo "NOTA: Verificar manualmente ficheiros com padroes nao standard."
echo "Execute: grep -r 'corsHeaders' supabase/functions --include='*.ts' | grep -v getCorsHeaders | head -20"
