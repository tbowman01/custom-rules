# Copilot Glue for `.claude/rules`

Manage **one canonical ruleset** under `.claude/rules/` and use it seamlessly with **GitHub Copilot Chat/Agent** (without depending on Claude runtime). This glue provides:

- A tiny Node tool to **assemble** your rules into a single, trimmed preamble.
- VS Code **Tasks** + **Keybinding** to copy the preamble to clipboard (one keystroke).
- A repeatable **workflow** to inject rules into Copilot Chat, pin the rules file, and keep sessions consistent.
- Optional CI checks to prevent drift.

> Works cross‑platform (macOS, Linux, Windows). No proprietary SDKs.

---

## 1) Directory layout

```
.claude/
  rules/
    00-base.md
    10-language-ts.md
    20-security.md
scripts/
  rules-build.mjs
  rules-preamble.mjs
  rules-to-copilot.mjs
  util-clipboard.mjs
.vscode/
  tasks.json
  keybindings.json
  settings.json
package.json
```

---

## 2) `package.json`

```json
{
  "name": "copilot-claude-rules-glue",
  "private": true,
  "type": "module",
  "scripts": {
    "rules:build": "node scripts/rules-build.mjs",
    "rules:preamble": "node scripts/rules-preamble.mjs",
    "rules:copy": "node scripts/rules-to-copilot.mjs --copy",
    "rules:file": "node scripts/rules-to-copilot.mjs --write .copilot/session-rules.md",
    "rules:open": "node scripts/rules-to-copilot.mjs --write .copilot/session-rules.md --open"
  },
  "devDependencies": {}
}
```

> You don’t need any NPM deps. Pure Node (v18+ recommended).

---

## 3) Clipboard helper: `scripts/util-clipboard.mjs`

```js
// Cross‑platform clipboard write (mac: pbcopy, win: clip, linux: wl-copy/xclip)
import { spawnSync } from 'node:child_process';

export function copyToClipboard(text) {
  const platform = process.platform;
  const opts = { input: text, encoding: 'utf8' };

  if (platform === 'darwin') {
    const res = spawnSync('pbcopy', [], opts);
    if (res.status === 0) return true;
  } else if (platform === 'win32') {
    const res = spawnSync('clip', [], opts);
    if (res.status === 0) return true;
  } else {
    // Try wl-copy, then xclip, then xsel
    for (const cmd of [['wl-copy'], ['xclip', '-selection', 'clipboard'], ['xsel', '--clipboard', '--input']]) {
      const res = spawnSync(cmd[0], cmd.slice(1), opts);
      if (res.status === 0) return true;
    }
  }
  return false;
}
```

---

## 4) Build the unified rules blob: `scripts/rules-build.mjs`

```js
import { readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';

const RULES_DIR = '.claude/rules';

function normalize(md) {
  // Strip HTML comments and large images to save tokens
  md = md.replace(/<!--([\s\S]*?)-->/g, '');
  md = md.replace(/!\[[^\]]*\]\([^)]*\)/g, '[image removed]');
  // Collapse excessive whitespace
  md = md.replace(/\n{3,}/g, '\n\n');
  return md.trim();
}

function sortRuleFiles(files) {
  // Numeric prefixes (00-,10-) first by number, then by name
  return files.sort((a, b) => {
    const ax = a.match(/^(\d+)-/); const bx = b.match(/^(\d+)-/);
    if (ax && bx) return Number(ax[1]) - Number(bx[1]) || a.localeCompare(b);
    if (ax) return -1; if (bx) return 1; return a.localeCompare(b);
  });
}

const files = sortRuleFiles(readdirSync(RULES_DIR).filter(f => f.endsWith('.md')));

const parts = files.map(f => {
  const body = normalize(readFileSync(join(RULES_DIR, f), 'utf8'));
  return `\n\n## ${basename(f)}\n${body}`;
});

const banner = [
  '# Project Guardrails (Provider‑agnostic)\n',
  '- Apply these rules to ALL prompts, edits, code suggestions.\n',
  '- If a rule conflicts, the **lowest‑numbered file wins** (00‑base over 20‑security).\n',
  '- Keep responses factual, test‑driven, and security‑first.\n'
].join('\n');

process.stdout.write(banner + parts.join('\n') + '\n');
```

---

## 5) Create a trimmed preamble for Copilot Chat: `scripts/rules-preamble.mjs`

```js
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

// Token‑conscious preamble builder.
// 1) Pull full rules from rules-build
// 2) Trim to a target char budget (default 12k chars ~ safe for chat preamble)

const TARGET = Number(process.env.RULES_CHAR_BUDGET || 12000);

function build() {
  const blob = execSync('node scripts/rules-build.mjs', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  const header = '# Session Preamble for Copilot\n\n' +
    'Adhere to the following guardrails for this session. Summarize/abide, do not restate verbatim in every reply.\n\n';
  let text = header + blob;
  if (text.length > TARGET) {
    // Basic truncation with footer note. Keep front‑matter + earliest rules.
    text = text.slice(0, TARGET);
    text += `\n\n[Truncated at ${TARGET} chars. Full rules available in repo under .claude/rules/]`;
  }
  return text;
}

process.stdout.write(build());
```

---

## 6) Generate + copy or write file: `scripts/rules-to-copilot.mjs`

```js
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { copyToClipboard } from './util-clipboard.mjs';

function buildPreamble() {
  return execSync('node scripts/rules-preamble.mjs', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
}

const args = process.argv.slice(2);
const shouldCopy = args.includes('--copy');
const writeIdx = args.indexOf('--write');
const openIdx = args.indexOf('--open');

const preamble = buildPreamble();

if (shouldCopy) {
  const ok = copyToClipboard(preamble);
  if (!ok) {
    console.error('Clipboard copy failed. On Linux, install wl-clipboard or xclip/xsel.');
    process.exit(2);
  }
  console.log('Rules preamble copied to clipboard. Paste into Copilot Chat and pin the file.');
}

if (writeIdx !== -1) {
  const outPath = args[writeIdx + 1] || '.copilot/session-rules.md';
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, preamble, 'utf8');
  console.log('Rules preamble written to', outPath);
  if (openIdx !== -1) {
    try { execSync(`code "${outPath}"`, { stdio: 'ignore' }); } catch {}
  }
}
```

---

## 7) VS Code automation

### `.vscode/tasks.json`
```jsonc
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Rules: Copy preamble to clipboard",
      "type": "shell",
      "command": "npm run rules:copy",
      "problemMatcher": []
    },
    {
      "label": "Rules: Write + open session rules",
      "type": "shell",
      "command": "npm run rules:open",
      "problemMatcher": []
    }
  ]
}
```

### `.vscode/keybindings.json`
```jsonc
[
  { "key": "ctrl+alt+r", "command": "workbench.action.tasks.runTask", "args": "Rules: Copy preamble to clipboard", "when": "editorTextFocus" },
  { "key": "ctrl+alt+shift+r", "command": "workbench.action.tasks.runTask", "args": "Rules: Write + open session rules", "when": "editorTextFocus" }
]
```

### `.vscode/settings.json` (helpful UX)
```jsonc
{
  // Keep Copilot Chat visible for pinning rules file
  "workbench.panel.defaultLocation": "right",
  // Reduce chat noise while pasting long preambles
  "editor.wordWrap": "on"
}
```

> Note: Copilot **does not** auto‑ingest `.claude/rules/`. The workflow below makes ingestion one keystroke.

---

## 8) Recommended Copilot Chat workflow (repeatable)

1. Press **Ctrl+Alt+R** → preamble copied.
2. Open **GitHub Copilot Chat** → Paste preamble as the **first message**.
3. **Attach/pin** the generated `.copilot/session-rules.md` (or reference `.claude/rules/*`) using the chat’s *Add file* button.
4. Start your prompt with: _“For this session, adhere to the pinned rules. Confirm with a one‑line summary of the key constraints.”_
5. Save the chat as a **workspace chat** (so the rules stay discoverable next time).

> Tip: If the preamble was truncated (budget exceeded), Copilot still has the **full files** pinned for grounding.

---

## 9) Optional: CI guard to prevent drift

Add a simple guard to ensure `.claude/rules` exists and isn’t empty before merging.

`.github/workflows/rules-guard.yml`
```yaml
name: rules-guard
on:
  pull_request:
    paths:
      - '.claude/rules/**'
      - 'scripts/**'
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Ensure rules exist
        run: |
          test -d .claude/rules || (echo 'Missing .claude/rules' && exit 1)
          test "$(ls -1 .claude/rules/*.md | wc -l)" -gt 0 || (echo 'No rule files found' && exit 1)
```

---

## 10) Usage cheatsheet

- **One‑time**: place rule files in `.claude/rules/`.
- **Generate & copy**: `npm run rules:copy` → paste into Copilot Chat.
- **Create session file**: `npm run rules:file` → `.copilot/session-rules.md` ready to pin.
- **Open in VS Code**: `npm run rules:open`.
- **Adjust budget**: `RULES_CHAR_BUDGET=16000 npm run rules:copy`.

---

## 11) Notes & gotchas

- Copilot Chat does not persist “global rules.” You must paste/pin once per new session (this glue makes it < 2s).
- Keep the most critical guardrails in `00-base.md` so truncation retains priorities.
- For *enforcement* (not just guidance), complement rules with linters, tests, and pre‑push hooks.

---

## 12) Minimal example rules

`.claude/rules/00-base.md`
```md
# Core Guardrails
- Radical candor: absolute truthfulness. No simulated claims.
- Security-first: least privilege, zero-trust assumptions, no secrets in code.
- London TDD: write tests first, ensure coverage for new logic.
```

`.claude/rules/20-security.md`
```md
# Security Addenda
- Use distroless or Chainguard where possible.
- Generate SBOM (CycloneDX/Syft) and run Trivy on CI.
```

---

## 13) Why this works

- **Single source of truth** lives in `.claude/rules`.
- **Provider-agnostic**: works with Copilot, Cursor, Windsurf, etc., by pasting/pinning the generated session rules.
- **Low‑friction**: one hotkey → consistent guardrails for every Copilot session.

