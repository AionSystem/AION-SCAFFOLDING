# AION Scaffold CLI

<!-- STATUS · VERSION · BUILD -->
[![Status](https://img.shields.io/badge/STATUS-Production-1976D2?style=flat-square)](https://github.com/AionSystem/AION-SCAFFOLDING)
[![Version](https://img.shields.io/badge/version-v1.0.0-orange)](#)
[![Build](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![ORCID — Sheldon K. Salmon](https://img.shields.io/badge/ORCID-0009--0005--8057--5115-a6ce39?style=flat&logo=orcid&logoColor=white)](https://orcid.org/0009-0005-8057-5115)
[![DOI](https://zenodo.org/badge/1209765535.svg)](https://doi.org/10.5281/zenodo.19560136)

<!-- TOOL METRICS -->
[![Parser](https://img.shields.io/badge/Parser-Indent--Stack-00d4ff?style=flat-square)](#the-parser-engine)
[![Max Files](https://img.shields.io/badge/Max_Files-15%2C000-4527A0?style=flat-square)](#configuration)
[![Export Formats](https://img.shields.io/badge/Export_Formats-4-f0a500?style=flat-square)](#export-formats)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-4ade80?style=flat-square)](#installation)

<!-- TECH STACK -->
[![Node.js](https://img.shields.io/badge/Runtime-Node.js-brightgreen?logo=node.js&logoColor=white)](#)
[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-yellow)](#)
[![Feedback Welcome](https://img.shields.io/badge/Feedback-welcome-brightgreen)](https://github.com/AionSystem/AION-SCAFFOLDING/issues/new/choose)

> **Intelligent tree-to-filesystem scaffolding for the command line.**
> Zero dependencies. Pipe-compatible. Programmatically importable.

---

## Table of Contents

- [Architect's Note](#architects-note)
- [Quick Start](#quick-start)
- [Folder Contents](#folder-contents)
- [Command Reference](#command-reference)
- [Overview](#overview)
- [The Parser Engine](#the-parser-engine)
- [Placeholder Generation](#placeholder-generation)
- [Export Formats](#export-formats)
- [Programmatic API](#programmatic-api)
- [Configuration](#configuration)
- [Installation](#installation)
- [License](#license)

---

## Architect's Note

This CLI tool was designed, architected, and directed by Sheldon K. Salmon. It shares its parser with the web tool at [aionsystem.github.io/AION-SCAFFOLDING](https://aionsystem.github.io/AION-SCAFFOLDING) — identical traversal logic, one behavioral source.

The CLI exists for a specific reason: most AI-generated tree structures arrive in pipelines, not browsers. This tool closes that gap without adding a single npm dependency.

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Quick Start

```bash
# From file
node cli.js --input my-tree.txt --output ./my-project

# From pipe — direct from AI output
cat tree.txt | node cli.js --pipe --output ./my-project

# Validate only (no files written)
node cli.js --input tree.txt --dry-run

# Export as portable shell script
node cli.js --input tree.txt --format script > scaffold.sh

# Export as JSON node graph
node cli.js --input tree.txt --format json > structure.json
```

> **Requirements:** Node.js (any modern version). No `npm install`. No build step.

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Folder Contents

This directory contains the CLI tool only. The web tool lives at the repository root.

```
scaffold/
├── cli.js      ← CLI tool (this file — Node.js, zero dependencies)
├── README.md   ← This file
└── LICENSE     ← MIT License
```

> The parser logic in `cli.js` is identical to the web tool's parser. Any update to one must be reflected in the other. This is a deliberate architectural constraint — single behavioral truth, two delivery surfaces.

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Command Reference

Full flag reference for `cli.js`:

| Flag | Alias | Argument | Default | Description |
|------|-------|----------|---------|-------------|
| `--input` | `-i` | `<file>` | — | Input tree file path |
| `--output` | `-o` | `<dir>` | `./scaffold-output` | Output directory |
| `--pipe` | — | — | false | Read tree from stdin |
| `--format` | `-f` | `files\|json\|tree\|script` | `files` | Output format |
| `--dry-run` | — | — | false | Parse and validate without writing files |
| `--quiet` | `-q` | — | false | Suppress warnings |
| `--help` | `-h` | — | — | Show usage |
| `--version` | `-v` | — | — | Show version |

### Format Options

| Format | Output | Use Case |
|--------|--------|---------|
| `files` | Folder hierarchy on disk | Starting a project immediately |
| `script` | `#!/bin/bash` shell script to stdout | CI pipelines · version control · portability |
| `tree` | Clean ASCII tree to stdout | Documentation · re-use as input |
| `json` | Full node graph as JSON to stdout | Programmatic post-processing |

> `--dry-run` is format-agnostic — it parses and validates without writing. Use it before any `files` generation to confirm the tree resolves cleanly.

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Overview

The CLI exists for one specific case: you have a tree structure and you want to build it — directly, in a pipeline, without opening a browser.

It handles every input condition that pipelines produce: inline comments from AI output, mixed indentation from copy-paste, duplicate folders from multi-pass generation. None of these block execution. All are resolved or reported explicitly.

**Pipe pattern:**

```bash
# One-liner: AI generates → CLI scaffolds
llm "give me a React monorepo tree" | node cli.js --pipe --output ./workspace

# Validate before committing
node cli.js --input proposed-structure.txt --dry-run && git commit -m "scaffold approved"

# Reproducible environment setup
node cli.js --input project.tree.txt --format script > bootstrap.sh
chmod +x bootstrap.sh
git add bootstrap.sh
```

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## The Parser Engine

The parser is an indent-stack traversal engine. It converts ASCII tree notation into a typed node graph with full duplicate handling and constraint enforcement.

### Parsing Sequence

| Step | Operation | Description |
|------|-----------|-------------|
| 1 | Comment Strip | Inline `#` and `//` comments removed from all lines |
| 2 | Root Detection | First non-tree line matching `[a-zA-Z0-9_-]+/?` becomes root node |
| 3 | Indent Stack | Each line pushed/popped by indentation depth — parent-child relationships resolved |
| 4 | Node Classification | Trailing `/` → folder · All others → file |
| 5 | Name Validation | Characters illegal in filesystem paths flagged and sanitized |
| 6 | Duplicate Handling | Duplicate folders merged · duplicate files skipped with warning |
| 7 | Constraint Check | `MAX_FILES` and `MAX_FOLDERS` enforced before graph is returned |

### Limits

| Limit | CLI | Web Tool |
|-------|-----|---------|
| Maximum files | **15,000** | 10,000 |
| Maximum folders | **7,500** | 5,000 |

> The CLI has higher limits than the web tool — it runs in a server environment without browser memory constraints.

### Warnings vs Errors

| Condition | Behavior |
|-----------|----------|
| Inline comments | Stripped silently |
| Invalid characters | Sanitized + warning issued |
| Duplicate folder | Merged + warning issued |
| Duplicate file | Skipped + warning issued |
| Limit exceeded | Hard error — process exits 1 |
| Empty input | Hard error — process exits 1 |

> Warnings are collected and printed after parsing. Use `--quiet` to suppress them. Hard errors always exit regardless of `--quiet`.

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Placeholder Generation

For `--format files` (the default), every generated file receives contextually appropriate placeholder content. Files are never empty where content can be inferred.

| File Pattern | Generated Content |
|-------------|------------------|
| `package.json` | Valid JSON with name derived from path, build/dev/test scripts |
| `tsconfig.json` | Valid TypeScript config (ES2022, strict, esModuleInterop) |
| `index.ts` / `index.js` | Barrel export comment |
| `*.md` | H1 header + AION attribution block |
| `*.ts` / `*.js` | JSDoc header + `export {}` |
| `*.yaml` / `*.yml` | Version key + AION config comment |
| `*.sql` | Schema comment block |
| `*.html` | Valid HTML5 boilerplate |
| `*.css` | AION design token variables (amber, cyan, bg) |
| `.gitignore` | node_modules, dist, .env, binary model files, logs |
| Binary extensions | Binary placeholder warning — replace with actual file |
| All others | Generic AION scaffold comment |

### Binary Extension List

The following 21 extensions are treated as binary and receive placeholder content only:

`gguf` · `safetensors` · `png` · `jpg` · `jpeg` · `gif` · `ico` · `db` · `sqlite` · `bin` · `wasm` · `zip` · `tar` · `gz` · `webp` · `svg` · `mp4` · `mp3` · `wav` · `ttf` · `woff` · `woff2` · `eot`

> Font formats (`ttf`, `woff`, `woff2`, `eot`) are included in the CLI binary list but not the web tool — the CLI is designed for full project scaffolding where font assets are common.

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Export Formats

### files (default)

Writes the full folder hierarchy to disk at `--output`. Each file receives placeholder content from the generator above.

```
./scaffold-output/
└── my-project/
    ├── src/
    │   └── index.ts    ← content: JSDoc + export {}
    └── package.json    ← content: valid JSON
```

### script

Outputs a portable `#!/bin/bash` shell script to stdout. Pipe to a file to save.

```bash
node cli.js --input tree.txt --format script > setup.sh
chmod +x setup.sh
./setup.sh
```

Generated scripts include a completion echo: `✅ Scaffold complete — [root-name] created.`

### tree

Outputs a clean, comment-stripped ASCII tree to stdout. Useful for sanitizing AI output before re-use.

```bash
# Sanitize an AI-generated tree
cat messy-ai-output.txt | node cli.js --pipe --format tree > clean.tree.txt
```

### json

Outputs the full parsed node graph as JSON to stdout. Every node carries `{ name, type, children }`.

```bash
node cli.js --input tree.txt --format json | jq '.children | length'
```

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Programmatic API

`cli.js` exports all core functions for use as a Node.js module.

```javascript
const {
  parseTree,
  writeTree,
  exportAsJSON,
  exportAsTree,
  exportAsShellScript,
  stripComments,
  isBinary,
  sanitizeName,
  generatePlaceholder
} = require('./cli');
```

### Function Reference

| Function | Signature | Returns |
|----------|-----------|---------|
| `parseTree` | `(input: string)` | `{ root, fileCount, folderCount, warnings }` |
| `writeTree` | `(tree, basePath, options?)` | `{ filesWritten, foldersCreated, rootPath }` |
| `exportAsJSON` | `(tree)` | JSON string |
| `exportAsTree` | `(tree)` | ASCII tree string |
| `exportAsShellScript` | `(tree)` | Shell script string |
| `stripComments` | `(line: string)` | Cleaned line string |
| `isBinary` | `(name: string)` | boolean |
| `sanitizeName` | `(name: string)` | Filesystem-safe name string |
| `generatePlaceholder` | `(name, fullPath)` | File content string |

### Usage Example

```javascript
const { parseTree, writeTree } = require('./cli');
const fs = require('fs');

const input = fs.readFileSync('my-tree.txt', 'utf-8');
const { root, fileCount, folderCount, warnings } = parseTree(input);

console.log(`Parsed: ${folderCount} folders, ${fileCount} files`);
warnings.forEach(w => console.warn(w));

const result = writeTree(root, './output', { dryRun: false });
console.log(`Written to: ${result.rootPath}`);
```

> `writeTree` accepts `{ dryRun: true }` to validate without writing. The return value is identical in both modes.

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Configuration

Edit the `CONFIG` block at the top of `cli.js`:

```javascript
const CONFIG = {
  MAX_FILES: 15000,           // Maximum files per scaffold
  MAX_FOLDERS: 7500,          // Maximum folders per scaffold
  BINARY_EXTENSIONS: [        // Extensions treated as binary — placeholder content only
    'gguf', 'safetensors', 'png', 'jpg', 'jpeg', 'gif', 'ico',
    'db', 'sqlite', 'bin', 'wasm', 'zip', 'tar', 'gz', 'webp',
    'svg', 'mp4', 'mp3', 'wav', 'ttf', 'woff', 'woff2', 'eot'
  ]
};
```

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Installation

### Direct (no install)

```bash
git clone https://github.com/AionSystem/AION-SCAFFOLDING.git
cd AION-SCAFFOLDING/scaffold
chmod +x cli.js
./cli.js --help
```

**Requirements:** Node.js (any modern version). No `npm install`. No dependencies.

### npx (optional)

```bash
npx aion-scaffold --input tree.txt
```

> Requires the package to be published to npm. See `package.json` at the repository root.

### Global install (optional)

```bash
npm install -g aion-scaffold
aion-scaffold --input tree.txt --output ./my-project
```

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## License

MIT — Sheldon K. Salmon, AionSystem.

See [`LICENSE`](LICENSE) for full terms.

For questions: [aionsystem@outlook.com](mailto:aionsystem@outlook.com)

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

> "The programmer does not write programs — the programmer designs the language that creates the world the user inhabits."

AION Scaffold CLI v1.0.0 · Parser: Indent-Stack · Export Formats: 4 · Dependencies: Zero
