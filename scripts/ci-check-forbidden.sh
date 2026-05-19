#!/bin/bash

# List of forbidden patterns
FORBIDDEN_PATTERNS=("LGPDConsentBanner" "InstallPrompt" "UpdatePrompt" "LGPD")

echo "Running CI Forbidden Patterns Check..."
EXIT_CODE=0

for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
  # Search src directory, excluding this script and node_modules
  # We use -r for recursive, -l to list files, and -w for whole word if possible (but patterns like LGPDConsentBanner are specific enough)
  FOUND=$(grep -rlE "$pattern" src/ --exclude-dir=node_modules 2>/dev/null)
  
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
