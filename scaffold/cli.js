#!/usr/bin/env node
/**
 * AION Scaffold CLI v1.0
 * Usage: node cli.js --input tree.txt --output ./my-project
 *        cat tree.txt | node cli.js --pipe --output ./my-project
 */

const fs = require('fs');
const path = require('path');

// ========== CONFIG ==========
const BINARY_EXTENSIONS = ['gguf', 'safetensors', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'db', 'sqlite', 'bin', 'wasm', 'zip', 'tar', 'gz'];

// ========== PARSER (identical to web version) ==========
function stripComments(line) {
  const m = line.match(/\s+[#\/]{1,2}\s+.+$/);
  return m ? line.substring(0, m.index).trimEnd() : line;
}

function isBinary(name) {
  const ext = name.split('.').pop()?.toLowerCase();
  return BINARY_EXTENSIONS.includes(ext);
}

function parseTree(input) {
  const lines = input.split('\n').map(stripComments).filter(l => l.trim());
  if (!lines.length) throw new Error('Empty input');
  
  let rootName = 'project';
  const root = { name: rootName, type: 'folder', children: [] };
  const stack = [{ node: root, indent: -1 }];
  let fileCount = 0, folderCount = 1;
  
  for (const line of lines) {
    const indent = line.search(/\S/);
    let content = line.trim();
    
    if (!content.match(/^[├└│]/) && !content.includes('─')) {
      if (content.match(/^[a-zA-Z0-9_-]+(\/)?$/)) {
        rootName = content.replace(/\/$/, '');
        root.name = rootName;
      }
      continue;
    }
    
    content = content.replace(/^[├└]──\s*/, '').replace(/^[│]\s*/, '');
    const isFolder = content.endsWith('/');
    const name = isFolder ? content.slice(0, -1).trim() : content.trim();
    if (!name) continue;
    
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1].node;
    
    if (isFolder) {
      let folder = parent.children.find(c => c.type === 'folder' && c.name === name);
      if (!folder) {
        folder = { name, type: 'folder', children: [] };
        parent.children.push(folder);
        folderCount++;
      }
      stack.push({ node: folder, indent });
    } else {
      if (parent.children.some(c => c.type === 'file' && c.name === name)) {
        console.warn(`⚠️  Duplicate file "${name}" skipped`);
        continue;
      }
      parent.children.push({ name, type: 'file' });
      fileCount++;
    }
  }
  
  return { root, fileCount, folderCount: folderCount - 1 };
}

// ========== FILE GENERATION ==========
function generatePlaceholder(name) {
  if (isBinary(name)) return `# BINARY PLACEHOLDER\n`;
  const ext = name.split('.').pop();
  if (name === 'package.json') return JSON.stringify({ name: 'project', version: '1.0.0', private: true }, null, 2);
  if (name === 'tsconfig.json') return JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'ESNext', strict: true } }, null, 2);
  if (ext === 'md') return `# ${name}\n`;
  return '';
}

function writeTree(tree, basePath) {
  function write(node, currentPath) {
    const fullPath = path.join(currentPath, node.name);
    
    if (node.type === 'folder') {
      fs.mkdirSync(fullPath, { recursive: true });
      if (node.children) node.children.forEach(c => write(c, fullPath));
    } else {
      const content = generatePlaceholder(node.name);
      fs.writeFileSync(fullPath, content);
    }
  }
  
  const rootPath = path.join(basePath, tree.name);
  fs.mkdirSync(rootPath, { recursive: true });
  if (tree.children) tree.children.forEach(c => write(c, rootPath));
}

// ========== CLI ==========
function printHelp() {
  console.log(`
AION Scaffold CLI v1.0

Usage:
  node cli.js --input <file> --output <dir>
  cat tree.txt | node cli.js --pipe --output <dir>
  node cli.js --help

Options:
  --input, -i    Input tree file
  --output, -o   Output directory (default: ./scaffold-output)
  --pipe         Read tree from stdin
  --help, -h     Show this help
`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }
  
  let input = '';
  let outputDir = './scaffold-output';
  let usePipe = false;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' || args[i] === '-i') input = args[++i];
    else if (args[i] === '--output' || args[i] === '-o') outputDir = args[++i];
    else if (args[i] === '--pipe') usePipe = true;
  }
  
  // Read input
  let treeContent;
  if (usePipe) {
    treeContent = fs.readFileSync(0, 'utf-8'); // stdin
  } else if (input) {
    if (!fs.existsSync(input)) {
      console.error(`❌ File not found: ${input}`);
      process.exit(1);
    }
    treeContent = fs.readFileSync(input, 'utf-8');
  } else {
    console.error('❌ No input specified. Use --input <file> or --pipe');
    printHelp();
    process.exit(1);
  }
  
  // Parse and generate
  try {
    console.log('🌳 Parsing tree...');
    const { root, fileCount, folderCount } = parseTree(treeContent);
    
    console.log(`📁 ${folderCount} folders, 📄 ${fileCount} files`);
    console.log(`📂 Writing to ${outputDir}...`);
    
    writeTree(root, outputDir);
    
    console.log(`✅ Scaffold complete! ${outputDir}/${root.name} created.`);
  } catch (e) {
    console.error(`❌ Error: ${e.message}`);
    process.exit(1);
  }
}

main();