#!/usr/bin/env node

/**
 * Fix 'use client' directive placement
 * The directive must be at the top of the file before any imports
 */

const fs = require('fs');
const path = require('path');

const files = [
  'app/(dashboard)/account-security/page.tsx',
  'app/(dashboard)/projects/page.tsx',
  'app/(dashboard)/reports/page.tsx',
  'app/(dashboard)/settings/api-keys/page.tsx',
  'app/(dashboard)/settings/delete-account/page.tsx',
  'app/(dashboard)/settings/export/page.tsx',
  'app/(dashboard)/settings/notifications/page.tsx',
  'app/(dashboard)/settings/profile/page.tsx',
  'app/(dashboard)/settings/security/page.tsx',
  'app/(dashboard)/settings/team/page.tsx',
  'app/(dashboard)/timer/page.tsx',
];

let fixedCount = 0;

files.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');

  // Check if file has 'use client' directive after imports
  const hasUseClient = content.includes("'use client'");
  const lines = content.split('\n');

  if (!hasUseClient) {
    console.log(`ℹ️  No 'use client' directive in: ${filePath}`);
    return;
  }

  // Find the line with 'use client'
  const useClientLineIndex = lines.findIndex(line => line.trim() === "'use client'" || line.trim() === "'use client';");

  if (useClientLineIndex === -1) {
    console.log(`ℹ️  Could not find 'use client' directive in: ${filePath}`);
    return;
  }

  // If 'use client' is already at the top (line 0 or 1), skip
  if (useClientLineIndex <= 1) {
    console.log(`✅ Already correct: ${filePath}`);
    return;
  }

  // Remove 'use client' from current position
  lines.splice(useClientLineIndex, 1);

  // Add 'use client' at the top
  const newContent = ["'use client'", '', ...lines].join('\n');

  fs.writeFileSync(fullPath, newContent, 'utf-8');

  console.log(`✅ Fixed: ${filePath}`);
  fixedCount++;
});

console.log(`\n🎉 Fixed ${fixedCount} file(s)`);
