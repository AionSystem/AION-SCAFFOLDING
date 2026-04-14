#!/usr/bin/env node
/**
 * AION Scaffold CLI v2.6.5
 * FORGE-Hardened — Intelligent tree-to-filesystem scaffolding for the command line.
 * Uses shared parser.js for consistency with web version.
 * 
 * @author Sheldon K. Salmon
 * @license MIT
 * @version 2.6.5
 */

const fs = require('fs');
const path = require('path');

// Import shared parser (single source of truth)
const {
  CONFIG,
  stripComments,
  isBinary,
  sanitizeProjectName,
  sanitizeName,
  auditTree,
  applyFixes,
  parseTree,
  calculateFQI,
  generatePlaceholder,
  exportAsJSON,
  exportAsTree,
  exportAsShellScript
} = require('./parser.js');

// ============================================================
// ANSI COLORS (zero-dependency)
// ============================================================
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

// ============================================================
// FILE SYSTEM WRITER
// ============================================================
function writeTree(tree, basePath, options = {}) {
  const { dryRun = false, includePlaceholders = true, projectName = 'my-project' } = options;
  const rootPath = path.join(basePath, sanitizeName(tree.name));
  
  if (!dryRun) {
    fs.mkdirSync(rootPath, { recursive: true });
  }
  
  let filesWritten = 0;
  let foldersCreated = 0;
  
  function write(node, currentPath) {
    const safeName = sanitizeName(node.name);
    const fullPath = path.join(currentPath, safeName);
    
    if (node.type === 'folder') {
      if (!dryRun) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      foldersCreated++;
      if (node.children) {
        node.children.forEach(c => write(c, fullPath));
      }
    } else {
      if (!dryRun) {
        const content = generatePlaceholder(node.name, fullPath, includePlaceholders, projectName);
        fs.writeFileSync(fullPath, content);
      }
      filesWritten++;
    }
  }
  
  if (tree.children) {
    tree.children.forEach(c => write(c, rootPath));
  }
  
  return { filesWritten, foldersCreated, rootPath };
}

// ============================================================
// CLI INTERFACE
// ============================================================
function printHelp() {
  console.log(`
${colors.cyan}${'═'.repeat(60)}${colors.reset}
${colors.cyan}AION SCAFFOLD CLI v2.6.5 — FORGE-Hardened${colors.reset}
Intelligent tree-to-filesystem scaffolding
${colors.cyan}${'═'.repeat(60)}${colors.reset}

USAGE:
  node cli.js --input <file> --output <dir> [options]
  cat tree.txt | node cli.js --pipe --output <dir> [options]
  npx aion-scaffold --input tree.txt

OPTIONS:
  --input, -i       Input tree file
  --output, -o      Output directory (default: ./scaffold-output)
  --name, -n        Project name (default: extracted from tree or "my-project")
  --pipe            Read tree from stdin
  --format, -f      Export format: files | json | tree | script | clean-tree (default: files)
  --audit           Run audit only (no file generation)
  --no-placeholders Generate empty files only (no placeholder content)
  --dry-run         Parse and validate without writing files
  --quiet, -q       Suppress warnings
  --verbose         Show detailed output including all warnings
  --help, -h        Show this help
  --version, -v     Show version

EXAMPLES:
  # Generate from file
  node cli.js --input my-tree.txt --output ./my-project --name my-app

  # Pipe from AI
  cat tree.txt | node cli.js --pipe --output ./my-project

  # Export as shell script (with placeholders)
  node cli.js --input tree.txt --format script > scaffold.sh

  # Export clean tree only
  node cli.js --input tree.txt --format clean-tree

  # Audit only (no file generation)
  node cli.js --input tree.txt --audit

  # Generate empty files only
  node cli.js --input tree.txt --no-placeholders

  # Validate only
  node cli.js --input tree.txt --dry-run

${colors.cyan}${'═'.repeat(60)}${colors.reset}
AionSystem · Sheldon K. Salmon · AI Reliability Architect
${colors.cyan}${'═'.repeat(60)}${colors.reset}
`);
}

function printVersion() {
  console.log(`${colors.green}AION Scaffold CLI v2.6.5 — FORGE-Hardened${colors.reset}`);
}

function parseArgs(args) {
  const options = {
    input: null,
    output: './scaffold-output',
    name: null,
    usePipe: false,
    format: 'files',
    auditOnly: false,
    includePlaceholders: true,
    dryRun: false,
    quiet: false,
    verbose: false
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--input' || arg === '-i') {
      options.input = args[++i];
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg === '--name' || arg === '-n') {
      options.name = args[++i];
    } else if (arg === '--pipe') {
      options.usePipe = true;
    } else if (arg === '--format' || arg === '-f') {
      options.format = args[++i];
    } else if (arg === '--audit') {
      options.auditOnly = true;
    } else if (arg === '--no-placeholders') {
      options.includePlaceholders = false;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--quiet' || arg === '-q') {
      options.quiet = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '--version' || arg === '-v') {
      printVersion();
      process.exit(0);
    }
  }
  
  return options;
}

function readInput(options) {
  if (options.usePipe) {
    return fs.readFileSync(0, 'utf-8');
  } else if (options.input) {
    if (!fs.existsSync(options.input)) {
      console.error(`${colors.red}❌ File not found: ${options.input}${colors.reset}`);
      process.exit(1);
    }
    return fs.readFileSync(options.input, 'utf-8');
  } else {
    console.error(`${colors.red}❌ No input specified. Use --input <file> or --pipe${colors.reset}`);
    printHelp();
    process.exit(1);
  }
}

// FORGE FIX: Updated to handle structured warnings
function printAuditReport(auditResult) {
  const { issues, fixable, manual, fixableCount, manualCount } = auditResult;
  
  console.log(`\n${colors.cyan}🔍 AUDIT REPORT${colors.reset}`);
  console.log(`${'─'.repeat(40)}`);
  
  if (fixable.length) {
    console.log(`${colors.green}✅ FIXABLE (${fixable.length})${colors.reset}`);
    fixable.slice(0, 5).forEach(i => {
      console.log(`   Line ${i.line || '—'}: ${i.type.replace(/_/g, ' ')}`);
    });
    if (fixable.length > 5) console.log(`   ${colors.dim}... and ${fixable.length - 5} more${colors.reset}`);
  }
  
  if (manual.length) {
    console.log(`\n${colors.yellow}⚠️  MANUAL (${manual.length})${colors.reset}`);
    manual.forEach(i => {
      console.log(`   ${i.message || i.type.replace(/_/g, ' ')}`);
    });
  }
  
  if (!issues.length) {
    console.log(`${colors.green}✅ No issues! Tree is clean.${colors.reset}`);
  }
  
  const fqi = calculateFQI(manualCount, fixableCount, 0);
  const fqiColor = fqi >= 0.90 ? colors.green : (fqi >= 0.80 ? colors.yellow : colors.red);
  console.log(`\n${colors.cyan}FQI: ${fqiColor}${fqi.toFixed(2)}${colors.reset} (${fixableCount} fixable, ${manualCount} manual)`);
  console.log(`${'─'.repeat(40)}`);
}

// FORGE FIX: Handle structured warnings from parseTree
function printParseWarnings(warnings, verbose) {
  if (!warnings.length) return;
  
  // Group warnings by severity
  const errors = warnings.filter(w => w.severity === 'error');
  const warns = warnings.filter(w => w.severity === 'warn');
  const infos = warnings.filter(w => w.severity === 'info');
  
  const limit = verbose ? warnings.length : Math.min(5, warnings.length);
  const displayWarnings = warnings.slice(0, limit);
  
  console.log(`\n${colors.yellow}⚠️  ${warnings.length} warning(s):${colors.reset}`);
  displayWarnings.forEach(w => {
    const color = w.severity === 'error' ? colors.red : (w.severity === 'warn' ? colors.yellow : colors.dim);
    const lineInfo = w.line ? `Line ${w.line}: ` : '';
    console.log(`   ${color}${lineInfo}${w.message}${colors.reset}`);
  });
  
  if (warnings.length > limit) {
    console.log(`   ${colors.dim}... and ${warnings.length - limit} more${colors.reset}`);
  }
  
  // Summary by severity if verbose
  if (verbose && (errors.length || warns.length || infos.length)) {
    console.log(`\n   ${colors.red}Errors: ${errors.length}${colors.reset} · ${colors.yellow}Warns: ${warns.length}${colors.reset} · ${colors.dim}Infos: ${infos.length}${colors.reset}`);
  }
}

// ============================================================
// MAIN
// ============================================================
function main() {
  const options = parseArgs(process.argv.slice(2));
  const treeContent = readInput(options);
  
  if (!treeContent.trim()) {
    console.error(`${colors.red}❌ Empty input${colors.reset}`);
    process.exit(1);
  }
  
  try {
    const projectName = options.name || 'my-project';
    const sanitizedName = sanitizeProjectName(projectName);
    
    // Run audit first
    if (!options.quiet) {
      console.log(`${colors.cyan}🌳 Auditing tree (project: ${sanitizedName})...${colors.reset}`);
    }
    
    const auditResult = auditTree(treeContent, sanitizedName);
    
    // Show audit report
    if (!options.quiet) {
      printAuditReport(auditResult);
    }
    
    // If audit-only, exit here
    if (options.auditOnly) {
      if (auditResult.manualCount > 0) {
        console.log(`${colors.yellow}⚠️  ${auditResult.manualCount} manual issues require attention.${colors.reset}`);
      }
      process.exit(0);
    }
    
    // Apply auto-fixes before parsing
    let processedContent = treeContent;
    let fixes = [];
    if (auditResult.fixable.length) {
      const fixResult = applyFixes(treeContent, auditResult.fixable);
      processedContent = fixResult.fixed;
      fixes = fixResult.fixes;
      if (!options.quiet && fixes.length) {
        console.log(`${colors.green}🔧 Auto-fixed: ${fixes.join('; ')}${colors.reset}`);
      }
    }
    
    // Parse
    if (!options.quiet) console.log(`${colors.cyan}📦 Parsing tree...${colors.reset}`);
    
    const parseResult = parseTree(processedContent, sanitizedName);
    const { root, fileCount, folderCount } = parseResult;
    const warnings = parseResult.warnings || [];
    
    if (!options.quiet) {
      console.log(`${colors.green}📁 ${folderCount} folders, 📄 ${fileCount} files${colors.reset}`);
      
      if (warnings.length) {
        printParseWarnings(warnings, options.verbose);
      }
    }
    
    // Handle export formats
    if (options.format === 'json') {
      console.log(exportAsJSON(root));
    } else if (options.format === 'tree') {
      console.log(exportAsTree(root));
    } else if (options.format === 'clean-tree') {
      console.log(exportAsTree(root));
    } else if (options.format === 'script') {
      console.log(exportAsShellScript(root, options.includePlaceholders, sanitizedName));
    } else if (options.format === 'files') {
      if (options.dryRun) {
        console.log(`\n${colors.cyan}🔍 Dry run — would create ${folderCount} folders and ${fileCount} files in ${options.output}/${root.name}${colors.reset}`);
      } else {
        console.log(`\n${colors.cyan}📂 Writing to ${options.output}...${colors.reset}`);
        const result = writeTree(root, options.output, { 
          includePlaceholders: options.includePlaceholders, 
          projectName: sanitizedName 
        });
        console.log(`${colors.green}✅ Scaffold complete! ${result.rootPath} created.${colors.reset}`);
        console.log(`   ${result.foldersCreated} folders, ${result.filesWritten} files written.`);
      }
    } else {
      console.error(`${colors.red}❌ Unknown format: ${options.format}${colors.reset}`);
      process.exit(1);
    }
    
  } catch (e) {
    console.error(`\n${colors.red}❌ Error: ${e.message}${colors.reset}`);
    process.exit(1);
  }
}

// Only run if executed directly
if (require.main === module) {
  main();
}

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  writeTree,
  printAuditReport,
  printParseWarnings
};