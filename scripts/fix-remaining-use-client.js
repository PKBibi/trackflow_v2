#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all .tsx files
const pattern = path.join(__dirname, '..', 'app', '**', '*.tsx');
const files = glob.sync(pattern, { nodir: true });

let fixedCount = 0;

files.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Check if first line is an import starting with logger
  if (lines[0] && lines[0].startsWith("import { log } from '@/lib/logger'")) {
    // Check if second line is 'use client'
    if (lines[1] && (lines[1].trim() === "'use client'" || lines[1].trim() === "'use client';")) {
      // Need to fix - swap them
      const logImport = lines[0];
      const useClient = lines[1];

      // Remove both lines
      lines.splice(0, 2);

      // Add them back in correct order
      lines.unshift(useClient);
      lines.unshift('');
      lines.unshift(logImport.replace("import { log } from '@/lib/logger';", "import { log } from '@/lib/logger';").trim());

      // Actually, let's do it properly
      const newLines = [
        useClient.trim(),
        '',
        logImport.trim(),
        ...lines
      ];

      const newContent = newLines.join('\n');
      fs.writeFileSync(filePath, newContent, 'utf-8');

      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
      fixedCount++;
    }
  }
});

console.log(`\n🎉 Fixed ${fixedCount} file(s)`);
