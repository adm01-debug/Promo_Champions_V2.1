#!/bin/bash

# List of forbidden patterns
FORBIDDEN_PATTERNS=("LGPDConsentBanner" "InstallPrompt" "UpdatePrompt" "LGPD")

echo "Running CI Forbidden Patterns Check..."
EXIT_CODE=0

# Determine the script name to exclude it
SCRIPT_NAME=$(basename "$0")

for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
  # Search recursively, excluding directories and specific files
  # -r: recursive
  # -l: only list filenames
  # -E: extended regex
  FOUND=$(grep -rlE "$pattern" . \
    --exclude-dir={node_modules,.git,dist,docs} \
    --exclude={"$SCRIPT_NAME",package.json,package-lock.json,*.log})
  
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