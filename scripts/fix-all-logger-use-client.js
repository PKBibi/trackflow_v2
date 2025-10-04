#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all files with logger import first
const command = `find app components -name "*.tsx" | xargs grep -l "^import { log } from '@/lib/logger';"`;

let files;
try {
  files = execSync(command, { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(f => f);
} catch (e) {
  console.log('No files found or error running command');
  process.exit(0);
}

console.log(`Found ${files.length} files to check\n`);

let fixedCount = 0;

files.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n');

  // Check if first line starts with logger import
  if (lines[0] && lines[0].startsWith("import { log } from '@/lib/logger'")) {
    // Check if second or third line is 'use client'
    const useClientIndex = lines.findIndex((line, idx) =>
      idx > 0 && idx < 5 && (line.trim() === "'use client'" || line.trim() === "'use client';")
    );

    if (useClientIndex > 0) {
      // Fix needed - swap logger import and use client
      const logImport = lines[0];
      const useClient = lines[useClientIndex];

      // Remove use client from its current position
      lines.splice(useClientIndex, 1);

      // Add use client at the top, then logger
      const newLines = [
        useClient.trim(),
        '',
        logImport.trim(),
        ...lines.slice(1)
      ];

      fs.writeFileSync(fullPath, newLines.join('\n'), 'utf-8');

      console.log(`✅ Fixed: ${filePath}`);
      fixedCount++;
    } else {
      console.log(`✓ Already correct or no 'use client': ${filePath}`);
    }
  }
});

console.log(`\n🎉 Fixed ${fixedCount} file(s)`);
