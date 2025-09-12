
# Security and Exclusion Features

## Overview

The Custom Rules CLI includes comprehensive security and exclusion features to protect against dangerous commands and filter out unwanted files during processing. These features provide defense in depth against security threats while maintaining development workflow efficiency.

## Security Configuration

### Never Execute Commands

These are commands that should **NEVER** be executed under any circumstances. The system will block these with a `critical` risk level:

```yaml
security:
  neverExecute:
    - "rm -rf /"                    # Delete root filesystem (Unix/Linux)
    - "del /f /s /q C:\\*"         # Delete C: drive contents (Windows)
    - "format c:"                   # Format C: drive
    - "mkfs.*"                     # Format filesystem commands
    - "sudo rm -rf"                # Privileged deletion
    - ":(){ :|:& };:"              # Fork bomb
    - "chmod -R 777 /"             # Dangerous permissions
    - "dd if=/dev/zero"            # Overwrite disk
    - "shutdown"                   # System shutdown
    - "reboot"                     # System restart
    - "halt"                       # System halt
```

### Blocked Commands

Commands that are generally unsafe but might have legitimate use cases. These are blocked with a `high` risk level:

```yaml
security:
  blockedCommands:
    - "curl *://*/malware*"        # Suspicious downloads
    - "wget *://*/malware*"        # Suspicious downloads
    - "powershell -enc*"           # Encoded PowerShell
    - "bash -c \"$(curl*"          # Remote code execution
    - "eval*"                      # Code evaluation
    - "exec*"                      # Code execution
    - "sudo *"                     # Privileged operations
    - "su *"                       # User switching
    - "chmod 777*"                 # Dangerous permissions
    - "chown root*"                # Root ownership changes
```

### Unsafe Patterns

Regular expressions that detect potentially dangerous operations. These are flagged with a `medium` risk level:

```yaml
security:
  unsafePatterns:
    - "\\$\\([^)]*\\)"             # Command substitution: $(command)
    - "`[^`]*`"                    # Backtick command substitution
    - "\\$\\{[^}]*\\}"             # Parameter expansion: ${var}
    - ">[>&].*"                    # Output redirection
    - "\\|\\s*sh"                  # Piping to shell
    - "\\|\\s*bash"                # Piping to bash
    - "\\|\\s*zsh"                 # Piping to zsh
    - "2>&1"                       # Error redirection
    - "\\&\\&"                     # Command chaining with AND
    - "\\|\\|"                     # Command chaining with OR
```

## Exclusion Configuration

### File Exclusions

Specific files to exclude from processing to protect sensitive data:

```yaml
exclusions:
  files:
    - ".env"                       # Environment variables
    - ".env.local"                 # Local environment
    - ".env.production"            # Production environment
    - ".env.staging"               # Staging environment
    - "*.key"                      # Private keys
    - "*.pem"                      # PEM certificates
    - "*.p12"                      # PKCS#12 certificates
    - "*.pfx"                      # PFX certificates
    - "id_rsa"                     # SSH private key
    - "id_dsa"                     # DSA private key
    - "id_ecdsa"                   # ECDSA private key
    - "id_ed25519"                 # Ed25519 private key
    - "known_hosts"                # SSH known hosts
    - "authorized_keys"            # SSH authorized keys
    - "*.crt"                      # Certificate files
    - "*.csr"                      # Certificate requests
    - "config.json"                # Configuration files
    - "secrets.yaml"               # Secrets files
    - "credentials.json"           # Credential files
```

### Directory Exclusions

Directories to always skip during processing:

```yaml
exclusions:
  directories:
    - "node_modules"               # Node.js dependencies
    - ".git"                       # Git repository data
    - "dist"                       # Distribution/build output
    - "build"                      # Build output
    - "coverage"                   # Test coverage reports
    - ".nyc_output"                # NYC coverage output
    - "tmp"                        # Temporary files
    - "temp"                       # Temporary files
    - ".cache"                     # Cache directories
    - "vendor"                     # Vendor dependencies
    - "target"                     # Build targets
    - "bin"                        # Binary files
    - "obj"                        # Object files
    - ".pytest_cache"              # Pytest cache
    - "__pycache__"                # Python cache
    - ".tox"                       # Tox environments
    - ".venv"                      # Virtual environments
    - "venv"                       # Virtual environments
    - ".idea"                      # JetBrains IDE files
    - ".vscode"                    # VS Code settings
```

### Pattern Exclusions

Glob patterns for flexible exclusion rules:

```yaml
exclusions:
  patterns:
    - "**/node_modules/**"         # Node modules anywhere
    - "**/.git/**"                 # Git directories anywhere
    - "**/dist/**"                 # Distribution directories
    - "**/build/**"                # Build directories
    - "**/*.log"                   # Log files anywhere
    - "**/*.tmp"                   # Temporary files
    - "**/coverage/**"             # Coverage reports
    - "**/.DS_Store"               # macOS system files
    - "**/Thumbs.db"               # Windows thumbnails
    - "**/*.swp"                   # Vim swap files
    - "**/*.swo"                   # Vim swap files
    - "**/*~"                      # Backup files
    - "**/*.bak"                   # Backup files
    - "**/*.backup"                # Backup files
    - "**/core.*"                  # Core dump files
    - "**/*.dump"                  # Dump files
```

### Extension Exclusions

File extensions to exclude for security and performance:

```yaml
exclusions:
  extensions:
    - ".exe"                       # Windows executables
    - ".bat"                       # Batch files
    - ".cmd"                       # Command files
    - ".com"                       # COM files
    - ".scr"                       # Screen savers
    - ".pif"                       # Program information files
    - ".msi"                       # Windows installers
    - ".dll"                       # Dynamic libraries
    - ".so"                        # Shared objects (Linux)
    - ".dylib"                     # Dynamic libraries (macOS)
    - ".dmp"                       # Dump files
    - ".core"                      # Core dump files
    - ".app"                       # Application bundles
```

## VS Code Integration

Security and exclusion features integrate seamlessly with VS Code:

```json
{
  "customRules.security": {
    "enforceBlacklist": true,
    "validateCommands": true,
    "preventDangerousOperations": true,
    "neverExecute": [
      "rm -rf /",
      "del /f /s /q C:\\*",
      "format",
      "shutdown",
      "reboot"
    ]
  },
  "customRules.exclusions": {
    "respectGitignore": true,
    "skipHiddenFiles": true,
    "ignorePatterns": [
      "**/node_modules/**",
      "**/.git/**",
      "**/dist/**",
      "**/*.log",
      "**/.env*"
    ]
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true,
    "**/coverage": true,
    "**/*.log": true,
    "**/.env*": true,
    "**/tmp": true,
    "**/temp": true
  }
}
```

## Usage Examples

### Command Line Interface

```bash
# Initialize project with security features
custom-rules init --profile secure

# Validate configuration including security rules
custom-rules validate

# Run rules with exclusion patterns
custom-rules run --exclude "**/*.log,**/tmp/**"

# Check security summary
custom-rules info --security
```

### Programmatic Usage

```typescript
import { SecurityValidator } from './utils/security';
import { ConfigManager } from './core/config';

// Initialize with security configuration
const config = new ConfigManager({ profile: 'secure' });
const validator = new SecurityValidator(config.getConfig());

// Validate commands before execution
const result = validator.validateCommand('rm -rf /');
if (!result.isAllowed) {
  console.error(`Blocked: ${result.reason}`);
  console.log(`Risk Level: ${result.riskLevel}`);
  if (result.suggestion) {
    console.log(`Suggestion: ${result.suggestion}`);
  }
}

// Check file exclusions
const files = ['src/index.ts', '.env', 'node_modules/pkg/index.js'];
files.forEach(file => {
  if (validator.shouldExcludeFile(file)) {
    console.log(`Excluding: ${file}`);
  } else {
    console.log(`Processing: ${file}`);
  }
});

// Get security summary
const summary = validator.getSecuritySummary();
console.log('Security Rules:');
console.log('- Never Execute:', summary.neverExecute.length);
console.log('- Blocked Commands:', summary.blockedCommands.length);
console.log('- Unsafe Patterns:', summary.unsafePatterns.length);

// Get exclusion summary
const exclusions = validator.getExclusionSummary();
console.log('Exclusion Rules:');
console.log('- Files:', exclusions.files.length);
console.log('- Directories:', exclusions.directories.length);
console.log('- Patterns:', exclusions.patterns.length);
console.log('- Extensions:', exclusions.extensions.length);
```

## Security Risk Levels

Commands and operations are categorized by risk level:

| Risk Level | Description | Action |
|------------|-------------|---------|
| **Critical** | Never execute under any circumstances | Block immediately, no override |
| **High** | Dangerous but might have legitimate uses | Block with warning, require explicit approval |
| **Medium** | Contains potentially unsafe patterns | Warn user, allow with confirmation |
| **Low** | Safe to execute | Allow without restriction |

## Configuration Files

### Main Configuration

Create `custom-rules.yaml` with security settings:

```yaml
# Security and exclusion configuration
security:
  neverExecute:
    - "rm -rf /"
    - "shutdown"
  blockedCommands:
    - "sudo *"
  unsafePatterns:
    - "\\$\\([^)]*\\)"

exclusions:
  files:
    - ".env"
    - "*.key"
  directories:
    - "node_modules"
    - ".git"
  patterns:
    - "**/coverage/**"
  extensions:
    - ".exe"
```

### Profile-Specific Configuration

Create `profiles/secure.yaml` for enhanced security:

```yaml
name: "secure-development"
security:
  neverExecute:
    - "rm -rf /"
    - "del /f /s /q C:\\*"
    - "format c:"
    - "shutdown"
    - "reboot"
    - "halt"
  # ... additional security rules

exclusions:
  files:
    - ".env*"
    - "*.key"
    - "*.pem"
  # ... additional exclusions
```

## Best Practices

### Security Best Practices

1. **Never disable security features** in production environments
2. **Regularly review and update** blocked command lists
3. **Test security rules** in development before deploying
4. **Use layered security** - combine multiple protection methods
5. **Monitor security events** and review logs regularly
6. **Keep security lists current** with new threats

### Exclusion Best Practices

1. **Use patterns wisely** - overly broad patterns can exclude legitimate files
2. **Test exclusions** to ensure they don't interfere with normal operations
3. **Balance security and functionality** - don't over-exclude
4. **Document custom exclusions** for team understanding
5. **Respect .gitignore** patterns when possible
6. **Review exclusions regularly** and remove outdated rules

## Configuration Priority

Settings are applied in this priority order (highest to lowest):

1. **Explicit command-line arguments**
2. **Project-specific configuration files**
3. **Profile-specific settings**
4. **VS Code workspace settings**
5. **Global user settings**
6. **Default security rules**

**Important**: Security restrictions are always cumulative - more restrictive settings take precedence, and security rules cannot be downgraded by lower-priority configurations.

## Troubleshooting

### Common Issues

**Q: My command is being blocked unexpectedly**
- Check if it matches any patterns in `neverExecute` or `blockedCommands`
- Review `unsafePatterns` for regex matches
- Use `custom-rules validate --verbose` to see detailed matching

**Q: Important files are being excluded**
- Review exclusion patterns and adjust as needed
- Use more specific patterns instead of broad wildcards
- Check VS Code `files.exclude` settings

**Q: Security validation is too strict**
- Create a custom profile with relaxed rules
- Use environment-specific configurations
- Consider using approval workflows for blocked commands

### Debugging Commands

```bash
# Check current security configuration
custom-rules info --security

# Validate specific command
custom-rules validate-command "your-command-here"

# Test file exclusions
custom-rules test-exclusions /path/to/check

# Show all active rules
custom-rules config --show-all
```

## Support and Updates

For the latest security patterns and exclusion rules:

- Check project documentation regularly
- Subscribe to security updates
- Contribute new patterns via pull requests
- Report false positives as issues

---

*This documentation covers the comprehensive security and exclusion features available in Custom Rules CLI. Always prioritize security while maintaining development productivity.*
