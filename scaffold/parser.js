/**
 * AION Scaffold Shared Parser v2.6.1
 * Used by both web and CLI surfaces. Single source of truth.
 * 
 * @author Sheldon K. Salmon
 * @license MIT
 * @version 2.6.1
 */

// ============================================================
// CONFIGURATION
// ============================================================
const CONFIG = {
  MAX_FILES: 15000,
  MAX_FOLDERS: 7500,
  MAX_DEPTH: 100,
  MAX_INPUT_SIZE: 500000,
  BINARY_EXTENSIONS: [
    'gguf', 'safetensors', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'webp', 'svg',
    'db', 'sqlite', 'bin', 'wasm', 'zip', 'tar', 'gz', 'mp4', 'mp3', 'wav',
    'ttf', 'woff', 'woff2', 'eot', 'pdf', 'doc', 'docx', 'xls', 'xlsx'
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

function sanitizeProjectName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'my-project';
}

function sanitizeName(name) {
  return name.replace(/[<>:"|?*]/g, '-').replace(/\s+/g, '-').trim();
}

// ============================================================
// AUDIT ENGINE (Pre-detects all conflicts)
// ============================================================
function auditTree(input, projectName = 'my-project') {
  const issues = [];
  const lines = input.split('\n');
  const pathMap = new Map();
  let rootFound = false;
  let fixableCount = 0;
  let manualCount = 0;
  
  lines.forEach((line, idx) => {
    const raw = line;
    let p = stripComments(line);
    if (!p.trim()) return;
    
    const indent = p.search(/\S/);
    let content = p.trim();
    
    // Root detection
    if (idx === 0 && !content.match(/^[├└│]/) && !content.includes('─')) {
      rootFound = true;
    }
    
    // Mixed tabs/spaces
    if (raw.includes('\t') && raw.includes('    ')) {
      issues.push({ type: 'mixed_indent', line: idx+1, fixable: true });
      fixableCount++;
    }
    
    // Inline comments
    if (raw.match(/\s+[#\/]{1,2}\s+.+$/)) {
      issues.push({ type: 'has_comments', line: idx+1, fixable: true });
      fixableCount++;
    }
    
    // Missing tree characters
    if (!content.match(/^[├└│]/) && !content.includes('─') && !(idx === 0 && !rootFound)) {
      if (!content.match(/^[a-zA-Z0-9_-]+(\/)?$/)) {
        issues.push({ type: 'missing_tree_chars', line: idx+1, fixable: true });
        fixableCount++;
      }
    }
    
    // Extract name
    let name = content.replace(/^[├└]──\s*/, '').replace(/^[│]\s*/, '').trim();
    const isFolder = name.endsWith('/');
    name = isFolder ? name.slice(0, -1).trim() : name;
    
    // Invalid characters
    if (name && name.match(/[<>:"|?*]/)) {
      issues.push({ type: 'invalid_chars', line: idx+1, name, fixable: true });
      fixableCount++;
    }
    
    // File with trailing slash
    if (!isFolder && content.match(/[^\/]+\/$/)) {
      issues.push({ type: 'file_with_slash', line: idx+1, fixable: true });
      fixableCount++;
    }
  });
  
  // No root warning
  if (!rootFound) {
    issues.push({ 
      type: 'no_root', 
      line: 1, 
      fixable: false, 
      message: `No root declared. Using "${projectName}" as root. Add "my-app/" as first line to specify.` 
    });
    manualCount++;
  }
  
  // Inconsistent indentation
  const indentLevels = lines.map(l => stripComments(l)).filter(l => l.trim()).map(l => l.search(/\S/)).filter(i => i > 0);
  if (indentLevels.length && indentLevels.some(i => i % 4 !== 0)) {
    issues.push({ type: 'inconsistent_indent', fixable: true });
    fixableCount++;
  }
  
  // Pre-detect duplicate files and type conflicts
  const stack = [{ indent: -1, path: sanitizeProjectName(projectName) }];
  
  lines.forEach((line, idx) => {
    const p = stripComments(line);
    if (!p.trim()) return;
    
    const indent = p.search(/\S/);
    let content = p.trim();
    
    if (!content.match(/^[├└│]/) && !content.includes('─')) return;
    
    content = content.replace(/^[├└]──\s*/, '').replace(/^[│]\s*/, '').trim();
    const isFolder = content.endsWith('/');
    let name = isFolder ? content.slice(0, -1).trim() : content.trim();
    if (!name) return;
    name = sanitizeName(name);
    
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    
    const parentPath = stack[stack.length - 1].path;
    const fullPath = parentPath + '/' + name;
    
    if (pathMap.has(fullPath)) {
      const existing = pathMap.get(fullPath);
      if (existing.type !== (isFolder ? 'folder' : 'file')) {
        issues.push({
          type: 'type_conflict',
          line: idx+1,
          path: fullPath,
          fixable: false,
          message: `"${name}" exists as ${existing.type}, cannot create ${isFolder ? 'folder' : 'file'}`
        });
        manualCount++;
      } else if (!isFolder) {
        issues.push({
          type: 'duplicate_file',
          line: idx+1,
          path: fullPath,
          fixable: false,
          message: `Duplicate file "${name}" will be auto-renamed`
        });
        manualCount++;
      }
    } else {
      pathMap.set(fullPath, { type: isFolder ? 'folder' : 'file' });
    }
    
    if (isFolder) {
      stack.push({ indent, path: fullPath });
    }
  });
  
  const fixable = issues.filter(i => i.fixable);
  const manual = issues.filter(i => !i.fixable);
  
  return { issues, fixable, manual, fixableCount, manualCount };
}

// ============================================================
// APPLY FIXES
// ============================================================
function applyFixes(input, issues) {
  let lines = input.split('\n');
  const fixes = [];
  
  if (issues.some(i => i.type === 'has_comments')) {
    lines = lines.map(stripComments);
    fixes.push('Stripped comments');
  }
  
  if (issues.some(i => i.type === 'mixed_indent')) {
    lines = lines.map(l => l.replace(/\t/g, '    '));
    fixes.push('Converted tabs to spaces');
  }
  
  issues.filter(i => i.type === 'file_with_slash').forEach(i => {
    if (lines[i.line - 1]) {
      lines[i.line - 1] = lines[i.line - 1].replace(/([^\/\s]+)\/$/, '$1');
    }
  });
  
  issues.filter(i => i.type === 'invalid_chars').forEach(i => {
    if (lines[i.line - 1] && i.name) {
      const sanitized = sanitizeName(i.name);
      lines[i.line - 1] = lines[i.line - 1].replace(i.name, sanitized);
    }
  });
  
  issues.filter(i => i.type === 'missing_tree_chars').forEach(i => {
    const idx = i.line - 1;
    if (lines[idx]) {
      const l = lines[idx];
      const indent = l.search(/\S/);
      const content = l.trim();
      lines[idx] = ' '.repeat(indent) + '├── ' + content;
    }
  });
  
  if (issues.some(i => i.type === 'inconsistent_indent')) {
    lines = lines.map(l => {
      const trimmed = l.trimStart();
      const indent = l.length - trimmed.length;
      if (indent === 0) return l;
      return ' '.repeat(Math.round(indent / 4) * 4) + trimmed;
    });
    fixes.push('Normalized indentation');
  }
  
  lines = lines.filter(l => {
    const t = l.trim();
    return t !== '│' && t !== '├──' && t !== '└──' && t !== '';
  });
  
  return { fixed: lines.join('\n'), fixes };
}

// ============================================================
// PARSER (with duplicate rename + type conflict)
// ============================================================
function parseTree(input, projectName = 'my-project') {
  const lines = input.split('\n').map(stripComments).filter(l => l.trim());
  if (!lines.length) throw new Error('Empty input');
  if (input.length > CONFIG.MAX_INPUT_SIZE) {
    throw new Error(`Input too large (max ${CONFIG.MAX_INPUT_SIZE / 1000}KB)`);
  }
  
  let rootName = sanitizeProjectName(projectName);
  const root = { name: rootName, type: 'folder', children: [] };
  const stack = [{ node: root, indent: -1 }];
  let fileCount = 0, folderCount = 1, depth = 0;
  const warnings = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const indent = line.search(/\S/);
    let content = line.trim();
    
    // Root declaration
    if (!content.match(/^[├└│]/) && !content.includes('─')) {
      if (content.match(/^[a-zA-Z0-9_-]+(\/)?$/)) {
        rootName = sanitizeProjectName(content.replace(/\/$/, ''));
        root.name = rootName;
      } else if (i === 0) {
        warnings.push(`Line 1: Using "${rootName}" as root. Add "my-app/" as first line to specify.`);
      }
      continue;
    }
    
    // Remove tree characters
    content = content.replace(/^[├└]──\s*/, '').replace(/^[│]\s*/, '').trim();
    const isFolder = content.endsWith('/');
    let name = isFolder ? content.slice(0, -1).trim() : content.trim();
    if (!name) continue;
    
    // Sanitize name
    name = sanitizeName(name);
    
    // Pop stack to correct indent
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    
    const parent = stack[stack.length - 1].node;
    depth = Math.max(depth, stack.length);
    
    if (depth > CONFIG.MAX_DEPTH) {
      warnings.push(`Depth exceeds ${CONFIG.MAX_DEPTH} — tree truncated.`);
      break;
    }
    
    if (isFolder) {
      let folder = parent.children.find(c => c.type === 'folder' && c.name === name);
      if (!folder) {
        // Check for type conflict
        if (parent.children.some(c => c.type === 'file' && c.name === name)) {
          name = name + '_folder';
          warnings.push(`Line ${i+1}: Type conflict — renamed folder to "${name}"`);
        }
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
      // Check for type conflict
      if (parent.children.some(c => c.type === 'folder' && c.name === name)) {
        name = name + '.txt';
        warnings.push(`Line ${i+1}: Type conflict — renamed file to "${name}"`);
      }
      // Check for duplicate file
      const existingFile = parent.children.find(c => c.type === 'file' && c.name === name);
      if (existingFile) {
        const base = name.replace(/\.[^/.]+$/, '');
        const ext = name.split('.').pop() || 'txt';
        let counter = 1;
        let newName = `${base}_${counter}.${ext}`;
        while (parent.children.some(c => c.type === 'file' && c.name === newName)) {
          counter++;
          newName = `${base}_${counter}.${ext}`;
        }
        warnings.push(`Line ${i+1}: Duplicate file "${name}" — renamed to "${newName}"`);
        name = newName;
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
// FQI CALCULATION
// ============================================================
function calculateFQI(manualIssues, fixableIssues, fileCount) {
  let fqi = 1.0;
  const totalIssues = manualIssues * 2 + fixableIssues;
  if (totalIssues > 30) fqi = 0.65;
  else if (totalIssues > 20) fqi = 0.75;
  else if (totalIssues > 10) fqi = 0.82;
  else if (totalIssues > 5) fqi = 0.88;
  else if (totalIssues > 0) fqi = 0.94;
  if (fileCount > 5000) fqi = Math.min(fqi, 0.85);
  if (manualIssues > 3) fqi = Math.min(fqi, 0.80);
  return fqi;
}

// ============================================================
// PLACEHOLDER GENERATION
// ============================================================
function generatePlaceholder(name, fullPath, includePlaceholders = true, projectName = 'my-project') {
  if (!includePlaceholders) return '';
  
  if (isBinary(name)) {
    return `# BINARY PLACEHOLDER\n# Replace with actual ${name.split('.').pop()?.toUpperCase()} file\n`;
  }
  
  const ext = name.split('.').pop();
  const baseName = name.replace(/\.[^/.]+$/, '');
  
  if (baseName === 'index' && (ext === 'ts' || ext === 'js')) {
    return `// Barrel export\n\nexport * from './types';\nexport * from './processor';\n`;
  }
  
  if (name === 'package.json') {
    const pkgName = fullPath.replace(/\//g, '-').replace(/[^a-z0-9-]/g, '-') || projectName;
    return JSON.stringify({
      name: pkgName,
      version: "1.0.0",
      description: `AION Stack — ${fullPath}`,
      main: "index.js",
      private: true,
      scripts: { build: "tsc", dev: "tsc --watch", test: "jest" }
    }, null, 2);
  }
  
  if (name === 'tsconfig.json') {
    return JSON.stringify({
      compilerOptions: {
        target: "ES2022", module: "ESNext", moduleResolution: "node",
        strict: true, esModuleInterop: true, skipLibCheck: true,
        forceConsistentCasingInFileNames: true
      },
      include: ["src/**/*"],
      exclude: ["node_modules", "dist"]
    }, null, 2);
  }
  
  if (ext === 'md') {
    return `# ${baseName.replace(/-/g, ' ').toUpperCase()}\n\n## Overview\n\n[Generated by AION Scaffold v2.6.1]\n`;
  }
  
  if (ext === 'ts' || ext === 'js') {
    return `/**\n * ${fullPath}\n * @module ${baseName}\n */\n\nexport {};\n`;
  }
  
  if (ext === 'yaml' || ext === 'yml') {
    return `# ${fullPath}\nversion: "1.0"\n`;
  }
  
  if (ext === 'sql') {
    return `-- ${fullPath}\n-- TODO: Define schema\n`;
  }
  
  if (ext === 'html') {
    return `<!DOCTYPE html>\n<html>\n<head><meta charset="UTF-8"><title>${baseName}</title></head>\n<body></body>\n</html>\n`;
  }
  
  if (ext === 'css') {
    return `/* ${fullPath} */\n:root { --amber: #f0a500; --cyan: #00d4ff; --bg: #0a0a0f; }\n`;
  }
  
  if (name === '.gitignore') {
    return `node_modules/\ndist/\n.env\n*.gguf\n*.safetensors\n`;
  }
  
  return '';
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

function exportAsShellScript(tree, includePlaceholders = true, projectName = 'my-project') {
  let script = '#!/usr/bin/env bash\nset -e\n# Generated by AION Scaffold v2.6.1\n\n';
  
  function add(node, currentPath = '') {
    const safeName = sanitizeName(node.name);
    const fullPath = currentPath ? `${currentPath}/${safeName}` : safeName;
    
    if (node.type === 'folder') {
      script += `mkdir -p "${fullPath}"\n`;
      if (node.children) node.children.forEach(c => add(c, fullPath));
    } else {
      script += `touch "${fullPath}"\n`;
      if (includePlaceholders) {
        const content = generatePlaceholder(node.name, fullPath, true, projectName);
        if (content) {
          // Use heredoc for multi-line content
          script += `cat > "${fullPath}" << 'EOF'\n${content}EOF\n`;
        }
      }
    }
  }
  
  const rootName = sanitizeName(tree.name);
  script += `mkdir -p "${rootName}"\ncd "${rootName}"\n`;
  tree.children?.forEach(c => add(c, ''));
  script += `\necho "✅ ${rootName} created."\n`;
  
  return script;
}

// ============================================================
// EXPORTS
// ============================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
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
  };
}
