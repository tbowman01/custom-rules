# Trevor's Custom Rules CLI — README

## Overview

`trevors-custom-rules` is a Node.js CLI tool to quickly install and manage Trevor's curated Markdown rule files into any project. It automatically places rules in the correct IDE-specific folders, supports flexible configuration, and integrates automation through a `postinstall` script.

---

## Features

* **Easy Install:** Run `npx trevors-custom-rules@latest init` to set up instantly.
* **IDE Targets:** `--ide` flag to copy files into `.cursor/rules/`, `.windsurf/rules/`, `.github/rules/`, or `.claude/rules/`.
* **Project Config:** `.trevors-rules.json` for project-specific defaults.
* **Excludes:** Use `--exclude` to skip files.
* **Postinstall Hook:** Automate rule installation on every `npm install`.
* **Safe Defaults:** Won’t overwrite existing files unless `--force` is specified.

---

## Installation

```bash
npm install trevors-custom-rules --save-dev
```

Or run directly via `npx`:

```bash
npx trevors-custom-rules@latest init --ide cursor
```

---

## Usage

```bash
# Basic usage
npx trevors-custom-rules@latest init --ide cursor

# Other IDEs
npx trevors-custom-rules@latest init --ide windsurf
npx trevors-custom-rules@latest init --ide github
npx trevors-custom-rules@latest init --ide claude

# Preview changes without writing
npx trevors-custom-rules@latest init --dry-run --list

# Exclude specific files
npx trevors-custom-rules@latest init --ide github --exclude "**/*.bak,**/.DS_Store"

# Add postinstall automation
npx trevors-custom-rules@latest init --ide cursor --postinstall
```

---

## Project Config File

**.trevors-rules.json** (optional)

```json
{
  "ide": "cursor",
  "excludes": ["**/.DS_Store", "**/*.bak"]
}
```

---

## Options

| Flag               | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| `--ide <ide>`      | Target IDE folder: `cursor`, `windsurf`, `github`, `claude` |
| `--cwd <path>`     | Specify target project directory (default: CWD)             |
| `--force`          | Overwrite existing files                                    |
| `--dry-run`        | Simulate actions without writing                            |
| `--list`           | List planned file operations                                |
| `--exclude <glob>` | Glob(s) to exclude, comma-separated or repeatable           |
| `--postinstall`    | Add/update postinstall script in `package.json`             |

---

## Folder Structure

```
templates/
├─ common/           # Files for all projects (copied to root)
├─ cursor/rules/     # Cursor IDE-specific rules
├─ windsurf/rules/   # Windsurf IDE-specific rules
├─ github/rules/     # GitHub IDE-specific rules
└─ claude/rules/     # Claude IDE-specific rules
```

---

## Development

1. Clone the repo:

```bash
git clone https://github.com/tbowman01/trevors-custom-rules.git
cd trevors-custom-rules
```

2. Install dependencies:

```bash
npm install
```

3. Test locally:

```bash
node ./bin/cli.js init --ide cursor --dry-run --list
```

4. Publish:

```bash
npm publish --access public
```

---

## Roadmap

* Add `--profile` for alternative template sets.
* Support custom destination paths via `--dest`.
* Interactive setup wizard.

---

## License

MIT © Trevor Bowman
