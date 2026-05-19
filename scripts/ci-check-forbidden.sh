#!/bin/bash

# List of forbidden patterns
FORBIDDEN_PATTERNS=("LGPDConsentBanner" "InstallPrompt" "UpdatePrompt" "LGPD")

echo "Running CI Forbidden Patterns Check..."
EXIT_CODE=0

for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
  # Search all relevant files, excluding node_modules, .git, dist, and this script itself
  # We want to catch patterns in configs, templates, and assets too as requested.
  FOUND=$(find . -maxdepth 2 -not -path '*/.*' -not -path './node_modules*' -not -path './dist*' -not -name 'package*' -not -name 'scripts*' -type f -exec grep -lE "$pattern" {} +; \
           find src -type f -not -path '*/.*' -exec grep -lE "$pattern" {} +; \
           find public -type f -not -path '*/.*' -exec grep -lE "$pattern" {} +)
  
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
