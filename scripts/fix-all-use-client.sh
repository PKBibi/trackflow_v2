#!/bin/bash

# Fix all 'use client' directive placements
# The directive must be at the top before any imports

files=(
  "app/(dashboard)/settings/security/page.tsx"
  "app/(dashboard)/settings/notifications/page.tsx"
  "app/(dashboard)/settings/team/page.tsx"
  "app/(dashboard)/settings/delete-account/page.tsx"
  "app/(dashboard)/timer/page.tsx"
  "app/(dashboard)/account-security/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Check first line
    first_line=$(head -n 1 "$file")
    if [[ "$first_line" == "import { log }"* ]]; then
      echo "Fixing: $file"
      # Remove use client from wherever it is
      sed -i "/^'use client'/d" "$file"
      # Add use client at the top
      sed -i "1i'use client'\n" "$file"
      echo "✅ Fixed: $file"
    else
      echo "✓ Already correct: $file"
    fi
  else
    echo "⚠️  Not found: $file"
  fi
done

echo "Done!"
