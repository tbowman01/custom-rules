
# Trevor's Custom Rules CLI — README

## Overview

`@tbowman01/custom-rules` is a TypeScript CLI tool for project rules validation and enforcement. It provides scaffolding for configuration files, IDE integrations, and a comprehensive testing framework with strict TDD requirements.

---

## Features

* **TypeScript-First:** Built with strict TypeScript and comprehensive type safety
* **TDD Enforced:** 90% overall coverage, 100% for core/utils components
* **IDE Integration:** Support for VSCode, JetBrains, and Vim configurations
* **Profile System:** Environment-specific configurations with inheritance
* **Security-First:** Built-in command filtering and injection prevention
* **Modern Tooling:** Vitest, ESLint, Husky pre-commit hooks, GitHub Actions CI

---

## Installation
```sh
npm install @tbowman01/custom-rules --save-dev
```

Or run directly via `npx`:

```sh
npx @tbowman01/custom-rules@latest init --ide vscode
```

---

## Usage

```sh
# Initialize with IDE integration
custom-rules init --ide vscode

# Other IDE support
custom-rules init --ide jetbrains
custom-rules init --ide vim
custom-rules init --ide all

# Preview changes without writing
custom-rules init --dry-run --verbose

# Profile management
custom-rules profile list
custom-rules profile create production --interactive
custom-rules profile show development

# Run validation (future)
custom-rules run --report json
custom-rules validate
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

```sh
git clone https://github.com/tbowman01/custom-rules.git
cd custom-rules
```

2. Install dependencies:

```sh
npm install
```

3. Build and test:
```sh
# Build the project
npm run build

# Run tests with coverage
npm run coverage

# Test CLI locally
node dist/cli/main.js init --ide vscode --dry-run

# TDD development mode
npm run test:watch
```

4. Publish:

```sh
npm publish --access public
```

---

## Architecture

This project follows **Test-Driven Development (TDD)** with:
- **90%+ overall coverage** requirement
- **100% coverage** for `src/core/` and `src/utils/`  
- **Vitest** for testing with V8 coverage
- **Husky** pre-commit hooks enforcing quality gates
- **GitHub Actions** CI with coverage enforcement

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed development guidelines.

---

## Roadmap

* Implement actual rules validation engine
* Add plugin system for custom rules
* Enhanced interactive setup wizard
* Template marketplace integration
* Multi-project workspace support

---

## License

MIT © Trevor Bowman
