#!/usr/bin/env node
/**
 * AION Scaffold CLI v1.0
 * Intelligent tree-to-filesystem scaffolding for the command line.
 * 
 * @author Sheldon K. Salmon
 * @license MIT
 * @version 1.0.0
 * 
 * Usage:
 *   node cli.js --input tree.txt --output ./my-project
 *   cat tree.txt | node cli.js --pipe --output ./my-project
 *   npx aion-scaffold --input tree.txt
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// CONFIGURATION
// ============================================================
const CONFIG = {
  MAX_FILES: 15000,
  MAX_FOLDERS: 7500,
  BINARY_EXTENSIONS: [
    'gguf', 'safetensors', 'png', 'jpg', 'jpeg', 'gif', 'ico', 
    'db', 'sqlite', 'bin', 'wasm', 'zip', 'tar', 'gz', 'webp', 
    'svg', 'mp4', 'mp3', 'wav', 'ttf', 'woff', 'woff2', 'eot'
  ]
};

// ============================================================
// UTILITIES
// ============================================================
function stripComments(line) {
  const m = line.match(/\s+[#\/]{1,2}\s+.+$/);
  return m ? line.substring(0, m.index).trimEnd() : line;
}

function isBinary(name) {
  const ext = name.split('.').pop()?.toLowerCase();
  return CONFIG.BINARY_EXTENSIONS.includes(ext);
}

// ============================================================
// PARSER (identical to web version)
// ============================================================
function parseTree(input) {
  const lines = input.split('\n').map(stripComments).filter(l => l.trim());
  if (!lines.length) throw new Error('Empty input');
  
  let rootName = 'project';
  const root = { name: rootName, type: 'folder', children: [] };
  const stack = [{ node: root, indent: -1 }];
  let fileCount = 0, folderCount = 1;
  const warnings = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const indent = line.search(/\S/);
    let content = line.trim();
    
    // Root declaration
    if (!content.match(/^[├└│]/) && !content.includes('─')) {
      if (content.match(/^[a-zA-Z0-9_-]+(\/)?$/)) {
        rootName = content.replace(/\/$/, '');
        root.name = rootName;
      }
      continue;
    }
    
    // Remove tree characters
    content = content.replace(/^[├└]──\s*/, '').replace(/^[│]\s*/, '');
    const isFolder = content.endsWith('/');
    const name = isFolder ? content.slice(0, -1).trim() : content.trim();
    if (!name) continue;
    
    // Validate name
    if (name.match(/[<>:"|?*]/)) {
      warnings.push(`Line ${i+1}: Invalid characters in "${name}" - sanitizing`);
    }
    
    // Pop stack to correct indent
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    
    const parent = stack[stack.length - 1].node;
    
    if (isFolder) {
      let folder = parent.children.find(c => c.type === 'folder' && c.name === name);
      if (!folder) {
        folder = { name, type: 'folder', children: [] };
        parent.children.push(folder);
        folderCount++;
        if (folderCount > CONFIG.MAX_FOLDERS) {
          throw new Error(`Too many folders (max ${CONFIG.MAX_FOLDERS})`);
        }
      } else {
        warnings.push(`Line ${i+1}: Merged duplicate folder "${name}"`);
      }
      stack.push({ node: folder, indent });
    } else {
      if (parent.children.some(c => c.type === 'file' && c.name === name)) {
        warnings.push(`Line ${i+1}: Duplicate file "${name}" skipped`);
        continue;
      }
      parent.children.push({ name, type: 'file' });
      fileCount++;
      if (fileCount > CONFIG.MAX_FILES) {
        throw new Error(`Too many files (max ${CONFIG.MAX_FILES})`);
      }
    }
  }
  
  return { root, fileCount, folderCount: folderCount - 1, warnings };
}

// ============================================================
// PLACEHOLDER GENERATION
// ============================================================
function sanitizeName(name) {
  return name.replace(/[<>:"|?*]/g, '-').replace(/\s+/g, '-');
}

function generatePlaceholder(name, fullPath) {
  if (isBinary(name)) {
    return `# ${fullPath}\n# BINARY PLACEHOLDER\n# Replace with actual ${name.split('.').pop()?.toUpperCase()} file\n`;
  }
  
  const ext = name.split('.').pop();
  const baseName = name.replace(/\.[^/.]+$/, '');
  
  if (baseName === 'index' && (ext === 'ts' || ext === 'js')) {
    return `// ${fullPath}\n// Barrel export\n\nexport * from './types';\nexport * from './processor';\n`;
  }
  
  if (name === 'package.json') {
    const pkgName = fullPath.replace(/\//g, '-').replace(/[^a-z0-9-]/g, '-') || 'project';
    return JSON.stringify({
      name: pkgName,
      version: "1.0.0",
      description: `AION Stack — ${fullPath}`,
      main: "index.js",
      private: true,
      scripts: {
        build: "tsc",
        dev: "tsc --watch",
        test: "jest"
      }
    }, null, 2);
  }
  
  if (name === 'tsconfig.json') {
    return JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "node",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true
      },
      include: ["src/**/*"],
      exclude: ["node_modules", "dist"]
    }, null, 2);
  }
  
  if (ext === 'md') {
    return `# ${baseName.replace(/-/g, ' ').toUpperCase()}\n\n## Overview\n\n[Generated by AION Scaffold CLI v1.0]\n\n---\n*Part of the AION Sovereign AI Stack*\n`;
  }
  
  if (ext === 'ts' || ext === 'js') {
    return `/**\n * ${fullPath}\n * Part of the AION Sovereign AI Stack\n * @module ${baseName}\n */\n\nexport {};\n`;
  }
  
  if (ext === 'yaml' || ext === 'yml') {
    return `# ${fullPath}\n# AION Configuration\n\nversion: "1.0"\n`;
  }
  
  if (ext === 'sql') {
    return `-- ${fullPath}\n-- AION Database Schema\n\n-- TODO: Define schema\n`;
  }
  
  if (ext === 'html') {
    return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${baseName} · AION</title>\n</head>\n<body>\n  <!-- ${fullPath} -->\n</body>\n</html>\n`;
  }
  
  if (ext === 'css') {
    return `/* ${fullPath} */\n/* AION Styles — Sovereign Design Language */\n\n:root {\n  --amber: #f0a500;\n  --cyan: #00d4ff;\n  --bg: #0a0a0f;\n}\n`;
  }
  
  if (name === '.gitignore') {
    return `node_modules/\ndist/\n.env\n*.gguf\n*.safetensors\ntraining_queue/\nquarantine/\nlogs/\n.DS_Store\n`;
  }
  
  return `# ${fullPath}\n# AION Scaffold placeholder\n`;
}

// ============================================================
// FILE SYSTEM WRITER
// ============================================================
function writeTree(tree, basePath, options = {}) {
  const { dryRun = false } = options;
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
        const content = generatePlaceholder(node.name, fullPath);
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
// EXPORT FORMATS
// ============================================================
function exportAsJSON(tree) {
  return JSON.stringify(tree, null, 2);
}

function exportAsTree(tree) {
  let output = `${tree.name}/\n`;
  
  function add(node, depth = 0, isLast = true, prefix = '') {
    if (depth === 0) {
      node.children?.forEach((c, i) => add(c, depth + 1, i === node.children.length - 1, ''));
      return;
    }
    
    const connector = isLast ? '└── ' : '├── ';
    output += prefix + connector + node.name + (node.type === 'folder' ? '/' : '') + '\n';
    
    if (node.type === 'folder' && node.children) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      node.children.forEach((c, i) => add(c, depth + 1, i === node.children.length - 1, newPrefix));
    }
  }
  
  add(tree);
  return output;
}

function exportAsShellScript(tree) {
  let script = '#!/bin/bash\n# Generated by AION Scaffold CLI v1.0\n# Author: Sheldon K. Salmon\n\n';
  
  function add(node, currentPath = '') {
    const safeName = sanitizeName(node.name);
    const fullPath = currentPath ? `${currentPath}/${safeName}` : safeName;
    
    if (node.type === 'folder') {
      script += `mkdir -p "${fullPath}"\n`;
      if (node.children) node.children.forEach(c => add(c, fullPath));
    } else {
      script += `touch "${fullPath}"\n`;
    }
  }
  
  const rootName = sanitizeName(tree.name);
  script += `mkdir -p "${rootName}"\n`;
  script += `cd "${rootName}"\n`;
  tree.children?.forEach(c => add(c, ''));
  script += `\necho "✅ Scaffold complete — ${rootName} created."\n`;
  
  return script;
}

// ============================================================
// CLI INTERFACE
// ============================================================
function printHelp() {
  console.log(`
${'═'.repeat(60)}
AION SCAFFOLD CLI v1.0
Intelligent tree-to-filesystem scaffolding
${'═'.repeat(60)}

USAGE:
  node cli.js --input <file> --output <dir> [options]
  cat tree.txt | node cli.js --pipe --output <dir> [options]
  npx aion-scaffold --input tree.txt

OPTIONS:
  --input, -i    Input tree file
  --output, -o   Output directory (default: ./scaffold-output)
  --pipe         Read tree from stdin
  --format, -f   Export format: files | json | tree | script (default: files)
  --dry-run      Parse and validate without writing files
  --quiet, -q    Suppress warnings
  --help, -h     Show this help
  --version, -v  Show version

EXAMPLES:
  # Generate from file
  node cli.js --input my-tree.txt --output ./my-project

  # Pipe from AI
  cat tree.txt | node cli.js --pipe --output ./my-project

  # Export as shell script
  node cli.js --input tree.txt --format script > scaffold.sh

  # Validate only
  node cli.js --input tree.txt --dry-run

${'═'.repeat(60)}
AionSystem · Sheldon K. Salmon · AI Reliability Architect
${'═'.repeat(60)}
`);
}

function printVersion() {
  console.log('AION Scaffold CLI v1.0.0');
}

function parseArgs(args) {
  const options = {
    input: null,
    output: './scaffold-output',
    usePipe: false,
    format: 'files',
    dryRun: false,
    quiet: false
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--input' || arg === '-i') {
      options.input = args[++i];
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg === '--pipe') {
      options.usePipe = true;
    } else if (arg === '--format' || arg === '-f') {
      options.format = args[++i];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--quiet' || arg === '-q') {
      options.quiet = true;
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
      console.error(`❌ File not found: ${options.input}`);
      process.exit(1);
    }
    return fs.readFileSync(options.input, 'utf-8');
  } else {
    console.error('❌ No input specified. Use --input <file> or --pipe');
    printHelp();
    process.exit(1);
  }
}

// ============================================================
// MAIN
// ============================================================
function main() {
  const options = parseArgs(process.argv.slice(2));
  const treeContent = readInput(options);
  
  if (!treeContent.trim()) {
    console.error('❌ Empty input');
    process.exit(1);
  }
  
  try {
    if (!options.quiet) console.log('🌳 Parsing tree...');
    
    const { root, fileCount, folderCount, warnings } = parseTree(treeContent);
    
    if (!options.quiet) {
      console.log(`📁 ${folderCount} folders, 📄 ${fileCount} files`);
      
      if (warnings.length && !options.quiet) {
        console.log(`\n⚠️  ${warnings.length} warning(s):`);
        warnings.forEach(w => console.log(`   ${w}`));
      }
    }
    
    // Handle export formats
    if (options.format === 'json') {
      console.log(exportAsJSON(root));
    } else if (options.format === 'tree') {
      console.log(exportAsTree(root));
    } else if (options.format === 'script') {
      console.log(exportAsShellScript(root));
    } else if (options.format === 'files') {
      if (options.dryRun) {
        console.log(`\n🔍 Dry run — would create ${folderCount} folders and ${fileCount} files in ${options.output}/${root.name}`);
      } else {
        console.log(`\n📂 Writing to ${options.output}...`);
        const result = writeTree(root, options.output);
        console.log(`✅ Scaffold complete! ${result.rootPath} created.`);
        console.log(`   ${result.foldersCreated} folders, ${result.filesWritten} files written.`);
      }
    } else {
      console.error(`❌ Unknown format: ${options.format}`);
      process.exit(1);
    }
    
  } catch (e) {
    console.error(`\n❌ Error: ${e.message}`);
    process.exit(1);
  }
}

// Only run if executed directly (not required as module)
if (require.main === module) {
  main();
}

// ============================================================
// EXPORTS (for testing / programmatic use)
// ============================================================
module.exports = {
  parseTree,
  writeTree,
  exportAsJSON,
  exportAsTree,
  exportAsShellScript,
  stripComments,
  isBinary,
  sanitizeName,
  generatePlaceholder
};