
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = process.cwd();

function getFilesWithConsoleStatements() {
  console.log('Running linter to find files with console statements...');
  try {
    // We pipe stderr to stdout to capture the linting output
    const output = execSync('npm run lint 2>&1', { encoding: 'utf8' });
    const lines = output.split('\n');
    const files = new Set();
    let currentFile = '';

    for (const line of lines) {
        if (line.startsWith('./')) {
            currentFile = line.trim();
        }
        if (line.includes('no-console') && currentFile) {
            files.add(path.join(ROOT_DIR, currentFile));
        }
    }
    console.log(`Found ${files.size} files to fix.`);
    return [...files];
  } catch (error) {
    // The lint command might fail if there are other errors, but it still outputs the warnings we need.
    if (error.stdout) {
        const lines = error.stdout.split('\n');
        const files = new Set();
        let currentFile = '';
        for (const line of lines) {
            if (line.startsWith('./')) {
                currentFile = line.trim();
            }
            if (line.includes('no-console') && currentFile) {
                files.add(path.join(ROOT_DIR, currentFile));
            }
        }
        console.log(`Found ${files.size} files to fix in failed lint run.`);
        return [...files];
    }
    console.error('Failed to run linter or parse output:', error.message);
    return [];
  }
}

function fixFile(filePath) {
  console.log(`- Fixing ${path.relative(ROOT_DIR, filePath)}`);
  let content = fs.readFileSync(filePath, 'utf8');

  // Add logger import if not present
  if (!content.includes('@/lib/logger')) {
    // Add import at the top
    content = `import { log } from '@/lib/logger';\n${content}`;
  }

  // Replace console calls
  let replacements = 0;
  content = content.replace(/console\.error/g, () => { replacements++; return 'log.error'; });
  content = content.replace(/console\.warn/g, () => { replacements++; return 'log.warn'; });
  content = content.replace(/console\.log/g, () => { replacements++; return 'log.debug'; });
  content = content.replace(/console\.info/g, () => { replacements++; return 'log.debug'; });
  content = content.replace(/console\.debug/g, () => { replacements++; return 'log.debug'; });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  ... Replaced ${replacements} console statements.`);
}

function main() {
  const filesToFix = getFilesWithConsoleStatements();
  if (filesToFix.length === 0) {
    console.log('No files with console statements found.');
    return;
  }

  filesToFix.forEach(fixFile);

  console.log('\n✅ All files fixed. Running linter again to verify...');
  try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('\n🎉 Verification successful! No more console warnings.');
  } catch (error) {
    console.error('\n⚠️  Verification failed. Some console warnings may still exist.');
  }
}

main();
