/**
 * AION Scaffold Shared Parser v2.7.0
 * FORGE-Hardened — Used by both web and CLI surfaces. Single source of truth.
 * 
 * @author Sheldon K. Salmon
 * @license MIT
 * @version 2.7.0
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
// TIER TREES — priced deliverable packages
// Ported verbatim from the web tool so all three surfaces (web, CLI,
// shared parser) agree on exactly what each tier contains.
// ============================================================
const TIER_TREES = {
  tier1: `ClientName_Document_T1_Date/
├── 01_Executive_Decision_Brief.pdf
├── 02_Adversarial_Findings_Dossier.pdf
├── 03_Validation_And_Remediation_Pack.pdf
├── 04_Evidence_And_Supplements/
│   ├── Original_Document_Reviewed.pdf
│   ├── Review_Ledger.csv
│   ├── Hash_Manifest.txt
│   └── Verification_Checklist.txt
├── 06_Machine_Readable_Exports/
│   ├── Findings_Register.json
│   ├── Risk_Matrix.csv
│   └── Applied_Fixes_Ledger.csv
└── README.txt`,
  tier2: `ClientName_Document_T2_Date/
├── 01_Executive_Decision_Brief.pdf
├── 02_Adversarial_Findings_Dossier.pdf
├── 03_Validation_And_Remediation_Pack.pdf
├── 04_Evidence_And_Supplements/
│   ├── Original_Document_Reviewed.pdf
│   ├── Regulatory_Anchor_References.txt
│   ├── Review_Ledger.csv
│   ├── Hash_Manifest.txt
│   └── Verification_Checklist.txt
├── 06_Machine_Readable_Exports/
│   ├── Findings_Register.json
│   ├── Risk_Matrix.csv
│   ├── Regulatory_Currency_Manifest.csv
│   ├── Applied_Fixes_Ledger.csv
│   └── Open_Findings_Register.json
└── README.txt`,
  tier3: `ClientName_Document_T3_Date/
├── 01_Executive_Decision_Brief.pdf
├── 02_Adversarial_Findings_Dossier.pdf
├── 03_Validation_And_Remediation_Pack.pdf
├── 04_Evidence_And_Supplements/
│   ├── Original_Document_Reviewed.pdf
│   ├── Regulatory_Anchor_References.txt
│   ├── Review_Ledger.csv
│   ├── Hash_Manifest.txt
│   ├── Verification_Checklist.txt
│   ├── Killed_Findings_List.csv
│   └── Fusion_Log.csv
├── 05_Internal_Review_Log/
│   ├── Pipeline_Summary_Report.txt
│   └── Workshop_Pass_History.csv
├── 06_Machine_Readable_Exports/
│   ├── Findings_Register.json
│   ├── Risk_Matrix.csv
│   ├── Regulatory_Currency_Manifest.csv
│   ├── Applied_Fixes_Ledger.csv
│   └── Open_Findings_Register.json
└── README.txt`,
  tier4: `ClientName_Document_T4_Date/
├── 01_Executive_Decision_Brief.pdf
├── 02_Adversarial_Findings_Dossier.pdf
├── 03_Validation_And_Remediation_Pack.pdf
├── 04_Evidence_And_Supplements/
│   ├── Original_Document_Reviewed.pdf
│   ├── Regulatory_Anchor_References.txt
│   ├── Review_Ledger.csv
│   ├── Hash_Manifest.txt
│   ├── Verification_Checklist.txt
│   ├── Killed_Findings_List.csv
│   └── Fusion_Log.csv
├── 05_Internal_Review_Log/
│   ├── Pipeline_Summary_Report.txt
│   ├── Workshop_Pass_History.csv
│   └── Fusion_Fold_Log.csv
├── 06_Machine_Readable_Exports/
│   ├── Findings_Register.json
│   ├── Risk_Matrix.csv
│   ├── Regulatory_Currency_Manifest.csv
│   ├── Applied_Fixes_Ledger.csv
│   └── Open_Findings_Register.json
└── README.txt`,
  tier5: `ClientName_Document_T5_Date/
├── 01_Executive_Decision_Brief.pdf
├── 02_Adversarial_Findings_Dossier.pdf
├── 03_Validation_And_Remediation_Pack.pdf
├── 04_Evidence_And_Supplements/
│   ├── Original_Document_Reviewed.pdf
│   ├── Regulatory_Anchor_References.txt
│   ├── Review_Ledger.csv
│   ├── Hash_Manifest.txt
│   ├── Verification_Checklist.txt
│   ├── Killed_Findings_List.csv
│   └── Fusion_Log.csv
├── 05_Internal_Review_Log/
│   ├── Pipeline_Summary_Report.txt
│   ├── Workshop_Pass_History.csv
│   ├── Fusion_Fold_Log.csv
│   └── FORGE_Scoring_Sheet.csv
├── 06_Machine_Readable_Exports/
│   ├── Findings_Register.json
│   ├── Risk_Matrix.csv
│   ├── Regulatory_Currency_Manifest.csv
│   ├── Applied_Fixes_Ledger.csv
│   └── Open_Findings_Register.json
├── 07_Certification/
│   ├── FORGE_Badge.png
│   └── FORGE_Certificate.pdf
└── README.txt`,
  tier6: `ClientName_Document_T6_Date/
├── 01_Executive_Decision_Brief.pdf
├── 02_Adversarial_Findings_Dossier.pdf
├── 03_Validation_And_Remediation_Pack.pdf
├── 04_Evidence_And_Supplements/
│   ├── Original_Document_Reviewed.pdf
│   ├── Regulatory_Anchor_References.txt
│   ├── Review_Ledger.csv
│   ├── Hash_Manifest.txt
│   ├── Verification_Checklist.txt
│   ├── Killed_Findings_List.csv
│   └── Fusion_Log.csv
├── 05_Internal_Review_Log/
│   ├── Pipeline_Summary_Report.txt
│   ├── Workshop_Pass_History.csv
│   ├── Fusion_Fold_Log.csv
│   ├── FORGE_Scoring_Sheet.csv
│   └── Gauntlet_Verdict_Timeline.csv
├── 06_Machine_Readable_Exports/
│   ├── Findings_Register.json
│   ├── Risk_Matrix.csv
│   ├── Regulatory_Currency_Manifest.csv
│   ├── Applied_Fixes_Ledger.csv
│   └── Open_Findings_Register.json
├── 07_Certification/
│   ├── FORGE_Badge.png
│   ├── FORGE_Certificate.pdf
│   └── Gauntlet_Verdict_Certificate.pdf
└── README.txt`
};

const TIER_MANIFESTS = {
  tier1: `TIER 1 PACKAGE — WHAT YOU RECEIVED
✓ Executive Decision Brief
✓ Core Findings Dossier
✓ Validation & Remediation Pack (core)
✓ Evidence & Supplements (original doc, hash, verification checklist)
✓ Machine-Readable Findings Register

WHAT YOU DID NOT RECEIVE (Available in Tier 2+)
✗ Regulatory Currency Manifest
✗ Open Findings Register
✗ Full Review Ledger (CSV)
✗ Scenario Stress Tests
✗ FORGE Certification
✗ Gauntlet Verdict

Upgrade to Tier 2: $1,500 → adds regulatory anchoring and open findings register.`,
  tier2: `TIER 2 PACKAGE — WHAT YOU RECEIVED
✓ Everything from Tier 1
✓ Regulatory Snapshot
✓ Open Findings Register
✓ Regulatory Currency Manifest
✓ Regulatory Anchor References
✓ Machine-Readable Regulatory Exports

WHAT YOU DID NOT RECEIVE (Available in Tier 3+)
✗ Scenario Stress Tests
✗ Implementation Blueprint
✗ FORGE Certification
✗ Gauntlet Verdict

Upgrade to Tier 3: $5,000 → adds full workshop passes with stress tests and fusion documentation.`,
  tier3: `TIER 3 PACKAGE — WHAT YOU RECEIVED
✓ Everything from Tier 2
✓ Full Dossier with scenario stress tests
✓ Load-bearing insight
✓ Fusion documentation
✓ Killed findings list
✓ Implementation Roadmap
✓ Workshop pass history

WHAT YOU DID NOT RECEIVE (Available in Tier 4+)
✗ Authority & Ownership Map
✗ Third-Party Validation Request Template
✗ FORGE Certification
✗ Gauntlet Verdict

Upgrade to Tier 4: $15,000 → adds deep audit with implementation blueprint and stakeholder mapping.`,
  tier4: `TIER 4 PACKAGE — WHAT YOU RECEIVED
✓ Everything from Tier 3
✓ Implementation Blueprint
✓ Stakeholder & Authority Gap Map
✓ Authority & Ownership Map
✓ Third-Party Validation Request Template
✓ Fusion Fold Log

WHAT YOU DID NOT RECEIVE (Available in Tier 5+)
✗ FORGE Scoring Section
✗ FORGE Badge & Certificate

Upgrade to Tier 5: $25,000–35,000 → adds FORGE numerical certification with scoring.`,
  tier5: `TIER 5 PACKAGE — WHAT YOU RECEIVED
✓ Everything from Tier 4
✓ FORGE Scoring Section (11-axis EV, Uq, Cq)
✓ FORGE Scoring Sheet
✓ FORGE Badge & Certificate

WHAT YOU DID NOT RECEIVE (Available in Tier 6)
✗ Gauntlet Verdict Section
✗ Gauntlet Verdict Certificate
✗ Gauntlet Timeline

Upgrade to Tier 6: $35,000–50,000 → adds external hostile review with full provenance.`,
  tier6: `TIER 6 PACKAGE — WHAT YOU RECEIVED
✓ Everything from Tier 5
✓ Gauntlet Verdict Section (15-role council)
✓ Gauntlet Verdict Certificate
✓ Gauntlet Timeline
✓ Full provenance and external hostile proof

This is the highest tier. No further upgrades available.`
};

// ============================================================
// DOCUMENT TYPE TEMPLATES — general-purpose skeletons
// Ported verbatim from the web tool. Separate from TIER_TREES: these
// are starting points, not priced deliverables.
// ============================================================
const DOCUMENT_TYPES = {
  contract: {
    label: 'Contract Review',
    tree: `ContractName_Review_Date/
├── 01_Contract_Summary.md
├── 02_Clause_By_Clause_Analysis.md
├── 03_Redline_Recommendations.md
├── 04_Risk_Flags.csv
├── 05_Supporting_Documents/
│   ├── Original_Contract.pdf
│   └── Prior_Correspondence.pdf
├── Hash_Manifest.txt
├── Verification_Checklist.txt
└── README.txt`,
    placeholders: {
      readmeIntro: 'This package reviews a contract for risk, ambiguity, and unfavorable terms. Read 01_Contract_Summary.md first, then work through the clause-by-clause analysis and risk flags before touching the redline recommendations.',
      checklist: [
        'Confirm the original contract in 05_Supporting_Documents/ matches the version under review.',
        'Verify every clause flagged in 02_Clause_By_Clause_Analysis.md has a corresponding entry in 04_Risk_Flags.csv.',
        'Confirm redlines in 03_Redline_Recommendations.md do not conflict with each other.',
        'Check governing law and jurisdiction clauses against the counterparty\'s location.',
        'Confirm termination and renewal terms are clearly dated.'
      ]
    },
    nextSteps: [
      'Read 01_Contract_Summary.md for the high-level picture.',
      'Work through 02_Clause_By_Clause_Analysis.md alongside the original contract.',
      'Prioritize 04_Risk_Flags.csv by severity before drafting any redlines.',
      'Use 03_Redline_Recommendations.md as a starting point for negotiation — verify it against your own risk tolerance first.'
    ]
  },
  policy: {
    label: 'Policy Audit',
    tree: `PolicyName_Audit_Date/
├── 01_Executive_Summary.md
├── 02_Policy_Gap_Analysis.md
├── 03_Compliance_Findings.csv
├── 04_Remediation_Plan.md
├── 05_Supporting_Evidence/
│   └── Original_Policy_Document.pdf
├── Regulatory_Anchor_References.txt
├── Hash_Manifest.txt
├── Verification_Checklist.txt
└── README.txt`,
    placeholders: {
      readmeIntro: 'This package audits a policy document against its stated scope and applicable regulatory anchors. Start with 01_Executive_Summary.md, then review the gap analysis and compliance findings before acting on the remediation plan.',
      checklist: [
        'Confirm the policy version reviewed matches the version currently in force.',
        'Verify each finding in 03_Compliance_Findings.csv cites a specific policy section.',
        'Confirm 04_Remediation_Plan.md addresses every finding, not just the high-severity ones.',
        'Check Regulatory_Anchor_References.txt against the policy\'s actual scope (jurisdiction, data types, sector).',
        'Confirm sign-off / ownership is assigned for each remediation item.'
      ],
      anchors: [
        'GDPR (EU) — if personal data of EU residents is in scope',
        'HIPAA (US) — if protected health information is in scope',
        'Applicable state privacy statute (e.g. CCPA/CPRA) — name the actual one'
      ]
    },
    nextSteps: [
      'Read 01_Executive_Summary.md for the high-level picture.',
      'Work through 02_Policy_Gap_Analysis.md and 03_Compliance_Findings.csv together.',
      'Edit Regulatory_Anchor_References.txt to reflect the anchors that actually apply.',
      'Assign an owner and date to every item in 04_Remediation_Plan.md.'
    ]
  },
  regulatory: {
    label: 'Regulatory Filing',
    tree: `FilingName_Regulatory_Date/
├── 01_Filing_Summary.md
├── 02_Regulatory_Cross_Reference.csv
├── 03_Compliance_Attestation.md
├── 04_Supporting_Exhibits/
│   └── Original_Filing_Draft.pdf
├── Regulatory_Anchor_References.txt
├── Hash_Manifest.txt
├── Verification_Checklist.txt
└── README.txt`,
    placeholders: {
      readmeIntro: 'This package supports a regulatory filing under review. Start with 01_Filing_Summary.md, verify every cross-reference, and confirm the compliance attestation before the filing is submitted.',
      checklist: [
        'Confirm 04_Supporting_Exhibits/ contains the exact filing draft under review.',
        'Verify every row in 02_Regulatory_Cross_Reference.csv points to a real, current citation.',
        'Confirm 03_Compliance_Attestation.md is signed by someone with authority to attest.',
        'Check filing deadlines against the current regulatory calendar.',
        'Confirm Regulatory_Anchor_References.txt lists the actual regulator/statute this filing is made under.'
      ],
      anchors: [
        'Sector-specific regulator rule set — name the applicable regulator (e.g. SEC, FTC, FDA)',
        'GDPR (EU) — if personal data is in scope',
        'Relevant state or federal disclosure requirement — name the actual statute'
      ]
    },
    nextSteps: [
      'Read 01_Filing_Summary.md for the high-level picture.',
      'Verify every entry in 02_Regulatory_Cross_Reference.csv against the current statute or rule text.',
      'Edit Regulatory_Anchor_References.txt to name the actual regulator and citation.',
      'Get 03_Compliance_Attestation.md signed before submission.'
    ]
  },
  ai_governance: {
    label: 'AI Governance Framework',
    tree: `FrameworkName_Governance_Date/
├── 01_Framework_Overview.md
├── 02_Risk_Classification_Matrix.csv
├── 03_Control_Mapping.md
├── 04_Stakeholder_Roles.md
├── 05_Supporting_References/
│   └── Original_Framework_Draft.pdf
├── Regulatory_Anchor_References.txt
├── Hash_Manifest.txt
├── Verification_Checklist.txt
└── README.txt`,
    placeholders: {
      readmeIntro: 'This package documents an AI governance framework: how a system is classified, controlled, and owned. Start with 01_Framework_Overview.md, then confirm every control in 03_Control_Mapping.md has a named owner in 04_Stakeholder_Roles.md.',
      checklist: [
        'Confirm 02_Risk_Classification_Matrix.csv reflects the system\'s actual deployment context, not just its technical capability.',
        'Verify every control in 03_Control_Mapping.md maps to a specific row in the risk matrix.',
        'Confirm 04_Stakeholder_Roles.md assigns a named owner for each control.',
        'Check Regulatory_Anchor_References.txt against where the system is actually deployed.',
        'Confirm the framework has a defined review/update cadence.'
      ],
      anchors: [
        'EU AI Act — if the system is an "AI system" under the Act\'s definition',
        'NIST AI Risk Management Framework',
        'Sector-specific AI guidance — name the applicable one (e.g. FDA SaMD, EEOC automated hiring guidance)'
      ]
    },
    nextSteps: [
      'Read 01_Framework_Overview.md for the high-level picture.',
      'Fill in 02_Risk_Classification_Matrix.csv for every system component in scope.',
      'Map each risk to a control in 03_Control_Mapping.md, then to a named owner in 04_Stakeholder_Roles.md.',
      'Edit Regulatory_Anchor_References.txt to reflect where the system is actually deployed.'
    ]
  },
  research: {
    label: 'Research Paper / Grant Proposal',
    tree: `ProjectName_Research_Date/
├── 01_Abstract.md
├── 02_Literature_Review.md
├── 03_Methodology.md
├── 04_Budget_Justification.csv
├── 05_Supporting_Materials/
│   ├── Prior_Publications.pdf
│   └── Letters_Of_Support.pdf
├── Hash_Manifest.txt
├── Verification_Checklist.txt
└── README.txt`,
    placeholders: {
      readmeIntro: 'This package supports a research paper or grant proposal. Start with 01_Abstract.md, then build out the literature review and methodology before finalizing the budget justification.',
      checklist: [
        'Confirm 01_Abstract.md accurately summarizes 03_Methodology.md.',
        'Verify every claim in 02_Literature_Review.md has a citation.',
        'Confirm 04_Budget_Justification.csv line items sum to the total requested.',
        'Check that 05_Supporting_Materials/ includes current, signed letters of support.',
        'Confirm the proposal meets the funder\'s specific formatting requirements.'
      ]
    },
    nextSteps: [
      'Draft 01_Abstract.md last, after the other sections are stable — it should summarize, not preview.',
      'Build 02_Literature_Review.md and 03_Methodology.md together so claims and methods line up.',
      'Reconcile 04_Budget_Justification.csv against the narrative before submission.',
      'Confirm every file in 05_Supporting_Materials/ is current and signed where required.'
    ]
  },
  sop: {
    label: 'Internal SOP / Playbook',
    tree: `ProcessName_SOP_Date/
├── 01_Purpose_And_Scope.md
├── 02_Step_By_Step_Procedure.md
├── 03_Roles_And_Responsibilities.md
├── 04_Escalation_Path.md
├── 05_Supporting_Materials/
│   └── Reference_Documents.pdf
├── Revision_History.csv
├── Hash_Manifest.txt
├── Verification_Checklist.txt
└── README.txt`,
    placeholders: {
      readmeIntro: 'This package documents an internal standard operating procedure. Start with 01_Purpose_And_Scope.md, then work through the procedure and roles before publishing.',
      checklist: [
        'Confirm 02_Step_By_Step_Procedure.md matches how the process is actually performed today.',
        'Verify every role named in 03_Roles_And_Responsibilities.md is a real, current position.',
        'Confirm 04_Escalation_Path.md includes a named contact and a response-time expectation.',
        'Check Revision_History.csv is updated with this revision.',
        'Confirm the SOP has an assigned review date.'
      ]
    },
    nextSteps: [
      'Read 01_Purpose_And_Scope.md to confirm this is still the right process boundary.',
      'Walk 02_Step_By_Step_Procedure.md against how the work is actually done, not how it was designed.',
      'Confirm every name in 03_Roles_And_Responsibilities.md and 04_Escalation_Path.md is current.',
      'Log this revision in Revision_History.csv before publishing.'
    ]
  }
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
// PARSER — FORGE-HARDENED v2.6.5
// ============================================================
/**
 * FORGE-HARDENED parseTree — v2.6.5
 * Converts ASCII tree structure to nested folder/file hierarchy.
 * 
 * @param {string} input - Raw tree text
 * @param {string} projectName - Fallback root name
 * @returns {{
 *   root: { name: string, type: 'folder', children: Array },
 *   fileCount: number,
 *   folderCount: number,
 *   warnings: Array<{ severity: 'info'|'warn'|'error', type: string, line?: number, message: string }>
 * }}
 */
function parseTree(input, projectName = 'my-project') {
  const TREE_CHARS = /[├└│─]/g;
  
  const rawLines = input.split('\n');
  const parsedLines = [];
  
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (!line.trim()) continue;
    
    // FORGE FIX EL-001: Robust depth counting — handles variable spacing after "│"
    let depth = 0;
    let j = 0;
    while (j < line.length) {
      const ch = line[j];
      if (ch === '│') {
        depth++;
        j++;
        while (j < line.length && line[j] === ' ') j++;
      } else if (ch === '├' || ch === '└') {
        break;
      } else if (ch === ' ' || ch === '\t') {
        j++;
      } else {
        break;
      }
    }
    
    let cleanedLine = line.replace(TREE_CHARS, '');
    let content = cleanedLine.trim();
    if (!content) continue;
    
    content = stripComments(content);
    
    const isFolder = content.endsWith('/');
    const rawName = isFolder ? content.slice(0, -1).trim() : content.trim();
    if (!rawName) continue;
    
    let name = sanitizeName(rawName);
    name = name.replace(TREE_CHARS, '');
    if (!name) continue;
    
    parsedLines.push({ depth, name, isFolder, rawName, lineNumber: i + 1 });
  }
  
  if (!parsedLines.length) {
    return {
      root: { name: sanitizeProjectName(projectName), type: 'folder', children: [] },
      fileCount: 0,
      folderCount: 0,
      warnings: [{ severity: 'error', type: 'empty_input', message: 'No valid lines found in input' }]
    };
  }
  
  // FORGE FIX EL-002: Documented asymmetry — root is pre-counted
  let rootName = sanitizeProjectName(projectName);
  if (parsedLines[0] && parsedLines[0].depth === 0 && parsedLines[0].isFolder) {
    rootName = parsedLines[0].name;
    parsedLines.shift();
  }
  
  const root = { name: rootName, type: 'folder', children: [] };
  
  // FORGE FIX SA-002: Clear comment explaining stack pop logic
  // Stack tracks { node, depth, path }
  // We pop while stack top depth >= current depth to return to the correct parent
  const stack = [{ node: root, depth: -1, path: rootName }];
  
  // FORGE FIX SA-003: pathMap tracks full paths for duplicate detection
  const pathMap = new Map();
  
  let fileCount = 0;
  let folderCount = 1; // Root is pre-counted
  const warnings = [];
  
  // FORGE FIX EL-003 & CP-002: Structured warnings with severity
  function addWarning(severity, type, lineNumber, message) {
    warnings.push({ severity, type, line: lineNumber, message });
  }
  
  for (let i = 0; i < parsedLines.length; i++) {
    const item = parsedLines[i];
    let { depth, name, isFolder, rawName, lineNumber } = item;
    
    name = name.replace(TREE_CHARS, '');
    
    // Pop stack to find parent — pops past siblings (>= depth) to reach parent
    while (stack.length > 1 && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }
    
    const parent = stack[stack.length - 1].node;
    const parentPath = stack[stack.length - 1].path;
    
    // Build full path for duplicate detection
    const fullPath = parentPath + '/' + name;
    
    if (isFolder) {
      if (pathMap.has(fullPath)) {
        addWarning('info', 'duplicate_folder', lineNumber, `Merged duplicate folder "${rawName}" into existing`);
        stack.push({ node: pathMap.get(fullPath), depth, path: fullPath });
        continue;
      }
      
      if (pathMap.has(fullPath) && pathMap.get(fullPath).type === 'file') {
        const newName = name + '_folder';
        addWarning('warn', 'type_conflict_folder', lineNumber, `"${rawName}" conflicts with existing file — renamed to "${newName}"`);
        name = newName;
      }
      
      const folder = { name, type: 'folder', children: [] };
      parent.children.push(folder);
      pathMap.set(fullPath, folder);
      folderCount++;
      stack.push({ node: folder, depth, path: fullPath });
      
    } else {
      if (pathMap.has(fullPath)) {
        const existing = pathMap.get(fullPath);
        if (existing.type === 'folder') {
          const newName = name + '.txt';
          addWarning('warn', 'type_conflict_file', lineNumber, `"${rawName}" conflicts with existing folder — renamed to "${newName}"`);
          name = newName;
        } else {
          const base = name.replace(/\.[^/.]+$/, '');
          const ext = name.split('.').pop() || 'txt';
          let counter = 1;
          let newName = `${base}_${counter}.${ext}`;
          let newPath = parentPath + '/' + newName;
          while (pathMap.has(newPath)) {
            counter++;
            newName = `${base}_${counter}.${ext}`;
            newPath = parentPath + '/' + newName;
          }
          addWarning('info', 'duplicate_file', lineNumber, `"${rawName}" already exists — renamed to "${newName}"`);
          name = newName;
        }
      }
      
      const finalPath = parentPath + '/' + name;
      const file = { name, type: 'file' };
      parent.children.push(file);
      pathMap.set(finalPath, file);
      fileCount++;
    }
  }
  
  if (fileCount > CONFIG.MAX_FILES) {
    throw new Error(`Too many files (max ${CONFIG.MAX_FILES})`);
  }
  if (folderCount > CONFIG.MAX_FOLDERS) {
    throw new Error(`Too many folders (max ${CONFIG.MAX_FOLDERS})`);
  }
  
  const actualDepth = Math.max(...parsedLines.map(l => l.depth), 0);
  if (actualDepth > CONFIG.MAX_DEPTH) {
    addWarning('warn', 'depth_exceeded', null, `Maximum depth ${CONFIG.MAX_DEPTH} exceeded (actual: ${actualDepth}) — tree may be truncated`);
  }
  
  return { 
    root, 
    fileCount, 
    folderCount: folderCount - 1, // Subtract root from count
    warnings 
  };
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
// CRYPTOGRAPHIC VERIFICATION
//
// Isomorphic on purpose: sha256Hex prefers the browser's native
// crypto.subtle when present, falling back to Node's crypto module
// otherwise. The require('crypto') call only ever executes on the
// Node branch — a browser never reaches that line — so this file stays
// safe to load via a bare <script> tag as well as require().
// ============================================================
async function sha256Hex(data) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const nodeCrypto = require('crypto');
  return nodeCrypto.createHash('sha256').update(Buffer.from(data)).digest('hex');
}

/**
 * Builds real Hash_Manifest.txt content from actual file bytes.
 * fileEntries: [{ name, data }] — directories and the manifest file
 * itself are expected to already be excluded by the caller.
 * onProgress(done, total), if given, fires after each file is hashed.
 */
async function buildHashManifest(fileEntries, onProgress) {
  const lines = [];
  for (let i = 0; i < fileEntries.length; i++) {
    const hex = await sha256Hex(fileEntries[i].data);
    lines.push(`${hex}  ${fileEntries[i].name}`);
    if (onProgress) onProgress(i + 1, fileEntries.length);
  }
  lines.sort();
  const header = `# Hash Manifest\n# Generated by AionSystem — SHA-256, computed at build time\n# Format: <sha256>  <path>\n\n`;
  return header + lines.join('\n') + (lines.length ? '\n' : '');
}

/**
 * Builds NEXT_STEPS.md — ordered, document-type-aware instructions,
 * falling back to a generic checklist when no type is selected.
 */
/**
 * Builds NEXT_STEPS.md — ordered, document-type-aware instructions,
 * falling back to a generic checklist when no type is selected.
 * hashManifestPath, if given, is Hash_Manifest.txt's own path relative to
 * the SAME base directory as projectName/ itself (i.e. exactly the kind
 * of path that appears inside Hash_Manifest.txt's own listing) — Hash_
 * Manifest.txt is not always at the project root (tier packages nest it
 * under an evidence subfolder), and its listed paths are relative to the
 * directory *containing* the project folder, not to wherever the
 * manifest file itself sits. Without the real path, "sha256sum -c
 * Hash_Manifest.txt" run from the wrong directory silently fails to find
 * the file — so the instruction is only included when a real path is
 * known, and it's pinned to the directory the command actually works from.
 */
function buildNextSteps(projectName, docType, tierManifestContent, hashManifestPath) {
  const docMeta = DOCUMENT_TYPES[docType];
  const steps = docMeta ? docMeta.nextSteps : [
    'Confirm every placeholder file above has been replaced with real content.',
    'Work through files in numeric order where they are numbered.',
    'Confirm nothing marked "Placeholder — replace with actual content." remains.'
  ];
  let md = `# Next Steps — ${projectName}\n\n## How to complete this package\n`;
  steps.forEach((s, i) => { md += `${i + 1}. ${s}\n`; });
  if (hashManifestPath) {
    md += `\n## Verifying file integrity\nFrom the directory that contains "${projectName}/" (one level above this package's own folder — e.g. where you extracted the ZIP, or ran this tool's --output), run:\n\n    sha256sum -c "${hashManifestPath}"\n\nAny line reporting FAILED means that file no longer matches what was hashed at build time — do not rely on it without investigating.\n`;
  }
  if (tierManifestContent) md += `\nSee Tier_Manifest.txt for what is (and isn't) included at this tier.\n`;
  md += `\n## Questions or issues\n[ADD CONTACT NAME / EMAIL HERE]\n`;
  return md;
}

// ============================================================
// TIER STRUCTURAL VALIDATION
// ============================================================

/**
 * Flattens a parsed tree into a set of paths relative to (excluding) the
 * tree's own root name, folders suffixed with '/'. Excluding the root
 * name lets a tree loaded under one client/project name be compared
 * against a tier template that uses a different placeholder root name.
 */
function getFlatPaths(tree) {
  const paths = new Set();
  function walk(node, prefix) {
    const full = prefix ? `${prefix}/${node.name}` : node.name;
    if (node.type === 'folder') {
      paths.add(full + '/');
      (node.children || []).forEach(c => walk(c, full));
    } else {
      paths.add(full);
    }
  }
  (tree.children || []).forEach(c => walk(c, ''));
  return paths;
}

/**
 * Compares a parsed tree against a named tier's canonical structure.
 * Returns null for an unknown tier key, otherwise { missing, extra }
 * (both sorted arrays of relative paths).
 */
function validateAgainstTier(tree, tierKey) {
  const canonicalText = TIER_TREES[tierKey];
  if (!canonicalText) return null;
  const canonical = parseTree(canonicalText, 'x').root;
  const canonicalPaths = getFlatPaths(canonical);
  const currentPaths = getFlatPaths(tree);
  const missing = [...canonicalPaths].filter(p => !currentPaths.has(p)).sort();
  const extra = [...currentPaths].filter(p => !canonicalPaths.has(p)).sort();
  return { missing, extra };
}

// ============================================================
// PLACEHOLDER GENERATION
// ============================================================
function generatePlaceholder(name, fullPath, includePlaceholders = true, projectName = 'my-project', docType = null, tierManifestContent = '') {
  if (!includePlaceholders) return '';
  
  if (isBinary(name)) {
    return `# BINARY PLACEHOLDER\n# Replace with actual ${name.split('.').pop()?.toUpperCase()} file\n`;
  }

  const docMeta = DOCUMENT_TYPES[docType];

  // Document-review-package filenames — shared with the web tool's tier
  // packages and document-type templates. Checked before the generic
  // extension-based rules below so a tier/doctype tree's own files (which
  // may also end in .md, .csv, .json) get meaningful content instead of
  // the generic dev-scaffolding placeholders.
  if (name === 'README.txt') {
    let body = `# ${projectName}\n\nGenerated by AION Scaffold v2.7.0\n\n`;
    body += docMeta
      ? `## How to use this package\n${docMeta.placeholders.readmeIntro}\n\n`
      : `Review package for document red-team analysis.\n\n`;
    body += `Tier: ${tierManifestContent ? tierManifestContent.split('\n')[0] : 'Custom'}\n`;
    return body;
  }

  if (name === 'Hash_Manifest.txt') {
    // Real content is filled in by the caller (writeTree / exportAsShellScript)
    // after every sibling file's SHA-256 has been computed — this is only a
    // fallback for callers that invoke generatePlaceholder directly without
    // doing that two-pass hashing step.
    return `# Hash Manifest\n# Populated with real SHA-256 hashes at build time.\n`;
  }

  if (name === 'Verification_Checklist.txt') {
    const items = docMeta ? docMeta.placeholders.checklist : [
      'Confirm original document is included.',
      'Verify hashes in Hash_Manifest.txt.',
      'Review findings register and dossier.'
    ];
    let body = `# Verification Checklist\n\n`;
    items.forEach((it, i) => { body += `${i + 1}. ${it}\n`; });
    return body;
  }

  if (name === 'Regulatory_Anchor_References.txt') {
    const anchors = docMeta?.placeholders?.anchors;
    let body = `# Regulatory Anchor References\n# Starting suggestions to edit against the actual scope — not legal advice.\n\n`;
    if (anchors && anchors.length) anchors.forEach(a => { body += `- ${a}\n`; });
    else body += `- [ADD APPLICABLE REGULATION / STANDARD]\n`;
    return body;
  }

  const ext = name.split('.').pop();

  // Tier-specific CSV/JSON headers — matched by filename substring, so
  // these only fire for the tier package's own files and never change
  // behavior for an unrelated project's .csv or .json files (which still
  // fall through to the generic handling / empty-file default below).
  if (ext === 'csv') {
    if (name.includes('Review_Ledger') || name.includes('Applied_Fixes') || name.includes('Workshop_Pass')) return 'Finding ID,Severity,Status,Owner,Notes\n';
    if (name.includes('Risk_Matrix')) return 'Finding ID,Severity,Likelihood,Target,Description\n';
    if (name.includes('Regulatory_Currency')) return 'Anchor,Cited For,Status,Next Check\n';
    if (name.includes('Gauntlet')) return 'Pass,Date,Verdict,Notes\n';
    if (name.includes('FORGE_Scoring')) return 'Axis,Score,Uq,Cq,Notes\n';
  }
  if (ext === 'json' && name !== 'package.json' && name !== 'tsconfig.json') {
    if (name.includes('Findings_Register') || name.includes('Open_Findings')) return '[]\n';
  }

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
    return `# ${baseName.replace(/-/g, ' ').toUpperCase()}\n\n## Overview\n\n[Generated by AION Scaffold v2.7.0]\n`;
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

async function exportAsShellScript(tree, includePlaceholders = true, projectName = 'my-project', docType = null, tierManifestContent = '') {
  // Phase 1: precompute every file's content up front (matching writeTree's
  // approach) so Hash_Manifest.txt — if the tree includes one — can be
  // filled with real digests of its siblings before any script text is
  // written, and so Tier_Manifest.txt / NEXT_STEPS.md can be appended
  // alongside the tree's own files rather than bolted on separately.
  const entries = []; // { relPath, isHashManifest, content }
  function collect(node, currentPath = '') {
    const safeName = sanitizeName(node.name);
    const fullPath = currentPath ? `${currentPath}/${safeName}` : safeName;
    if (node.type === 'folder') {
      (node.children || []).forEach(c => collect(c, fullPath));
    } else {
      const isHashManifest = node.name === 'Hash_Manifest.txt';
      const content = (includePlaceholders && !isHashManifest)
        ? generatePlaceholder(node.name, fullPath, true, projectName, docType, tierManifestContent)
        : '';
      entries.push({ relPath: fullPath, isHashManifest, content });
    }
  }
  (tree.children || []).forEach(c => collect(c, ''));

  const hashManifestEntryPre = entries.find(e => e.isHashManifest);
  const hashManifestRelPath = hashManifestEntryPre ? hashManifestEntryPre.relPath : null;

  if (tierManifestContent) {
    entries.push({ relPath: 'Tier_Manifest.txt', isHashManifest: false, content: includePlaceholders ? tierManifestContent : '' });
  }
  entries.push({ relPath: 'NEXT_STEPS.md', isHashManifest: false, content: includePlaceholders ? buildNextSteps(tree.name, docType, tierManifestContent, hashManifestRelPath) : '' });

  // Phase 2: fill Hash_Manifest.txt (if present) with real SHA-256 digests.
  if (includePlaceholders) {
    const hashManifestEntry = entries.find(e => e.isHashManifest);
    if (hashManifestEntry) {
      const hashable = entries.filter(e => !e.isHashManifest).map(e => ({ name: e.relPath, data: Buffer.from(e.content, 'utf8') }));
      hashManifestEntry.content = await buildHashManifest(hashable);
    }
  }
  const contentByPath = new Map(entries.map(e => [e.relPath, e.content]));

  // Phase 3: write the actual script text.
  let script = '#!/usr/bin/env bash\nset -e\n# Generated by AION Scaffold v2.7.0\n\n';

  function writeFile(fullPath) {
    script += `touch "${fullPath}"\n`;
    const content = contentByPath.get(fullPath) ?? '';
    if (content) {
      // FORGE FIX HD-001: a heredoc body that doesn't already end in a
      // newline runs its content into the closing "EOF" on the same line,
      // which bash does not recognize as the delimiter — the heredoc
      // never terminates. package.json / tsconfig.json (JSON.stringify
      // output has no trailing newline) triggered this. Always inserting
      // one newline before the delimiter fixes it for every content type.
      script += `cat > "${fullPath}" << 'EOF'\n${content}\nEOF\n`;
    }
  }

  function add(node, currentPath = '') {
    const safeName = sanitizeName(node.name);
    const fullPath = currentPath ? `${currentPath}/${safeName}` : safeName;
    if (node.type === 'folder') {
      script += `mkdir -p "${fullPath}"\n`;
      (node.children || []).forEach(c => add(c, fullPath));
    } else if (includePlaceholders) {
      writeFile(fullPath);
    } else {
      script += `touch "${fullPath}"\n`;
    }
  }
  
  const rootName = sanitizeName(tree.name);
  script += `mkdir -p "${rootName}"\ncd "${rootName}"\n`;
  (tree.children || []).forEach(c => add(c, ''));
  if (tierManifestContent) {
    if (includePlaceholders) writeFile('Tier_Manifest.txt'); else script += `touch "Tier_Manifest.txt"\n`;
  }
  if (includePlaceholders) writeFile('NEXT_STEPS.md'); else script += `touch "NEXT_STEPS.md"\n`;
  script += `\necho "✅ ${rootName} created."\n`;
  
  return script;
}

// ============================================================
// EXPORTS
// ============================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
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
    sha256Hex,
    buildHashManifest,
    buildNextSteps,
    getFlatPaths,
    validateAgainstTier
  };
}
