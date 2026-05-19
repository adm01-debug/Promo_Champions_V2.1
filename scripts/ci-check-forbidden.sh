#!/bin/bash

# List of forbidden patterns
FORBIDDEN_PATTERNS=("LGPDConsentBanner" "InstallPrompt" "UpdatePrompt" "LGPD")

echo "Running CI Forbidden Patterns Check..."
EXIT_CODE=0

for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
  # Search all relevant files, excluding node_modules, .git, dist, docs, and non-source files
  # We use find to have more control over exclusions
  FOUND=$(find . -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/docs/*" \
    -not -path "*/supabase/functions/*" \
    -not -name "*.md" \
    -not -name "*.log" \
    -not -name "package.json" \
    -not -name "package-lock.json" \
    -not -name "ci-check-forbidden.sh" \
    -exec grep -lE "$pattern" {} + 2>/dev/null)
  
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
