![1000008739](https://github.com/user-attachments/assets/d607d380-6a50-4857-9f69-20e459f4189b)

# AION Scaffold — Tree to Filesystem Generator

<!-- STATUS · VERSION · BUILD -->
[![Status](https://img.shields.io/badge/STATUS-Production-1976D2?style=flat-square)](https://github.com/AionSystem/AION-SCAFFOLDING)
[![Version](https://img.shields.io/badge/version-v2.6.1-orange)](#)
[![Build](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![ORCID — Sheldon K. Salmon](https://img.shields.io/badge/ORCID-0009--0005--8057--5115-a6ce39?style=flat&logo=orcid&logoColor=white)](https://orcid.org/0009-0005-8057-5115)
[![DOI](https://zenodo.org/badge/1209765535.svg)](https://doi.org/10.5281/zenodo.19560136)

<!-- TOOL METRICS -->
[![FQI](https://img.shields.io/badge/FQI-0.88-4ade80?style=flat-square)](#the-parser-engine)
[![Parser](https://img.shields.io/badge/Parser-Indent--Stack-00d4ff?style=flat-square)](#the-parser-engine)
[![Audit Types](https://img.shields.io/badge/Audit_Types-6-f0a500?style=flat-square)](#audit-issue-registry)
[![Max Files](https://img.shields.io/badge/Max_Files-10%2C000-4527A0?style=flat-square)](#configuration)

<!-- TECH STACK -->
[![Made with HTML](https://img.shields.io/badge/Made%20with-HTML-red)](#)
[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-yellow)](#)
[![CLI: Node.js](https://img.shields.io/badge/CLI-Node.js_(zero_deps)-brightgreen)](#cli-tool)
[![JSZip](https://img.shields.io/badge/ZIP-JSZip_3.10.1-4285F4?style=flat-square)](#export-system)
[![Feedback Welcome](https://img.shields.io/badge/Feedback-welcome-brightgreen)](https://github.com/AionSystem/AION-SCAFFOLDING/issues/new/choose)

> **Intelligent tree-to-filesystem scaffolding.**
> Paste a tree structure. Audit issues. Fix automatically. Download a complete folder hierarchy.

---

## Table of Contents

- [Architect's Note on AI Use](#architects-note-on-ai-use)
- [Quick Start](#quick-start)
- [Repository Structure](#repository-structure)
- [Audit Issue Registry](#audit-issue-registry)
- [Overview](#overview)
- [The Parser Engine](#the-parser-engine)
- [Audit & Fix System](#audit--fix-system)
- [Export System](#export-system)
- [The AION Scaffold Ecosystem](#the-aion-scaffold-ecosystem)
- [Technical Stack](#technical-stack)
- [Three Core Features](#three-core-features)
- [Tree Format](#tree-format)
- [Configuration](#configuration)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Installation & Deployment](#installation--deployment)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Architect's Note on AI Use

This tool was designed, architected, and directed by Sheldon K. Salmon. AI tools (including large language models) were used as instruments in development — the same way a carpenter uses a saw.

The intellectual core — the indent-stack parser, the six-type audit engine, the graduated folder-merge logic, the FQI metric, the three-stage cursor system, the shared-parser architecture between web and CLI, and the overall design vision — is wholly human-originated.

The parser does not guess. It does not generate. It reads a declared structure and builds it exactly — or tells you precisely why it cannot.

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Quick Start

### Web Tool

No installation required. Runs entirely in your browser.

Visit **[aionsystem.github.io/AION-SCAFFOLDING](https://aionsystem.github.io/AION-SCAFFOLDING)**

1. Paste your tree structure into the input panel
2. Click **Fix & Merge** to audit and repair issues automatically
3. Click **Parse** to preview the resolved structure
4. Select your export format (ZIP · Shell Script · Tree)
5. Click **Generate & Download**

> **Auto-recovery:** The tool saves your session automatically. If you close the tab and return within 24 hours, a restore prompt appears in the stats bar.

### CLI Tool

```bash
# From file
node cli.js --input my-tree.txt --output ./my-project

# From pipe (AI output)
cat tree.txt | node cli.js --pipe --output ./my-project

# Export as shell script
node cli.js --input tree.txt --format script > scaffold.sh

# Validate only (dry run)
node cli.js --input tree.txt --dry-run
```

> **Keyboard shortcuts (web):** `Ctrl+Enter` to parse · `Ctrl+Z` to undo · `Ctrl+Y` to redo

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Repository Structure

> Key files: `scaffold/index.html` (full web tool · single-file · self-contained) · `scaffold/cli.js` (CLI · zero dependencies) · `scaffold/README.md` (tool documentation)

```
AION-SCAFFOLDING/
├── scaffold/
│   ├── cli.js              ← CLI tool (Node.js, zero dependencies)
│   └── README.md           ← Tool documentation
├── LICENSE
├── index.html               ← Full web tool (single-file, self-contained)       
└── README.md               ← This file
```

> The web tool and CLI tool share identical parser logic. When the parser is updated, both surfaces stay in sync. This is a deliberate architectural constraint — one behavioral source, two delivery surfaces.

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Audit Issue Registry

The audit engine detects and classifies six issue types before any filesystem is built.

| ID | Issue Type | Fixable | Description |
|----|-----------|---------|-------------|
| 01 | `mixed_indent` | ✅ Auto | Mixed tabs and spaces — converted to 4-space standard |
| 02 | `has_comments` | ✅ Auto | Inline `#` or `//` comments present — stripped before parsing |
| 03 | `invalid_chars` | ❌ Manual | Filesystem-illegal characters (`< > : " \| ? *`) — must be corrected by hand |
| 04 | `duplicate_folder` | ✅ Auto | Same folder path declared more than once — children merged into one |
| 05 | `duplicate_file` | ❌ Manual | Same file path declared more than once — cannot be resolved automatically |
| 06 | `type_conflict` | ❌ Manual | Same path declared as both file and folder — cannot be resolved automatically |

> Issues 01, 02, and 04 are repaired automatically by "Apply Fixes." Issues 03, 05, and 06 require manual correction before the tree can be parsed.

> After any fix pass, the audit panel updates. Auto-fixable issues are highlighted in amber. Unfixable issues display in plain text with a manual-fix prompt.

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Overview

Most scaffolding tools are generators. You answer prompts, they produce a structure. The assumption is that you don't know what you want until they ask.

AION Scaffold inverts this. It reads what you've already declared — the tree a language model produced, the structure you sketched in a design doc, the hierarchy you copied from a tutorial — and builds it exactly as specified, or tells you precisely why it can't.

The difference is **epistemic direction.** Most tools generate then validate. AION Scaffold validates then builds.

**How it works — three steps:**

1. Paste any ASCII tree structure. Comments are stripped automatically. Tabs are normalized. The source doesn't matter — AI output, hand-typed, documentation copy.
2. The audit engine classifies all issues as auto-fixable or manual. One click applies all automatic repairs. The preview panel shows the resolved structure before any file is touched.
3. Choose your output format and download. ZIP archives preserve full folder hierarchy with placeholder content. Shell scripts are portable and version-controllable. Tree exports are clean and ready for re-use.

- [![Live Tool](https://img.shields.io/badge/Live_Tool-AION_Scaffold-4ade80?style=flat-square&logo=github&logoColor=white)](https://aionsystem.github.io/AION-SCAFFOLDING)

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## The Parser Engine

The parser is the core of AION Scaffold — an indent-stack traversal engine that converts ASCII tree notation into a typed node graph, resolves all folder references, and enforces structural constraints before any output is produced.

### Parsing Sequence

| Step | Operation | Description |
|------|-----------|-------------|
| 1 | Comment Strip | Inline `#` and `//` comments removed from all lines |
| 2 | Root Detection | First non-tree line matching `[a-zA-Z0-9_-]+/?` becomes root node |
| 3 | Indent Stack | Each line pushed/popped by indentation depth — parent-child relationships resolved |
| 4 | Node Classification | Trailing `/` → folder node · All others → file node |
| 5 | Duplicate Merge | Duplicate folder names at same path are merged rather than rejected |
| 6 | Constraint Check | `MAX_FILES` and `MAX_FOLDERS` enforced before graph is returned |

### Node Types

| Type | Indicator | Behavior |
|------|-----------|----------|
| Folder | Trailing `/` | Added to indent stack · children resolved relative to it |
| File | No trailing `/` | Leaf node · receives placeholder content in ZIP export |
| Binary File | Extension in binary list | Leaf node · receives binary placeholder · flagged purple in preview |

### FQI — Format Quality Index

Every parsed tree carries an FQI score [0.0–1.0] measuring structural cleanliness before fixes are applied.

| FQI Range | Status | Meaning |
|-----------|--------|---------|
| 0.85–1.00 | Clean | No auto-fix required — parse directly |
| 0.60–0.84 | Acceptable | Minor issues present — fix recommended before export |
| < 0.60 | Degraded | Structural issues detected — fix before parse |

> Current deployment FQI baseline: **0.88** — representing a typical AI-generated tree with minor formatting inconsistencies.

### Placeholder Content Generation

For ZIP exports, the parser generates contextually appropriate placeholder content per file type:

| File | Generated Content |
|------|------------------|
| `package.json` | Minimal valid JSON with name derived from path |
| `tsconfig.json` | Minimal valid TypeScript config (ES2022, strict) |
| `index.ts` / `index.js` | Barrel export comment |
| `*.md` | H1 header from filename |
| Binary extensions | Binary placeholder warning comment |
| All others | Empty file |

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Audit & Fix System

The audit engine runs independently of the parser — it operates on raw input text before any structural interpretation.

### Audit Pipeline

```
RAW INPUT
→ Line-by-line scan
→ Comment detection (# or //)
→ Indentation analysis (tab/space mixing)
→ Character validation (filesystem-illegal chars)
→ Path resolution (duplicate folders · duplicate files · type conflicts)
→ Issue classification (fixable / manual)
→ Audit Report generated
→ Architect reviews — applies fixes or corrects manually
→ FIXED INPUT → Parser
```

### Fix Application Order

When "Apply Fixes" is clicked, the engine processes fixable issues in sequence:

1. **Comment strip** — applied first, cleans lines before further analysis
2. **Tab conversion** — all `\t` characters replaced with 4 spaces
3. **Duplicate folder merge** — duplicate declaration lines removed; children preserved in the surviving declaration

> The original input is preserved in history before any fix is applied. `Ctrl+Z` restores the pre-fix state.

### History System

| Setting | Value |
|---------|-------|
| Maximum snapshots | 20 |
| Scope | Per-session (in-memory) |
| Triggers | Parse · Fix · Load Example · Clean Comments |
| Keyboard | `Ctrl+Z` undo · `Ctrl+Y` redo |

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Export System

AION Scaffold produces three output formats. All three are generated client-side — no server required.

### Format Comparison

| Format | Extension | Content | Best For |
|--------|-----------|---------|---------|
| ZIP Archive | `.zip` | Full folder hierarchy + placeholder files | Starting a project immediately |
| Shell Script | `.sh` | `mkdir` + `touch` commands | Version-controllable setup · CI pipelines |
| Tree File | `.txt` | Clean, comment-free ASCII tree | Documentation · re-use as parser input |

### ZIP Export Detail

- Library: JSZip 3.10.1 (CDN, client-side)
- Compression: DEFLATE
- Structure: Root folder preserved as top-level ZIP entry
- Binary files: Receive placeholder warning comment — no actual binary data generated
- Filename: `[root-name].zip`

### Shell Script Export

```bash
#!/bin/bash
mkdir -p "project-name"
cd "project-name"
mkdir -p "src/components"
touch "src/components/App.tsx"
# ...continues for all nodes
```

> Shell scripts are portable — they run on any POSIX system and can be committed to version control to reproduce the project structure in any environment.

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## The AION Scaffold Ecosystem

Two surfaces. One parser.

| Surface | Entry Point | Dependencies | Unique Capabilities |
|---------|-------------|-------------|---------------------|
| Web Tool | `scaffold/index.html` | JSZip (CDN) | Undo/Redo · Auto-save · ZIP export · Canvas UI · ARIA |
| CLI Tool | `scaffold/cli.js` | None (Node.js built-ins only) | Dry run · Pipe input · CI integration |

### Feature Matrix

| Feature | Web | CLI |
|---------|:---:|:---:|
| Parse ASCII tree structures | ✅ | ✅ |
| Audit & auto-fix issues | ✅ | ✅ |
| Duplicate folder merging | ✅ | ✅ |
| Binary file detection | ✅ | ✅ |
| Undo / Redo | ✅ | ❌ |
| Auto-save recovery | ✅ | ❌ |
| ZIP export | ✅ | ❌ |
| Shell script export | ✅ | ✅ |
| Tree file export | ✅ | ✅ |
| Dry run (validate only) | ❌ | ✅ |
| Pipe input (`cat tree.txt \| cli.js`) | ❌ | ✅ |
| Accessibility (ARIA) | ✅ | ❌ |

### Shared Parser Constraint

The parser logic is identical between web and CLI. When updating the parser, both files must be synced. This is a deliberate architectural constraint — a single behavioral source, two delivery surfaces. Testing the web tool validates the CLI parser.

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Technical Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Web App Shell | Single-file HTML + Vanilla JS | Zero build step · self-contained · deployable anywhere |
| ZIP Generation | JSZip 3.10.1 (CDN) | Client-side compression · no server required |
| Canvas Background | HTML5 Canvas API | 45-symbol math/logic field with mouse-repulsion physics |
| Custom Cursor | CSS + JS (three-stage) | Ring → hover → idle magnify at 1.8s threshold |
| Session Recovery | localStorage | 24-hour session backup · key `aion-scaffold-backup-v2_4` |
| CLI Runtime | Node.js (built-ins only) | Zero npm dependencies · runs anywhere Node.js is installed |
| Typography | Share Tech Mono · Barlow Condensed · Crimson Pro · JetBrains Mono | Coherent with AionSystem design language |
| Deployment | GitHub Pages | Static · no server · no configuration |
| License | MIT | Unrestricted use |

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Three Core Features

### 🌲 Web Tool — Browser-Native Scaffolding

For a developer who has an AI-generated tree structure and needs to materialize it as a real project folder — without a build step, without an account, without leaving the browser.

- Paste any ASCII tree structure (AI output, hand-typed, documentation copy)
- Inline comments stripped automatically (`#` and `//`)
- Tabs normalized to 4-space standard
- Duplicate folders merged rather than rejected
- Preview panel shows resolved structure before any file is built
- Undo/redo history (20 snapshots)
- Session auto-saved to localStorage — restore within 24 hours
- Three export formats: ZIP, Shell Script, Tree

---

### ⚙️ CLI Tool — Pipeline Integration

For a developer who wants to integrate tree-to-filesystem scaffolding into a build pipeline, CI environment, or AI output post-processor — without opening a browser.

```bash
# Scaffold directly from AI output
llm "generate a React project tree" | node cli.js --pipe --output ./my-app

# Validate before committing
node cli.js --input project.tree.txt --dry-run

# Generate reproducible setup script
node cli.js --input tree.txt --format script > setup.sh
```

- Zero npm dependencies — Node.js built-ins only
- Pipe-compatible — works inline in shell pipelines
- Dry-run mode — validates and reports without writing any files
- Shell script output — portable, version-controllable, CI-safe

---

### 🔧 Shared Parser — Single Behavioral Truth

The parser is not duplicated between web and CLI. Both surfaces call the same traversal logic.

The parser operates as a pure function:

```
parseTree(input: string) → { root, fileCount, folderCount }
```

No side effects. No I/O. Fully testable in isolation. A fix to the parser applies to both surfaces simultaneously. A test against the web tool validates the CLI.

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Tree Format

```
my-project/
├── README.md
├── package.json
├── src/
│   ├── components/
│   │   └── App.tsx
│   ├── utils/
│   │   └── helpers.ts
│   └── index.ts
├── public/
│   └── index.html
└── .gitignore
```

### Format Rules

| Rule | Detail |
|------|--------|
| Folders | Must end with `/` |
| Branch characters | `├──` for non-last items · `└──` for last item |
| Indentation | 4 spaces preferred · tabs auto-converted |
| Comments | `#` or `//` after content are stripped automatically |
| Binary files | Extensions in binary list receive placeholder warning — not built as real binaries |

### Binary Extension List

The following extensions are treated as binary and receive placeholder content in ZIP exports:

`gguf` · `safetensors` · `png` · `jpg` · `jpeg` · `gif` · `ico` · `db` · `sqlite` · `bin` · `wasm` · `zip` · `tar` · `gz` · `webp` · `svg` · `mp4` · `mp3` · `wav`

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Configuration

Edit the `CONFIG` block at the top of `index.html` (web) or `cli.js` (CLI):

```javascript
const CONFIG = {
  MAX_FILES: 10000,           // Maximum files per scaffold
  MAX_FOLDERS: 5000,          // Maximum folders per scaffold
  MAX_HISTORY: 20,            // Undo/redo snapshot limit (web only)
  IDLE_MAGNIFY_DELAY: 1800,   // Milliseconds before cursor enters magnify mode (web only)
  AUTO_SAVE_KEY: 'aion-scaffold-backup-v2_4', // localStorage key (web only)
  BINARY_EXTENSIONS: [        // Extensions treated as binary — placeholder content only
    'gguf', 'safetensors', 'png', 'jpg', 'jpeg', 'gif',
    'ico', 'db', 'sqlite', 'bin', 'wasm', 'zip', 'tar',
    'gz', 'webp', 'svg', 'mp4', 'mp3', 'wav'
  ]
};
```

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Keyboard Shortcuts

| Shortcut | Action | Surface |
|----------|--------|---------|
| `Ctrl+Enter` | Parse tree | Web |
| `Ctrl+Z` | Undo last change | Web |
| `Ctrl+Y` | Redo | Web |

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Installation & Deployment

### Web Tool

No installation. No build step. No server.

```bash
git clone https://github.com/AionSystem/AION-SCAFFOLDING.git
cd AION-SCAFFOLDING/scaffold
# Open index.html in any modern browser
```

Or use the live deployment at **[aionsystem.github.io/AION-SCAFFOLDING](https://aionsystem.github.io/AION-SCAFFOLDING)**.

### CLI Tool

```bash
# Clone the repo
git clone https://github.com/AionSystem/AION-SCAFFOLDING.git
cd AION-SCAFFOLDING/scaffold

# Make executable
chmod +x cli.js

# Run
./cli.js --input example.txt
```

**Requirements:** Node.js (any modern version). No `npm install` required.

### npm (Optional)

```bash
# Publish to npm (requires account)
npm publish

# Users can then run:
npx aion-scaffold --input tree.txt
```

### GitHub Pages Deployment

The web tool deploys automatically via GitHub Pages. No configuration required — push to the main branch and the tool is live.

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## License

AION Scaffold is released under the MIT License — unrestricted use for all contexts.

| User Type | Status |
|-----------|--------|
| Personal use | ✅ Free |
| Commercial use | ✅ Free |
| Open-source projects | ✅ Free |
| Modification & redistribution | ✅ Free (attribution required) |

See [`LICENSE`](LICENSE) for full terms.

For questions: [aionsystem@outlook.com](mailto:aionsystem@outlook.com)

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Acknowledgments

- JSZip — client-side ZIP generation
- JetBrains Mono · Share Tech Mono · Barlow Condensed · Crimson Pro — typography
- GitHub Pages — deployment infrastructure

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

> "The programmer does not write programs — the programmer designs the language that creates the world the user inhabits."

This is a developer tool built on the AION Constitutional Stack. The parser reads exactly what you declare and builds it exactly — or tells you why it can't. No generation. No guessing. Epistemic direction from declaration to filesystem.

---

AION Scaffold v2.4 · FQI 0.88 · Parser: Indent-Stack · Audit Types: 6 · Export Formats: 3

