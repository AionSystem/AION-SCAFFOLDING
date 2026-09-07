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
  TIER_TREES,
  TIER_MANIFESTS,
  DOCUMENT_TYPES,
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
  exportAsShellScript,
  buildHashManifest,
  buildNextSteps,
  validateAgainstTier
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
async function writeTree(tree, basePath, options = {}) {
  const {
    dryRun = false, includePlaceholders = true, projectName = 'my-project',
    tierManifestContent = '', docType = null, onHashProgress = null
  } = options;
  const rootPath = path.join(basePath, sanitizeName(tree.name));
  
  if (!dryRun) {
    fs.mkdirSync(rootPath, { recursive: true });
  }

  // Phase 1: decide every file's path and placeholder content up front
  // (without writing yet), so Hash_Manifest.txt — if the tree includes
  // one — can be filled with real digests of its siblings before
  // anything hits disk.
  const entries = []; // { fullPath, isDir, isHashManifest, content }
  function collect(node, currentPath) {
    const safeName = sanitizeName(node.name);
    const fullPath = path.join(currentPath, safeName);
    if (node.type === 'folder') {
      entries.push({ fullPath, isDir: true });
      (node.children || []).forEach(c => collect(c, fullPath));
    } else {
      const isHashManifest = node.name === 'Hash_Manifest.txt';
      const content = (includePlaceholders && !isHashManifest)
        ? generatePlaceholder(node.name, fullPath, includePlaceholders, projectName, docType, tierManifestContent)
        : '';
      entries.push({ fullPath, isDir: false, isHashManifest, content });
    }
  }
  (tree.children || []).forEach(c => collect(c, rootPath));

  const hashManifestEntry = entries.find(e => e.isHashManifest);
  const hashManifestRelPath = hashManifestEntry
    ? path.relative(basePath, hashManifestEntry.fullPath).split(path.sep).join('/')
    : null;

  // Tier_Manifest.txt and NEXT_STEPS.md land INSIDE the project root,
  // alongside the tree's own files — not as loose siblings of it.
  if (tierManifestContent) {
    entries.push({ fullPath: path.join(rootPath, 'Tier_Manifest.txt'), isDir: false, isHashManifest: false, content: includePlaceholders ? tierManifestContent : '' });
  }
  entries.push({ fullPath: path.join(rootPath, 'NEXT_STEPS.md'), isDir: false, isHashManifest: false, content: includePlaceholders ? buildNextSteps(tree.name, docType, tierManifestContent, hashManifestRelPath) : '' });

  // Phase 2: if a Hash_Manifest.txt is present anywhere in the tree,
  // compute real SHA-256 digests of every other file and fill it in.
  if (includePlaceholders && hashManifestEntry) {
    const hashable = entries.filter(e => !e.isDir && !e.isHashManifest).map(e => ({
      name: path.relative(basePath, e.fullPath).split(path.sep).join('/'),
      data: Buffer.from(e.content, 'utf8')
    }));
    hashManifestEntry.content = await buildHashManifest(hashable, onHashProgress);
  }

  // Phase 3: write everything to disk.
  let filesWritten = 0;
  let foldersCreated = 0;
  for (const e of entries) {
    if (e.isDir) {
      if (!dryRun) fs.mkdirSync(e.fullPath, { recursive: true });
      foldersCreated++;
    } else {
      if (!dryRun) {
        fs.mkdirSync(path.dirname(e.fullPath), { recursive: true });
        fs.writeFileSync(e.fullPath, e.content);
      }
      filesWritten++;
    }
  }
  
  return { filesWritten, foldersCreated, rootPath };
}

// ============================================================
// CLI INTERFACE
// ============================================================
function printHelp() {
  console.log(`
${colors.cyan}${'═'.repeat(60)}${colors.reset}
${colors.cyan}AION SCAFFOLD CLI v2.7.0 — FORGE-Hardened${colors.reset}
Intelligent tree-to-filesystem scaffolding
${colors.cyan}${'═'.repeat(60)}${colors.reset}

USAGE:
  node cli.js --input <file> --output <dir> [options]
  cat tree.txt | node cli.js --pipe --output <dir> [options]
  node cli.js --tier tier3 --output <dir>
  node cli.js --doctype policy --output <dir>
  npx aion-scaffold --input tree.txt

OPTIONS:
  --input, -i       Input tree file
  --output, -o      Output directory (default: ./scaffold-output)
  --name, -n        Project name (default: extracted from tree or "my-project")
  --pipe            Read tree from stdin
  --tier <key>      Load a tier package template (${Object.keys(TIER_TREES).join('|')})
                    Without --input/--pipe, generates the tier's canonical tree.
                    With --input/--pipe, validates your tree against that tier instead
                    and tags the output with Tier_Manifest.txt.
  --doctype <key>   Load a document-type template (${Object.keys(DOCUMENT_TYPES).join('|')})
                    Mutually exclusive with --tier. Tags placeholder content
                    (README, checklist, regulatory anchors) for that type.
  --force           Proceed with --format files/script even if --tier validation
                    finds missing required files
  --format, -f      Export format: files | json | tree | script | clean-tree (default: files)
  --audit           Run audit only (no file generation)
  --no-placeholders Generate empty files only (no placeholder content, no hashing)
  --dry-run         Parse and validate without writing files
  --quiet, -q       Suppress warnings
  --verbose         Show detailed output including all warnings
  --help, -h        Show this help
  --version, -v     Show version

Diagnostic/status output goes to stderr; --format json/tree/script/clean-tree
print only their payload to stdout, so redirection (> file) is always clean.

EXAMPLES:
  # Generate from file
  node cli.js --input my-tree.txt --output ./my-project --name my-app

  # Generate a Tier 3 deliverable package directly (no input tree needed)
  node cli.js --tier tier3 --output ./client-review --name AcmeCorp_Contract

  # Bring your own tree, but validate + tag it as a Tier 4 deliverable
  node cli.js --input my-tree.txt --tier tier4 --output ./out

  # Generate a Policy Audit skeleton with type-specific placeholders
  node cli.js --doctype policy --output ./policy-review

  # Pipe from AI
  cat tree.txt | node cli.js --pipe --output ./my-project

  # Export as shell script (with placeholders, real hashes, NEXT_STEPS.md)
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
  console.log(`${colors.green}AION Scaffold CLI v2.7.0 — FORGE-Hardened${colors.reset}`);
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
    verbose: false,
    tier: null,
    docType: null,
    force: false
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
    } else if (arg === '--tier') {
      options.tier = args[++i];
    } else if (arg === '--doctype') {
      options.docType = args[++i];
    } else if (arg === '--force') {
      options.force = true;
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
  
  console.error(`\n${colors.cyan}🔍 AUDIT REPORT${colors.reset}`);
  console.error(`${'─'.repeat(40)}`);
  
  if (fixable.length) {
    console.error(`${colors.green}✅ FIXABLE (${fixable.length})${colors.reset}`);
    fixable.slice(0, 5).forEach(i => {
      console.error(`   Line ${i.line || '—'}: ${i.type.replace(/_/g, ' ')}`);
    });
    if (fixable.length > 5) console.error(`   ${colors.dim}... and ${fixable.length - 5} more${colors.reset}`);
  }
  
  if (manual.length) {
    console.error(`\n${colors.yellow}⚠️  MANUAL (${manual.length})${colors.reset}`);
    manual.forEach(i => {
      console.error(`   ${i.message || i.type.replace(/_/g, ' ')}`);
    });
  }
  
  if (!issues.length) {
    console.error(`${colors.green}✅ No issues! Tree is clean.${colors.reset}`);
  }
  
  const fqi = calculateFQI(manualCount, fixableCount, 0);
  const fqiColor = fqi >= 0.90 ? colors.green : (fqi >= 0.80 ? colors.yellow : colors.red);
  console.error(`\n${colors.cyan}FQI: ${fqiColor}${fqi.toFixed(2)}${colors.reset} (${fixableCount} fixable, ${manualCount} manual)`);
  console.error(`${'─'.repeat(40)}`);
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
  
  console.error(`\n${colors.yellow}⚠️  ${warnings.length} warning(s):${colors.reset}`);
  displayWarnings.forEach(w => {
    const color = w.severity === 'error' ? colors.red : (w.severity === 'warn' ? colors.yellow : colors.dim);
    const lineInfo = w.line ? `Line ${w.line}: ` : '';
    console.error(`   ${color}${lineInfo}${w.message}${colors.reset}`);
  });
  
  if (warnings.length > limit) {
    console.error(`   ${colors.dim}... and ${warnings.length - limit} more${colors.reset}`);
  }
  
  // Summary by severity if verbose
  if (verbose && (errors.length || warns.length || infos.length)) {
    console.error(`\n   ${colors.red}Errors: ${errors.length}${colors.reset} · ${colors.yellow}Warns: ${warns.length}${colors.reset} · ${colors.dim}Infos: ${infos.length}${colors.reset}`);
  }
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.tier && options.docType) {
    console.error(`${colors.red}❌ --tier and --doctype are alternative starting points — pick one, not both.${colors.reset}`);
    process.exit(1);
  }
  if (options.tier && !TIER_TREES[options.tier]) {
    console.error(`${colors.red}❌ Unknown tier "${options.tier}". Valid: ${Object.keys(TIER_TREES).join(', ')}${colors.reset}`);
    process.exit(1);
  }
  if (options.docType && !DOCUMENT_TYPES[options.docType]) {
    console.error(`${colors.red}❌ Unknown document type "${options.docType}". Valid: ${Object.keys(DOCUMENT_TYPES).join(', ')}${colors.reset}`);
    process.exit(1);
  }

  // --tier / --doctype without --input/--pipe synthesize the tree
  // themselves; with --input/--pipe, the user's own tree is read and
  // --tier additionally gets validated against (see below).
  const hasOwnTree = Boolean(options.input || options.usePipe);
  const treeContent = (!hasOwnTree && options.tier) ? TIER_TREES[options.tier]
    : (!hasOwnTree && options.docType) ? DOCUMENT_TYPES[options.docType].tree
    : readInput(options);
  
  if (!treeContent.trim()) {
    console.error(`${colors.red}❌ Empty input${colors.reset}`);
    process.exit(1);
  }
  
  try {
    let projectName = options.name;
    if (!projectName) {
      if (options.tier && !hasOwnTree) projectName = `ClientName_Document_${options.tier.toUpperCase()}_Date`;
      else if (options.docType && !hasOwnTree) projectName = `${DOCUMENT_TYPES[options.docType].label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-project`;
      else projectName = 'my-project';
    }
    const sanitizedName = sanitizeProjectName(projectName);
    const tierManifestContent = options.tier ? (TIER_MANIFESTS[options.tier] || '') : '';
    
    // Run audit first
    if (!options.quiet) {
      console.error(`${colors.cyan}🌳 Auditing tree (project: ${sanitizedName})...${colors.reset}`);
    }
    
    const auditResult = auditTree(treeContent, sanitizedName);
    
    // Show audit report
    if (!options.quiet) {
      printAuditReport(auditResult);
    }
    
    // If audit-only, exit here
    if (options.auditOnly) {
      if (auditResult.manualCount > 0) {
        console.error(`${colors.yellow}⚠️  ${auditResult.manualCount} manual issues require attention.${colors.reset}`);
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
        console.error(`${colors.green}🔧 Auto-fixed: ${fixes.join('; ')}${colors.reset}`);
      }
    }
    
    // Parse
    if (!options.quiet) console.error(`${colors.cyan}📦 Parsing tree...${colors.reset}`);
    
    const parseResult = parseTree(processedContent, sanitizedName);
    const { root, fileCount, folderCount } = parseResult;
    const warnings = parseResult.warnings || [];
    
    if (!options.quiet) {
      console.error(`${colors.green}📁 ${folderCount} folders, 📄 ${fileCount} files${colors.reset}`);
      
      if (warnings.length) {
        printParseWarnings(warnings, options.verbose);
      }
    }

    // Tier structural validation — runs whenever --tier is given, whether
    // the tree was synthesized from the tier or brought in via --input/--pipe.
    let tierIssues = null;
    if (options.tier) {
      tierIssues = validateAgainstTier(root, options.tier);
      if (!options.quiet && tierIssues) {
        if (tierIssues.missing.length || tierIssues.extra.length) {
          console.error(`\n${colors.cyan}🔍 ${options.tier.toUpperCase()} STRUCTURE CHECK${colors.reset}`);
          if (tierIssues.missing.length) {
            console.error(`${colors.red}Missing (${tierIssues.missing.length}):${colors.reset}`);
            tierIssues.missing.forEach(p => console.error(`   − ${p}`));
          }
          if (tierIssues.extra.length) {
            console.error(`${colors.yellow}Extra, not in template (${tierIssues.extra.length}):${colors.reset}`);
            tierIssues.extra.forEach(p => console.error(`   + ${p}`));
          }
        } else {
          console.error(`${colors.green}✅ Matches the ${options.tier.toUpperCase()} template exactly.${colors.reset}`);
        }
      }
    }

    // Block actual deliverable formats (files/script) on missing required
    // tier files unless --force or --dry-run. json/tree/clean-tree just warn
    // above — they're inspection formats, not the deliverable itself.
    const tierBlocked = tierIssues && tierIssues.missing.length > 0
      && !options.force && !options.dryRun
      && (options.format === 'files' || options.format === 'script');
    if (tierBlocked) {
      console.error(`\n${colors.red}❌ ${tierIssues.missing.length} item(s) required by ${options.tier.toUpperCase()} are missing. Re-run with --force to proceed anyway.${colors.reset}`);
      process.exit(1);
    }

    const onHashProgress = options.quiet ? null : (done, total) => {
      if (done === total || done % 25 === 0) {
        process.stderr.write(`\r${colors.cyan}🔐 Hashing… ${done}/${total} files${colors.reset}${done === total ? '\n' : ''}`);
      }
    };
    
    // Handle export formats
    if (options.format === 'json') {
      console.log(exportAsJSON(root));
    } else if (options.format === 'tree') {
      console.log(exportAsTree(root));
    } else if (options.format === 'clean-tree') {
      console.log(exportAsTree(root));
    } else if (options.format === 'script') {
      console.log(await exportAsShellScript(root, options.includePlaceholders, sanitizedName, options.docType, tierManifestContent));
    } else if (options.format === 'files') {
      if (options.dryRun) {
        console.error(`\n${colors.cyan}🔍 Dry run — would create ${folderCount} folders and ${fileCount} files in ${options.output}/${root.name}${colors.reset}`);
      } else {
        console.error(`\n${colors.cyan}📂 Writing to ${options.output}...${colors.reset}`);
        const result = await writeTree(root, options.output, { 
          includePlaceholders: options.includePlaceholders, 
          projectName: sanitizedName,
          tierManifestContent,
          docType: options.docType,
          onHashProgress
        });
        console.error(`${colors.green}✅ Scaffold complete! ${result.rootPath} created.${colors.reset}`);
        console.error(`   ${result.foldersCreated} folders, ${result.filesWritten} files written.`);
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
  main().catch(e => {
    console.error(`${colors.red}❌ Unexpected error: ${e.message}${colors.reset}`);
    process.exit(1);
  });
}

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  writeTree,
  printAuditReport,
  printParseWarnings
};
