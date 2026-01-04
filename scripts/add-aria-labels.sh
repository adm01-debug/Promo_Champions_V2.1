#!/bin/bash
# Add ARIA labels to components

echo "Adding ARIA labels..."

# Find all button elements without aria-label
grep -r "<Button" src/components --include="*.tsx" | grep -v "aria-label" | while read -r line; do
  echo "Missing aria-label: $line"
done

# Find all input elements without aria-label
grep -r "<Input" src/components --include="*.tsx" | grep -v "aria-label" | while read -r line; do
  echo "Missing aria-label: $line"
done

echo "✅ ARIA label audit complete"
