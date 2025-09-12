
# Copilot Instructions for Trevor's Custom Rules CLI

## Architecture Overview

This is a **TypeScript-only CLI project** focused on scaffolding configuration files and IDE integration, with a planned evolution toward a full rules validation engine. The project follows **Test-Driven Development (TDD)** with strict coverage requirements.

### Key Components
- **CLI Interface**: TypeScript-based (`src/cli/`) using Commander.js with chalk for output formatting
- **Config Management**: YAML-based configuration with profile system and IDE-specific templates
- **Security-First**: Built-in command blocking and pattern filtering (see `templates/secure-config-example.yaml`)
- **Testing Strategy**: Vitest with 90% overall coverage, 100% for core/utils components

## Critical Development Patterns

### Configuration Loading Strategy
The `ConfigManager` class follows a **layered loading approach**:
```typescript
// Order: explicit config > .custom-rules.yaml > profiles/<name>.yaml > defaults
const configPaths = [
  explicit_config_path,
  path.join(cwd, '.custom-rules.yaml'),  
  path.join(cwd, 'profiles', `${profile}.yaml`),
  // Built-in defaults as fallback
];
```

### Command Structure Pattern
All commands follow this interface pattern from `GlobalOptions`:
```typescript
interface CommandOptions extends GlobalOptions {
  profile?: string;    // Which config profile to use
  dest?: string;      // Target directory (default: cwd)
  verbose?: boolean;  // Enhanced logging
  config?: string;    // Explicit config file path
}
```

### IDE Integration System
The `init` command generates IDE-specific configurations:
- **VSCode**: `.vscode/settings.json`, `extensions.json`, `tasks.json`
- **JetBrains**: `.idea/custom-rules.xml`, inspection profiles
- **Vim**: `.vim/custom-rules.vim`, `.vimrc.custom-rules`

Pattern: Each IDE type has a dedicated `create<IDE>Config()` function in `src/cli/commands/init.ts`.

## Essential Development Workflows

### Building and Testing (TDD Required)
```bash
npm run build       # TypeScript compilation to dist/
npm test            # Run all tests with Vitest
npm run test:unit   # Unit tests only (tests/unit/)
npm run test:int    # Integration tests only (tests/integration/)
npm run test:watch  # Watch mode for TDD
npm run coverage    # Generate coverage report (enforces 90%+ overall)
npm run lint        # ESLint on all .ts files
npm run typecheck   # TypeScript strict type checking
npm run precommit   # Full pre-commit validation (lint + types + coverage)
```

### CLI Development Testing
```bash
# Direct execution during development
node dist/cli/main.js init --dry-run --verbose

# Package testing
npm start -- init --ide vscode --profile development
```

### TDD Workflow (MANDATORY)
1. **Write/adjust tests first** (unit for core logic, then integration if CLI behavior changes)
2. **Make them fail** (prove the gap)
3. **Implement minimal code** to pass
4. **Refactor** with tests green; keep coverage thresholds intact
5. **Commit** (pre-commit hook enforces TDD + coverage)

### Adding New Commands
1. Create command handler in `src/cli/commands/<name>.ts`
2. **Write tests first** in `tests/unit/` (for logic) and `tests/integration/` (for CLI behavior)
3. Export function matching `async function <name>Command(options: <Name>Options): Promise<void>`
4. Import and wire in `src/cli/main.ts` using Commander.js pattern
5. Ensure 100% test coverage for pure logic components

## Testing Philosophy & Requirements

### Coverage Requirements
- **Overall**: ≥90% lines/branches/functions/statements
- **Core/Utils**: 100% coverage (unit tests only)
- **Integration**: CLI e2e, template generation, security validation

### Test Structure
```
tests/
  unit/           # Pure functions, isolated (core/, utils/) - 100% required
  integration/    # CLI e2e, adapters, template generation
  fixtures/       # Test data, golden snapshots
```

### Testing Patterns
- **Unit Tests**: No FS/process/network; use dependency injection and fakes
- **Integration Tests**: CLI e2e via `execa` in temp directories
- **Golden Snapshots**: For "effective plan" JSON and rendered templates  
- **Security Probes**: Path traversal, injection detection (expect blocks)
- **Determinism**: Freeze time/locale; stable sorting before snapshots

### ESLint Enforcement
- **Unit tests**: `no-console` error (must be mocked)
- **All tests**: Vitest globals enabled
- **TypeScript**: Strict mode, no unused vars

## Security Considerations

This project has **mandatory security filtering** for dangerous commands. The configuration schema includes:
- `security.neverExecute[]`: Catastrophic commands (e.g., `rm -rf /`)
- `security.blockedCommands[]`: Potentially dangerous patterns
- `security.unsafePatterns[]`: Regex patterns for command injection detection

**Always validate user input** against these filters before any file system operations.

## Project-Specific Conventions

### File Generation Strategy
- **Never overwrite without confirmation** unless `--force` is specified
- Support `--dry-run` for all destructive operations with detailed preview
- Use `--merge` flag for appending to existing configuration (implementation pending)
- Generate files with `# Generated by Copilot` comment headers

### Error Handling Pattern
```typescript
// Consistent error handling with verbose stack traces
try {
  await operation();
} catch (error) {
  console.error(chalk.red('Error:'), error.message);
  if (verbose) {
    console.error(chalk.red('Stack trace:'), error.stack);
  }
  process.exit(1);
}
```

### Profile Management
Profiles are YAML files in `profiles/<name>.yaml` with this structure:
```yaml
name: "<profile-name>"
description: "Environment description"  
extends: "base"  # Profile inheritance
settings:
  environment: "<profile-name>"
  strict_mode: true/false
```

## Integration Points

### Template System
The `templates/` directory is structured for IDE-specific generation:
```
templates/
├── secure-config-example.yaml  # Security configuration reference
└── ide/
    ├── .vscode/               # VS Code templates
    ├── .idea/                 # JetBrains templates  
    └── .vim/                  # Vim templates
```

## CI/CD Pipeline

### Pre-commit Hooks (Husky)
- Lint, typecheck, and coverage validation
- **TDD Policy**: Changes to `src/` require corresponding test changes
- Blocks commits that fail coverage thresholds

### GitHub Actions
- Runs on PR and main branch pushes
- Enforces 90%+ coverage thresholds via JSON parsing
- Uses npm for dependency management
- Uploads coverage to Codecov

## Key Files for Understanding
- `src/cli/main.ts`: CLI entry point and command registration
- `src/core/config.ts`: Configuration loading and schema definitions
- `src/cli/commands/init.ts`: Primary scaffolding logic with IDE integrations
- `templates/secure-config-example.yaml`: Security configuration reference
- `vitest.config.ts`: Test configuration with coverage thresholds
- `tests/unit/`: Pure logic tests (100% coverage required)
- `tests/integration/`: CLI e2e and adapter tests

## Debugging Commands
```bash
# Verbose output for troubleshooting
custom-rules init --verbose --dry-run --ide all

# Configuration status check  
custom-rules info

# Profile inspection
custom-rules profile show <name>

# Coverage analysis
npm run coverage -- --reporter=html  # Open coverage/index.html
```
