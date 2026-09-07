![1000008739](https://github.com/user-attachments/assets/d607d380-6a50-4857-9f69-20e459f4189b)

# AION Scaffold — Tree to Filesystem Generator

<!-- STATUS · VERSION · BUILD -->
[![Status](https://img.shields.io/badge/STATUS-Production-1976D2?style=flat-square)](https://github.com/AionSystem/AION-SCAFFOLDING)
[![Web Version](https://img.shields.io/badge/web-v3.5-orange)](#)
[![CLI/Parser Version](https://img.shields.io/badge/CLI%2Fparser-v2.7.0-orange)](#)
[![Build](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![ORCID — Sheldon K. Salmon](https://img.shields.io/badge/ORCID-0009--0005--8057--5115-a6ce39?style=flat&logo=orcid&logoColor=white)](https://orcid.org/0009-0005-8057-5115)
[![DOI](https://zenodo.org/badge/1209765535.svg)](https://doi.org/10.5281/zenodo.19560136)

<!-- TOOL METRICS -->
[![FQI](https://img.shields.io/badge/FQI-0.91-4ade80?style=flat-square)](#the-parser-engine)
[![Audit Types](https://img.shields.io/badge/Audit_Types-8-f0a500?style=flat-square)](#audit-issue-registry)
[![Max Files](https://img.shields.io/badge/Max_Files-15%2C000-4527A0?style=flat-square)](#configuration)

<!-- TECH STACK -->
[![Made with HTML](https://img.shields.io/badge/Made%20with-HTML-red)](#)
[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-yellow)](#)
[![CLI: Node.js](https://img.shields.io/badge/CLI-Node.js_(zero_deps)-brightgreen)](#cli-tool)
[![ZIP: hand-rolled](https://img.shields.io/badge/ZIP-hand--rolled_(zero_deps)-4285F4?style=flat-square)](#export-system)
[![Free Forever](https://img.shields.io/badge/Free-Forever-4ade80?style=flat-square)](#license)
[![No Tracking](https://img.shields.io/badge/No-Tracking-00d4ff?style=flat-square)](#architects-note-on-ai-use)

> **Intelligent tree-to-filesystem scaffolding.**
> Paste a tree structure. Audit issues. Fix automatically. Download a complete folder hierarchy — as a generic scaffold, a tier deliverable package, or a document-review template, with a real SHA-256 hash manifest.
> **Free forever · No tracking · No CDN.**

---

## A note on this document

This README was rewritten from a version that had drifted from the actual codebase — not just a stale version number, but real architectural claims that no longer hold (documented in [Two Independent Implementations](#two-independent-implementations) below). Everything below was checked directly against the current source, not carried forward from the previous draft.

---

## Table of Contents

- [Architect's Note on AI Use](#architects-note-on-ai-use)
- [Quick Start](#quick-start)
- [Repository Structure](#repository-structure)
- [Audit Issue Registry](#audit-issue-registry)
- [Overview](#overview)
- [Two Independent Implementations](#two-independent-implementations)
- [The Parser Engine](#the-parser-engine)
- [Tier Packages & Document Types](#tier-packages--document-types)
- [Cryptographic Verification](#cryptographic-verification)
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

The intellectual core — the indent-stack parser, the eight-type audit engine, the graduated folder-merge logic, duplicate file auto-rename, type conflict detection, the FQI metric, and the overall design vision — is wholly human-originated.

The parser does not guess. It does not generate. It reads a declared structure and builds it exactly — or tells you precisely why it cannot.

**Free forever. No tracking. No data leaves your machine.**

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Quick Start

### Web Tool

No installation required. Runs entirely in your browser, fully offline — no CDN, no external requests. **No tracking. No data leaves your machine.**

Visit **[aionsystem.github.io/AION-SCAFFOLDING](https://aionsystem.github.io/AION-SCAFFOLDING)**

1. Paste your tree structure into the input panel — or pick a starting point instead: **Document Type** (Contract Review, Policy Audit, Regulatory Filing, AI Governance Framework, Research Paper/Grant Proposal, Internal SOP/Playbook) or **Tier Template** (`tier1`–`tier6`, the priced deliverable packages). The two are alternatives — loading one clears the other.
2. Click **Audit & Fix** to detect and repair issues automatically.
3. Click **Parse** to preview the resolved structure. If a tier is loaded, **Validate vs Tier** checks the tree against that tier's required file list and lists anything missing or extra.
4. Select your export format (ZIP · Shell Script · Tree · JSON) and toggle **Include Placeholders** if you want generated content (and, where the tree includes `Hash_Manifest.txt`, real SHA-256 hashes computed live in-browser via `crypto.subtle`).
5. Click **Generate & Download**. If a tier is loaded and required files are missing, you'll be asked to confirm before proceeding. After a ZIP builds, its own bytes are re-scanned as a post-build check before the success message shows.

> **Session recovery:** the tool auto-saves to `sessionStorage` as you work, so an accidental page refresh can be recovered via the prompt in the stats bar — but this does **not** survive closing the tab, by design (a v2.7 privacy fix deliberately moved this off `localStorage`; see [Two Independent Implementations](#two-independent-implementations)). For anything you want to keep across sessions, use **named presets** (session-only, listed by name) or **Export Template** (a `.json` file you keep on disk and re-import anytime, on this machine or another).

### CLI Tool

```bash
# From file with custom project name
node cli.js --input my-tree.txt --output ./my-project --name my-app

# From pipe (AI output)
cat tree.txt | node cli.js --pipe --output ./my-project

# Generate a Tier 3 deliverable package directly — no input tree needed
node cli.js --tier tier3 --output ./client-review --name AcmeCorp_Contract

# Bring your own (edited) tree, but validate + tag it as a Tier 4 deliverable
node cli.js --input my-tree.txt --tier tier4 --output ./out
# ...if required files are missing, re-run with --force to proceed anyway

# Generate a document-review skeleton with type-specific placeholders
node cli.js --doctype policy --output ./policy-review

# Export as shell script (with placeholders, real hashes, NEXT_STEPS.md)
node cli.js --input tree.txt --format script > scaffold.sh

# Audit only (no file generation)
node cli.js --input tree.txt --audit

# Generate empty files only (skips hashing too — nothing to hash)
node cli.js --input tree.txt --no-placeholders

# Validate only (dry run) — reports tier issues without blocking
node cli.js --input tree.txt --tier tier2 --dry-run
```

Diagnostic and status output goes to `stderr`; `--format json/tree/script/clean-tree` print only their payload to `stdout`, so `> file` redirection is always clean regardless of `--quiet`.

> **Keyboard shortcuts (web):** `Ctrl+Enter` to parse · `Ctrl+Z` to undo · `Ctrl+Shift+Z` to redo (`Ctrl+Y` also still works)

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Repository Structure

> Key files: `parser.js` (CLI's shared module) · `scaffold/index.html` (full web tool — self-contained, does not import `parser.js`; see below) · `scaffold/cli.js` (CLI · zero dependencies)

```
AION-SCAFFOLDING/
├── scaffold/
│   ├── parser.js            ← Shared module for the CLI (tree parsing, tiers,
│   │                            doc types, hashing, placeholders)
│   ├── cli.js               ← CLI tool (Node.js, zero dependencies)
│   ├── index.html           ← Full web tool — single self-contained file,
│   │                            its own independent inline implementation
│   └── README.md            ← Tool documentation
├── LICENSE
├── package.json             ← npm publishing
└── README.md                ← This file
```

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Audit Issue Registry

The audit engine detects and classifies eight issue types before any filesystem is built.

| ID | Issue Type | Fixable | Description |
|----|-----------|---------|-------------|
| 01 | `mixed_indent` | ✅ Auto | Mixed tabs and spaces — converted to 4-space standard |
| 02 | `has_comments` | ✅ Auto | Inline `#` or `//` comments present — stripped before parsing |
| 03 | `invalid_chars` | ✅ Auto | Filesystem-illegal characters (`< > : " \| ? *`) — sanitized to hyphens |
| 04 | `file_with_slash` | ✅ Auto | File declared with trailing `/` — slash removed |
| 05 | `missing_tree_chars` | ✅ Auto | Line missing `├──` or `└──` — inferred from indentation |
| 06 | `inconsistent_indent` | ✅ Auto | Indentation not multiple of 4 — normalized |
| 07 | `duplicate_file` | ⚠️ Auto-Rename | Same file path declared more than once — auto-renamed with warning |
| 08 | `type_conflict` | ⚠️ Auto-Rename | Same path declared as both file and folder — auto-renamed with warning |

> Issues 01–06 are repaired automatically by "Apply Fixes." Issues 07–08 are auto-renamed with clear warnings but require architect acknowledgment.

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Overview

Most scaffolding tools are generators. You answer prompts, they produce a structure. The assumption is that you don't know what you want until they ask.

AION Scaffold inverts this. It reads what you've already declared — the tree a language model produced, the structure you sketched in a design doc, the hierarchy you copied from a tutorial, or one of the built-in tier/document-type templates — and builds it exactly as specified, or tells you precisely why it can't.

**How it works — three steps:**

1. Paste any ASCII tree structure, or load a starting point (a tier package or a document-review template). Comments are stripped automatically. Tabs are normalized.
2. The audit engine classifies all issues as auto-fixable or auto-renamed. If a tier is loaded, structural validation separately checks the tree against that tier's required files. One click applies all automatic repairs.
3. Choose your output format and download. ZIP archives and shell scripts include placeholder content, a real SHA-256 `Hash_Manifest.txt` (where the tree includes one), and an always-included `NEXT_STEPS.md`.

[![Live Tool](https://img.shields.io/badge/Live_Tool-AION_Scaffold-4ade80?style=flat-square&logo=github&logoColor=white)](https://aionsystem.github.io/AION-SCAFFOLDING)

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Two Independent Implementations

**This section corrects a claim in earlier drafts of this README.** The original design intent — one parser, imported by both surfaces — is a good goal, but it is not what currently ships. As of web v3.5 / CLI v2.7.0:

- **`index.html`** (the web tool) is a single self-contained file with its **own inline** tree parser, placeholder generator, tier/doc-type data, and hashing logic. It does not load or reference `parser.js` at all.
- **`parser.js`** is a real, standalone shared module — but its only current consumer is `cli.js`.

The two implementations are **similar by construction** (the web tool's logic was ported into `parser.js` when the CLI was updated) but are **not the same source of truth**, and they have already diverged in a few concrete ways:

| Behavior | Web (`index.html`) | CLI / `parser.js` |
|---|---|---|
| Tree-input dialects understood | Unicode box-drawing (`├└│─`), Windows ASCII `tree /F` (`+ \\ \| -`), and plain space/tab indentation with auto-detected width | Unicode box-drawing only |
| Binary file placeholder | Empty file | `# BINARY PLACEHOLDER` comment |
| Reserved Windows device names (`CON`, `NUL`, ...) | Detected and auto-renamed | Not checked |
| `MAX_PATH` (260-char) warning | Yes | Not checked |

A fix made to one is **not** automatically reflected in the other. If you're relying on identical behavior across both surfaces, verify against both directly rather than assuming it from this document. Converging them (most likely: have `index.html` fetch/inline `parser.js` at build time) is a reasonable follow-up, not yet done.

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## The Parser Engine

The parser is the core of AION Scaffold — an indent-stack traversal engine that converts ASCII tree notation into a typed node graph, resolves all folder references, and enforces structural constraints before any output is produced.

### Parsing Sequence

| Step | Operation | Description |
|------|-----------|-------------|
| 1 | Comment Strip | Inline `#` and `//` comments removed from all lines |
| 2 | Root Detection | First non-tree line matching `[a-zA-Z0-9_-]+/?` becomes root node — this takes priority over any `--name`/project-name field, on both surfaces |
| 3 | Indent Stack | Each line pushed/popped by indentation depth — parent-child relationships resolved |
| 4 | Node Classification | Trailing `/` → folder node · All others → file node |
| 5 | Duplicate Merge | Duplicate folder names at same path are merged rather than rejected |
| 6 | Duplicate File Rename | Duplicate files auto-renamed (`file.txt` → `file_1.txt`) |
| 7 | Type Conflict Resolution | Path declared as both file and folder → auto-renamed with warning |
| 8 | Constraint Check | `MAX_FILES` and `MAX_FOLDERS` throw; `MAX_DEPTH` only warns (not clamped) in `parser.js` — the web tool's separate implementation does clamp depth. `MAX_INPUT_SIZE` is declared in `CONFIG` but not currently enforced by `parser.js` |

### Node Types

| Type | Indicator | Behavior |
|------|-----------|----------|
| Folder | Trailing `/` | Added to indent stack · children resolved relative to it |
| File | No trailing `/` | Leaf node · receives placeholder content in ZIP/script export |
| Binary File | Extension in binary list | Leaf node · placeholder behavior differs by surface — see [Two Independent Implementations](#two-independent-implementations) |

### FQI — Format Quality Index

Every parsed tree carries an FQI score [0.0–1.0] measuring structural cleanliness. Auto-rename issues penalize FQI more heavily than auto-fix issues.

| FQI Range | Status | Meaning |
|-----------|--------|---------|
| 0.90–1.00 | Clean | No auto-rename issues — parse directly |
| 0.80–0.89 | Acceptable | Minor auto-rename issues present — review recommended |
| < 0.80 | Degraded | Multiple auto-rename issues — fix before parse |

> The 0.91 badge above is an illustrative baseline for a typical AI-generated tree with minor formatting inconsistencies, not a measured average across real usage.

### Placeholder Content Generation (`parser.js`)

For ZIP and shell script exports, `generatePlaceholder(name, fullPath, includePlaceholders, projectName, docType, tierManifestContent)` generates contextually appropriate content:

| File | Generated Content |
|------|------------------|
| `README.txt` | Project header + a "how to use this package" intro — document-type-specific when `docType` is set, generic otherwise |
| `Hash_Manifest.txt` | Placeholder header only — real content is filled in separately, after every sibling file's SHA-256 is computed (see [Cryptographic Verification](#cryptographic-verification)) |
| `Verification_Checklist.txt` | A numbered checklist — document-type-specific when `docType` is set, generic otherwise |
| `Regulatory_Anchor_References.txt` | Suggested regulation/standard anchors for the selected document type (e.g. GDPR, HIPAA, EU AI Act) — explicitly labeled as starting suggestions to edit, not legal advice |
| Tier-specific `.csv` (`Risk_Matrix`, `Review_Ledger`, `Regulatory_Currency`, `Gauntlet*`, `FORGE_Scoring*`, ...) | Matching CSV header row |
| Tier-specific `.json` (`Findings_Register`, `Open_Findings`) | `[]` |
| `package.json` | Minimal valid JSON with name derived from path |
| `tsconfig.json` | Minimal valid TypeScript config (ES2022, strict) |
| `index.ts` / `index.js` | Barrel export comment |
| `*.md` (not otherwise matched) | H1 header + Overview stub |
| Other binary extensions | `# BINARY PLACEHOLDER` comment (web tool: empty file instead) |
| Everything else | Empty file |

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Tier Packages & Document Types

Two families of built-in starting trees, on both surfaces. They're alternatives, not combinable — loading one clears the other.

### Tier Packages (`tier1`–`tier6`)

Priced deliverable structures for document red-team work (Executive Decision Brief, Adversarial Findings Dossier, Validation & Remediation Pack, evidence and machine-readable exports; higher tiers add regulatory anchoring, workshop-pass history, FORGE scoring, and a Gauntlet hostile-review certificate). Each tier has a matching `Tier_Manifest.txt` describing what that tier includes and what the next tier up adds.

- **Web:** `Load Tier Template` dropdown; `Validate vs Tier` checks a (possibly edited) tree against the loaded tier's required files; `Compare Tiers` shows a file-level diff between any two tiers.
- **CLI:** `--tier <key>` alone generates the tier's canonical tree; combined with `--input`/`--pipe`, it validates *your* tree against that tier instead and tags the output with `Tier_Manifest.txt`. Missing required files block `--format files`/`script` unless you pass `--force` (or `--dry-run`, which only reports).

### Document Types

General-purpose skeletons, independent of the tier system: `contract` (Contract Review), `policy` (Policy Audit), `regulatory` (Regulatory Filing), `ai_governance` (AI Governance Framework), `research` (Research Paper / Grant Proposal), `sop` (Internal SOP / Playbook). Each carries its own `README.txt` intro, `Verification_Checklist.txt` items, and (where relevant) `Regulatory_Anchor_References.txt` suggestions.

- **Web:** `Document Type` dropdown.
- **CLI:** `--doctype <key>`.

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Cryptographic Verification

Wherever a tree includes a file literally named `Hash_Manifest.txt` (every tier and every document-type template does), it's filled in — not shipped as an empty stub — with real SHA-256 digests of every other file actually going into the package.

- **Web:** computed with the browser's native `crypto.subtle.digest`, asynchronously per file, with a live "hashing N/total files" progress readout during Generate & Download.
- **CLI:** computed synchronously with Node's built-in `crypto` module; `--quiet` suppresses the periodic progress line.
- **Format:** `<sha256>  <path>` per line, sorted, with paths relative to the directory that *contains* the project's root folder (matching what you'd see after extracting a ZIP or running the generated shell script from one level up).

An always-included `NEXT_STEPS.md` gives the exact `sha256sum -c` command for wherever `Hash_Manifest.txt` actually landed (it isn't always at the project root — Tier 1–6 packages nest it under `04_Evidence_And_Supplements/`), plus document-type-specific completion steps and a contact placeholder.

With **Include Placeholders** off (`--no-placeholders` on the CLI), every file is a zero-byte stub, so hashing is skipped entirely rather than producing 28 identical "empty file" digests.

> The web tool also re-scans a generated ZIP's own bytes immediately after building it (real local-file-header signatures, not just its own internal counters) and reports if the file/folder counts don't match what was requested — a post-build self-check on top of the hash manifest itself.

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
→ Tree character inference (missing ├── or └──)
→ Path resolution (duplicate folders · duplicate files · type conflicts)
→ Issue classification (auto-fix / auto-rename)
→ Audit Report generated
→ Architect reviews — applies fixes or acknowledges renames
→ FIXED INPUT → Parser
```

### Fix Application Order

When "Apply Fixes" is clicked, the engine processes issues in sequence:

1. **Comment strip** — applied first, cleans lines before further analysis
2. **Tab conversion** — all `\t` characters replaced with 4 spaces
3. **File slash removal** — trailing `/` removed from file declarations
4. **Character sanitization** — illegal chars replaced with `-`
5. **Tree character inference** — missing `├──` added based on indentation
6. **Indentation normalization** — rounded to nearest 4-space increment

> The original input is preserved in history before any fix is applied. `Ctrl+Z` restores the pre-fix state.

### History System (web)

| Setting | Value |
|---------|-------|
| Maximum snapshots | 30 |
| Scope | Per-session (in-memory + `sessionStorage`) — cleared when the tab closes, by design |
| Triggers | Parse · Fix · Load Example · Load Tier/Doc Type · Clear · Undo/Redo |
| Keyboard | `Ctrl+Z` undo · `Ctrl+Shift+Z` redo (`Ctrl+Y` also works) |

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Export System

AION Scaffold produces four output formats. All are generated client-side (web) or locally (CLI) — no server, no network call, ever.

### Format Comparison

| Format | Extension | Content | Best For |
|--------|-----------|---------|---------|
| ZIP Archive | `.zip` | Full folder hierarchy + placeholder files + `Hash_Manifest.txt` + `NEXT_STEPS.md` | Starting a project immediately, or a client-ready deliverable |
| Shell Script | `.sh` | `mkdir` + `touch` + heredoc placeholders, same hash manifest and next-steps content | Version-controllable setup · CI pipelines |
| Tree File | `.txt` | Clean, comment-free ASCII tree | Documentation · re-use as parser input |
| JSON | `.json` | Full node graph serialization | Programmatic consumption · tool integration |

### ZIP Export Detail (web)

- **Library: none.** A hand-rolled, zero-dependency ZIP writer built directly into `index.html` — no CDN, no external request of any kind.
- **Compression: none (STORE method).** Files are stored uncompressed; this trades file size for zero dependencies and full offline operation.
- Structure: root folder preserved as a top-level ZIP entry; real Unix directory/file attributes and an actual modified timestamp (not a zeroed placeholder).
- Binary files: receive an empty placeholder — no actual binary data generated.
- Filename: `[root-name].zip`.

### Shell Script Export

```bash
#!/usr/bin/env bash
set -e
mkdir -p "project-name"
cd "project-name"
mkdir -p "src/components"
touch "src/components/App.tsx"
cat > "package.json" << 'EOF'
{ "name": "project-name", "version": "1.0.0" }
EOF
# ...continues for all nodes, plus Tier_Manifest.txt / NEXT_STEPS.md
```

> Shell scripts use heredoc (`<< 'EOF'`) for multi-line placeholder content. As of v2.7.0 a trailing newline is always inserted before the closing delimiter — content with no trailing newline of its own (e.g. `JSON.stringify` output for `package.json`/`tsconfig.json`) previously ran into the `EOF` marker on the same line, which bash does not recognize as a valid delimiter, silently breaking the heredoc.

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## The AION Scaffold Ecosystem

Two surfaces, two independent implementations of closely related behavior — see [Two Independent Implementations](#two-independent-implementations).

| Surface | Entry Point | Dependencies | Unique Capabilities |
|---------|-------------|-------------|---------------------|
| Web Tool | `scaffold/index.html` | None (no CDN) | Undo/Redo · Session recovery · Named presets · Template file export/import · Tier diff · ZIP export · Post-build ZIP verification · Theme toggle · Mobile nav · ARIA · Changelog modal |
| CLI Tool | `scaffold/cli.js` | None (Node.js built-ins only) | Dry run · Pipe input · CI integration · Colored output · `--audit` · `--force` (tier-validation override) |

### Feature Matrix

| Feature | Web | CLI |
|---------|:---:|:---:|
| Parse ASCII tree structures | ✅ | ✅ |
| Audit & auto-fix issues (8 types) | ✅ | ✅ |
| Duplicate folder merging | ✅ | ✅ |
| Duplicate file auto-rename | ✅ | ✅ |
| Type conflict resolution | ✅ | ✅ |
| Binary file detection | ✅ | ✅ |
| Custom project name | ✅ | ✅ |
| Tier package templates (`tier1`–`tier6`) | ✅ | ✅ |
| Document type templates (6 types) | ✅ | ✅ |
| Tier structural validation | ✅ (button + auto-check before export) | ✅ (auto-check; `--force` to override) |
| Tier-to-tier diff | ✅ | ❌ |
| Real SHA-256 `Hash_Manifest.txt` | ✅ (`crypto.subtle`, async, live progress) | ✅ (Node `crypto`, sync) |
| `NEXT_STEPS.md` generation | ✅ | ✅ |
| Post-build ZIP self-check | ✅ | N/A (writes real files, not a ZIP) |
| Windows ASCII / plain-indent tree dialects | ✅ | ❌ (Unicode box-drawing only) |
| Undo / Redo | ✅ | ❌ |
| Session recovery (same-tab only) | ✅ | ❌ |
| Named presets (session-only) | ✅ | ❌ |
| Template file export/import (`.json`) | ✅ | N/A (use `--tier`/`--doctype`/`--input` directly) |
| ZIP export | ✅ | ❌ |
| Shell script export | ✅ | ✅ |
| Tree file export | ✅ | ✅ |
| JSON export | ✅ | ✅ |
| Dry run (validate only) | ❌ | ✅ |
| Pipe input (`cat tree.txt \| cli.js`) | ❌ | ✅ |
| `--audit` flag (audit only) | ❌ | ✅ |
| `--no-placeholders` flag | ✅ (toggle) | ✅ |
| `--verbose` flag | ❌ | ✅ |
| Colored output | ❌ | ✅ |
| Clean stdout for redirection (`> file`) | N/A | ✅ (diagnostics on stderr) |
| Accessibility (ARIA), theme toggle, mobile nav | ✅ | N/A |

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Technical Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Web App Shell | Single-file HTML + Vanilla JS | Zero build step · self-contained · deployable anywhere |
| CLI's Shared Module | `parser.js` | Single source of truth for the CLI (see [Two Independent Implementations](#two-independent-implementations) re: the web tool) |
| ZIP Generation (web) | Hand-rolled, zero dependencies | Fully offline — no CDN, no external request |
| Cryptographic Hashing | `crypto.subtle` (web) / Node `crypto` (CLI) | Native to each runtime — no dependency either way |
| Canvas Background | HTML5 Canvas API | Math/logic symbol field with mouse-repulsion physics, palette-aware for light/dark mode, skipped under `prefers-reduced-motion` |
| Theme Toggle | CSS custom properties + `localStorage` | Day/night mode; shares its storage key with the rest of the AionSystem site |
| Session Recovery | `sessionStorage` | Same-tab-session recovery only — moved off `localStorage` deliberately (v2.7 privacy fix); does not survive closing the tab |
| CLI Runtime | Node.js (built-ins only) | Zero npm dependencies · runs anywhere Node.js is installed |
| CLI Colors | ANSI escape codes | Green/yellow/red/cyan — zero dependencies |
| Typography | JetBrains Mono · Space Grotesk · Inter | System font stack with generic fallbacks — no Google Fonts / CDN, by design |
| Deployment | GitHub Pages | Static · no server · no configuration |
| License | MIT | Unrestricted use |

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Three Core Features

### 🌲 Web Tool — Browser-Native Scaffolding

For someone who has an AI-generated tree structure — or wants to start from a tier package or document-review template — and needs a real folder hierarchy, without a build step, without an account, without leaving the browser.

- Paste any ASCII tree structure, or load a tier/document-type starting point
- Inline comments stripped automatically (`#` and `//`)
- Duplicate folders merged, duplicate files auto-renamed, type conflicts resolved with clear warnings
- Preview panel shows resolved structure before any file is built
- Tier structural validation and tier-to-tier diff
- Undo/redo history (30 snapshots); session recovery within the same tab
- Named presets and importable/exportable `.json` templates for reuse across sessions
- Four export formats: ZIP, Shell Script, Tree, JSON — ZIP and script include a real SHA-256 `Hash_Manifest.txt` and `NEXT_STEPS.md`
- Post-build self-check re-scans a generated ZIP's actual bytes before declaring success

---

### ⚙️ CLI Tool — Pipeline Integration

For integrating tree-to-filesystem scaffolding into a build pipeline, CI environment, or AI-output post-processor — without opening a browser.

```bash
# Scaffold directly from AI output
llm "generate a React project tree" | node cli.js --pipe --output ./my-app

# Generate a Tier 3 deliverable package directly
node cli.js --tier tier3 --output ./client-review

# Audit only — see issues before building
node cli.js --input tree.txt --audit

# Validate a tree against a tier before committing, without writing anything
node cli.js --input project.tree.txt --tier tier2 --dry-run

# Generate a reproducible setup script, with real hashes and next-steps
node cli.js --input tree.txt --format script > setup.sh
```

- Zero npm dependencies — Node.js built-ins only
- Tier and document-type templates, real SHA-256 hashing, and `NEXT_STEPS.md` — see [Tier Packages & Document Types](#tier-packages--document-types) and [Cryptographic Verification](#cryptographic-verification)
- Pipe-compatible — works inline in shell pipelines
- Dry-run mode — validates and reports (including tier structure) without writing any files
- `--audit` flag — full pre-parse audit report with issue classification
- Diagnostics on `stderr`, payload on `stdout` — `--format json/tree/script/clean-tree` redirect cleanly to a file with or without `--quiet`
- Colored output — green/yellow/red/cyan for readability

---

### 🔧 `parser.js` — the CLI's Shared Module

`parser.js` is a real, standalone module — but as covered in [Two Independent Implementations](#two-independent-implementations), its only current consumer is the CLI. Its core stays a pure function:

```
parseTree(input: string, projectName: string) → { root, fileCount, folderCount, warnings }
```

No side effects, no I/O beyond that. Alongside it, `parser.js` also exports the tier/doc-type data (`TIER_TREES`, `TIER_MANIFESTS`, `DOCUMENT_TYPES`), the hashing utilities (`sha256Hex`, `buildHashManifest` — isomorphic, preferring `crypto.subtle` when present and falling back to Node's `crypto`), `buildNextSteps`, and `validateAgainstTier`/`getFlatPaths` for the tier structural check.

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
| Branch characters | `├──` for non-last items · `└──` for last item (web tool also accepts Windows `tree /F` ASCII output and plain space/tab indentation — see [Two Independent Implementations](#two-independent-implementations)) |
| Indentation | 4 spaces preferred · tabs auto-converted |
| Comments | `#` or `//` after content are stripped automatically |
| Root name | Taken from the tree's own first line when it declares one — a `--name`/project-name field is only a fallback, and does **not** override an explicit root line on either surface |
| Binary files | Extensions in binary list receive a placeholder — content differs by surface, see above |
| Duplicate files | Auto-renamed (`file.txt` → `file_1.txt`) with warning |
| Type conflicts | Auto-renamed (`src` file vs folder → `src.txt` or `src_folder`) with warning |

### Binary Extension List (`parser.js` / CLI)

`gguf` · `safetensors` · `png` · `jpg` · `jpeg` · `gif` · `ico` · `webp` · `svg` · `db` · `sqlite` · `bin` · `wasm` · `zip` · `tar` · `gz` · `mp4` · `mp3` · `wav` · `ttf` · `woff` · `woff2` · `eot` · `pdf` · `doc` · `docx` · `xls` · `xlsx`

The web tool's own list is defined separately (`SHARED_BINARY_EXTENSIONS` in `index.html`) and is very similar but not guaranteed identical — see [Two Independent Implementations](#two-independent-implementations).

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Configuration

Edit the `CONFIG` block in `parser.js` — affects the CLI only (the web tool defines its own separate `CONFIG`/`SHARED_BINARY_EXTENSIONS` inline in `index.html`):

```javascript
const CONFIG = {
  MAX_FILES: 15000,           // Maximum files per scaffold (enforced — throws)
  MAX_FOLDERS: 7500,          // Maximum folders per scaffold (enforced — throws)
  MAX_DEPTH: 100,             // Warned about if exceeded, not currently clamped
  MAX_INPUT_SIZE: 500000,     // Declared but not currently enforced
  BINARY_EXTENSIONS: [        // Extensions treated as binary — placeholder content only
    'gguf', 'safetensors', 'png', 'jpg', 'jpeg', 'gif',
    'ico', 'webp', 'svg', 'db', 'sqlite', 'bin', 'wasm',
    'zip', 'tar', 'gz', 'mp4', 'mp3', 'wav', 'ttf', 'woff',
    'woff2', 'eot', 'pdf', 'doc', 'docx', 'xls', 'xlsx'
  ]
};
```

Web-only configuration (inline in `index.html`):

```javascript
const CONFIG = {
  MAX_FILES: 15000, MAX_FOLDERS: 7500, MAX_INPUT_SIZE: 500000, MAX_DEPTH: 100,
  BINARY_EXTENSIONS: SHARED_BINARY_EXTENSIONS,
  MAX_HISTORY: 30,                              // Undo/redo snapshot limit
  AUTO_SAVE_KEY: 'aion-scaffold-v3_5',          // sessionStorage key — bumped each version
  PRESETS_KEY: 'aion-scaffold-presets-v3_5',    // sessionStorage key for named presets
  PREVIEW_MAX_NODES: 500,                       // Preview render limit
  PREVIEW_MAX_DEPTH: 4                          // Preview depth limit
};
```

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## Keyboard Shortcuts

| Shortcut | Action | Surface |
|----------|--------|---------|
| `Ctrl+Enter` | Parse tree | Web |
| `Ctrl+Z` | Undo last change | Web |
| `Ctrl+Shift+Z` | Redo | Web |
| `Ctrl+Y` | Redo (also still works) | Web |

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
./cli.js --tier tier1 --output ./out
./cli.js --doctype sop --output ./out
```

> **Requirements:** Node.js (any modern version supporting optional chaining / nullish coalescing — 14+). No `npm install` required.

### npm

```bash
# Install globally
npm install -g aion-scaffold

# Or run directly
npx aion-scaffold --input tree.txt
npx aion-scaffold --tier tier3 --output ./client-review
```

### GitHub Pages Deployment

The web tool deploys automatically via GitHub Pages. No configuration required — push to the main branch and the tool is live.

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

## License

AION Scaffold is released under the MIT License — unrestricted use for all contexts. Free forever. No tracking.

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

- JetBrains Mono · Space Grotesk · Inter — typography (system-font stack, no CDN)
- GitHub Pages — deployment infrastructure

[![↑ Back to Table of Contents](https://img.shields.io/badge/↑_Back_to-Table_of_Contents-374151?style=flat-square)](#table-of-contents)

---

> "The programmer does not write programs — the programmer designs the language that creates the world the user inhabits."

This is a developer tool built on the AION Constitutional Stack. The parser reads exactly what you declare and builds it exactly — or tells you why it can't. No generation. No guessing. Epistemic direction from declaration to filesystem.

**Free forever. No tracking. No CDN.**

---

Web v3.5 · CLI/Parser v2.7.0 · FQI 0.91 (illustrative) · Audit Types: 8 · Export Formats: 4
