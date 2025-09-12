# Trevor's Custom Rules CLI — Product Requirements Document (PRD)

## Overview
A Node.js CLI tool that allows Trevor to quickly install his curated Markdown rule files into any project, placing them in the correct IDE-specific folder. The CLI should be installable and executable via `npx trevors-custom-rules@latest init` and support customization through flags, project-level config, and automation hooks.

---

## Goals
- Simplify onboarding of new projects by auto-copying Trevor's standard rule files.
- Support multiple IDE ecosystems (`cursor`, `windsurf`, `github`, `claude`).
- Provide safe defaults with options for overwriting, excluding files, and configuration.
- Allow teams to automate installation with a `postinstall` script.

---

## Features
- **IDE Selection:** Specify via `--ide` flag or `.trevors-rules.json` config.
- **Postinstall Hook:** Add/update `postinstall` script in target project’s `package.json`.
- **Exclude Patterns:** Skip certain files/folders with glob patterns.
- **Dry Run & List:** Preview planned file operations.
- **Force Mode:** Overwrite existing files if desired.
- **Custom Working Directory:** Support `--cwd` option to target other directories.
- **Cross-Platform:** Fully supported on Windows, macOS, and Linux.

---

## CLI Commands
### `init`
```bash
npx trevors-custom-rules@latest init [options]
```
**Options:**
- `--ide <ide>`: One of `cursor`, `windsurf`, `github`, `claude`.
- `--cwd <path>`: Specify directory (default: current working directory).
- `--force`: Overwrite existing files.
- `--dry-run`: Simulate without copying.
- `--list`: List files that would be copied.
- `--exclude <glob>`: Exclude file(s) by glob pattern.
- `--postinstall`: Add or update `postinstall` script.

---

## File Structure
```
trevors-custom-rules/
├─ package.json
├─ bin/
│  └─ cli.js
├─ templates/
│  ├─ common/
│  │  └─ ... common files ...
│  ├─ cursor/rules/
│  │  └─ RULES.md
│  ├─ windsurf/rules/
│  │  └─ RULES.md
│  ├─ github/rules/
│  │  └─ RULES.md
│  └─ claude/rules/
│     └─ RULES.md
└─ README.md
```

---

## Configuration
Projects can include a `.trevors-rules.json` file to define defaults:
```json
{
  "ide": "cursor",
  "excludes": ["**/.DS_Store", "**/*.bak"]
}
```

---

## Scaffolding Tasks
### 1. Initialize Repo
```bash
mkdir trevors-custom-rules && cd trevors-custom-rules
git init
npm init -y
touch README.md
mkdir -p bin templates/{common,cursor/rules,windsurf/rules,github/rules,claude/rules}
```

### 2. Implement CLI
Create `bin/cli.js` with Commander.js for argument parsing and `fast-glob` for excludes.

### 3. Templates
Seed `templates/` with example rule files for each IDE.

### 4. Publish to npm
```bash
npm login
npm version 0.1.0
npm publish --access public
```

### 5. Test Installation
```bash
mkdir test-project && cd test-project
npx trevors-custom-rules@latest init --ide cursor --dry-run --list
```

---

## Future Enhancements
- `--profile <name>` for alternative template sets.
- Remote template fetching via GitHub tags.
- Interactive mode to choose IDE and options.

---

## Success Metrics
- ✅ Easy to run in under 10 seconds in any project.
- ✅ IDE rules correctly placed without errors.
- ✅ Automation-friendly for new project bootstrapping.

