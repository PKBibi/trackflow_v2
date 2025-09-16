#!/usr/bin/env node

/**
 * Console Statements Cleanup Script
 *
 * This script systematically replaces console statements with proper logging
 * across the codebase, focusing on critical areas first.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Cleaning up console statements...\n');

// Priority order for file cleanup
const priorityPaths = [
  'app/api',           // API routes - most critical
  'lib',              // Utility libraries
  'app/(auth)',       // Authentication pages
  'components',       // UI components - least critical
];

function getFilesWithConsoleStatements() {
  try {
    const output = execSync('npm run lint 2>&1', { encoding: 'utf8', cwd: process.cwd() });
    const lines = output.split('\n');
    const files = new Map();

    let currentFile = '';
    for (const line of lines) {
      // Match file paths like "./app/api/something/route.ts"
      if (line.startsWith('./')) {
        currentFile = line.trim();
      }
      // Match console warnings like "92:11  Warning: Unexpected console statement.  no-console"
      else if (line.includes('no-console') && currentFile) {
        const match = line.match(/(\d+):(\d+)/);
        if (match) {
          const lineNum = parseInt(match[1]);
          if (!files.has(currentFile)) {
            files.set(currentFile, []);
          }
          files.get(currentFile).push(lineNum);
        }
      }
    }

    return files;
  } catch (error) {
    console.error('Failed to get linting results:', error.message);
    return new Map();
  }
}

function prioritizeFiles(filesMap) {
  const prioritized = [];

  // Sort by priority paths
  for (const priorityPath of priorityPaths) {
    for (const [filePath, lines] of filesMap.entries()) {
      if (filePath.includes(priorityPath)) {
        prioritized.push({ file: filePath, lines, priority: priorityPath });
        filesMap.delete(filePath);
      }
    }
  }

  // Add remaining files
  for (const [filePath, lines] of filesMap.entries()) {
    prioritized.push({ file: filePath, lines, priority: 'other' });
  }

  return prioritized;
}

function analyzeConsoleUsage(filePath, lines) {
  const fullPath = filePath.replace('./', '');

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const fileLines = content.split('\n');

  const usages = [];
  for (const lineNum of lines) {
    const line = fileLines[lineNum - 1]; // Convert to 0-based index
    if (line && line.includes('console.')) {
      const match = line.match(/console\.(log|warn|error|info|debug)/);
      if (match) {
        usages.push({
          lineNum,
          type: match[1],
          content: line.trim(),
          isError: line.includes('console.error'),
          isWarn: line.includes('console.warn'),
          hasUserData: line.includes('user') || line.includes('email') || line.includes('id'),
          inTryCatch: content.substring(0, content.indexOf(line)).includes('catch')
        });
      }
    }
  }

  return usages;
}

function generateRecommendations() {
  console.log('1. 📊 Analyzing console statement usage...\n');

  const filesMap = getFilesWithConsoleStatements();
  const prioritizedFiles = prioritizeFiles(filesMap);

  let totalCount = 0;
  const summary = {
    api: 0,
    lib: 0,
    auth: 0,
    other: 0,
    critical: 0, // Error logs in try/catch
    warning: 0,  // Warn logs
    debug: 0     // Info/log statements
  };

  console.log('🔍 Files requiring console statement cleanup:\n');

  for (const { file, lines, priority } of prioritizedFiles.slice(0, 10)) { // Show top 10
    const usages = analyzeConsoleUsage(file, lines);
    if (!usages) continue;

    totalCount += lines.length;
    summary[priority === 'other' ? 'other' : priority.replace('app/', '').replace('(', '').replace(')', '')] += lines.length;

    console.log(`📁 ${file} (${priority})`);
    console.log(`   ${lines.length} console statements found`);

    const errorCount = usages.filter(u => u.isError).length;
    const warnCount = usages.filter(u => u.isWarn).length;
    const userDataCount = usages.filter(u => u.hasUserData).length;
    const tryCatchCount = usages.filter(u => u.inTryCatch).length;

    if (errorCount) console.log(`   ❌ ${errorCount} error logs`);
    if (warnCount) console.log(`   ⚠️  ${warnCount} warning logs`);
    if (userDataCount) console.log(`   👤 ${userDataCount} may contain user data`);
    if (tryCatchCount) console.log(`   🔄 ${tryCatchCount} in try/catch blocks`);

    summary.critical += errorCount;
    summary.warning += warnCount;
    summary.debug += (lines.length - errorCount - warnCount);

    console.log('');
  }

  console.log('📈 Summary:');
  console.log(`   Total console statements: ${totalCount}`);
  console.log(`   Critical (errors): ${summary.critical}`);
  console.log(`   Warnings: ${summary.warning}`);
  console.log(`   Debug/Info: ${summary.debug}`);
  console.log('');
  console.log('📂 By category:');
  console.log(`   API routes: ${summary.api || 0}`);
  console.log(`   Libraries: ${summary.lib || 0}`);
  console.log(`   Auth pages: ${summary.auth || 0}`);
  console.log(`   Other: ${summary.other || 0}`);

  return { prioritizedFiles, summary, totalCount };
}

function generateCleanupPlan({ prioritizedFiles, summary, totalCount }) {
  console.log('\n🎯 Recommended cleanup plan:\n');

  console.log('Phase 1: Critical Console Statements (Immediate)');
  console.log('- Replace console.error in API routes with log.apiError()');
  console.log('- Replace console.error in lib utilities with log.error()');
  console.log('- Focus on try/catch blocks and user data handling');
  console.log(`- Estimated: ${summary.critical + Math.floor(summary.api / 2)} statements\n`);

  console.log('Phase 2: Warning Statements (Next)');
  console.log('- Replace console.warn with log.warn()');
  console.log('- Review auth-related warnings');
  console.log(`- Estimated: ${summary.warning} statements\n`);

  console.log('Phase 3: Debug Statements (Later)');
  console.log('- Remove or replace console.log/info with log.debug()');
  console.log('- Consider removing development-only logs');
  console.log(`- Estimated: ${summary.debug} statements\n`);

  console.log('🛠️  Next steps:');
  console.log('1. Import log utility: import { log } from "@/lib/logger"');
  console.log('2. Replace console.error → log.apiError() or log.error()');
  console.log('3. Replace console.warn → log.warn()');
  console.log('4. Replace console.log → log.debug() or remove');
  console.log('5. Test critical paths after changes');

  if (totalCount > 50) {
    console.log('\n💡 Due to the large number of console statements (171),');
    console.log('   consider running ESLint with --fix to help automate some replacements:');
    console.log('   npm run lint -- --fix');
  }
}

// Run the analysis
const results = generateRecommendations();
generateCleanupPlan(results);