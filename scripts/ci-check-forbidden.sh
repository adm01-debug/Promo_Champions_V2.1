#!/bin/bash

# List of forbidden patterns
FORBIDDEN_PATTERNS=("LGPDConsentBanner" "InstallPrompt" "UpdatePrompt" "LGPD")

echo "Running CI Forbidden Patterns Check..."
EXIT_CODE=0

for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
  # Search all relevant files, excluding node_modules, .git, dist, and this script
  # We check the root directory but exclude common non-source directories
  FOUND=$(grep -rlE "$pattern" . \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude-dir=dist \
    --exclude-dir=supabase/functions \
    --exclude="ci-check-forbidden.sh" \
    --exclude="package.json" \
    --exclude="package-lock.json" \
    --exclude="*.log" \
    2>/dev/null)
  
  if [ -n "$FOUND" ]; then
    echo "❌ Error: Forbidden pattern '$pattern' found in the following files:"
    echo "$FOUND"
    EXIT_CODE=1
  else
    echo "✅ Pattern '$pattern' not found."
  fi
done

if [ $EXIT_CODE -eq 0 ]; then
  echo "✨ CI Check passed! No forbidden patterns found."
else
  echo "🛑 CI Check failed! Please remove the forbidden patterns listed above."
fi

exit $EXIT_CODE
