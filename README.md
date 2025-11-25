# vibe-deps

A powerful and user-friendly CLI tool for managing Node.js project dependencies. Vibe-deps helps developers efficiently track, update, and manage their `package.json` dependencies with enhanced security awareness and intuitive output.

## Features

- **📊 Status Monitoring**: View all dependencies with current and latest versions, plus security vulnerability status
- **🔄 Smart Updates**: Update individual packages or all dependencies with semver compatibility checking
- **➕ Easy Package Management**: Add packages to dependencies, devDependencies, or peerDependencies with automatic installation
- **➖ Safe Removal**: Remove packages with confirmation prompts and automatic cleanup
- **🔒 Security Integration**: Built-in npm audit integration to highlight security vulnerabilities
- **🎨 Beautiful Output**: Colorful, formatted tables and helpful progress indicators
- **⚡ Fast & Reliable**: Efficient package version checking with robust error handling

## Installation

### From Source

```bash
# Clone and build
git clone <repository-url>
cd vibe-deps
npm install
npm run build

# Install globally
npm install -g .
```

### Prerequisites

- Node.js >= 14.0.0
- npm (any recent version)

## Quick Start

```bash
# Check dependency status
vibe-deps status

# Update all dependencies
vibe-deps update

# Update a specific package
vibe-deps update lodash

# Add a new dependency
vibe-deps add react

# Add to devDependencies
vibe-deps add --dev jest

# Add a specific version
vibe-deps add typescript@^5.0.0

# Remove a package
vibe-deps remove lodash
```

## Commands

### `vibe-deps status`

Show comprehensive dependency information including:
- Current installed versions
- Latest available versions from npm
- Dependency types (dependencies, devDependencies, peerDependencies)
- Update availability indicators
- Security vulnerability summary from npm audit

**Options:**
- `--json, -j`: Output results in JSON format

**Example Output:**
```
📦 Analyzing dependencies...
┌─────────────┬─────────┬─────────┬─────────────────┬──────────────┬─────────────┐
│ Package     │ Current │ Latest  │ Type            │ Status       │ Security    │
├─────────────┼─────────┼─────────┼─────────────────┼──────────────┼─────────────┤
│ lodash      │ 4.17.21 │ 4.17.24 │ dependencies    │ Up to date   │ ✓ Secure    │
│ typescript  │ 5.0.0   │ 5.2.0   │ devDependencies │ Minor updat… │ ✓ Secure    │
│ react       │ 17.0.0  │ 18.2.0  │ dependencies    │ Major updat… │ ✓ Secure    │
└─────────────┴─────────┴─────────┴─────────────────┴──────────────┴─────────────┘

🔒 Security Audit: 0 vulnerabilities found

Summary: 15 total packages
  Outdated: 3
```

### `vibe-deps update`

Update dependencies to their latest compatible versions.

**Arguments:**
- `[package-name]`: Specific package to update (updates all if not provided)

**Options:**
- `--force, -f`: Force update even for breaking changes (major version updates)
- `--skip-install`: Skip running npm install after updating package.json

**Examples:**
```bash
# Update all dependencies
vibe-deps update

# Update specific package
vibe-deps update lodash

# Force update with breaking changes
vibe-deps update react --force

# Update without running npm install
vibe-deps update typescript --skip-install
```

**Behavior:**
- Respects semver ranges in package.json (^, ~, exact versions)
- Shows preview of updates before applying
- Prompts for confirmation on major version updates
- Automatically runs npm install after successful updates
- Creates backup of package.json before changes

### `vibe-deps add`

Add new packages to your project.

**Arguments:**
- `<package-name>`: Package name with optional version (e.g., `lodash@4.17.21` or `@scope/package@latest`)

**Options:**
- `--dev, -d`: Add to devDependencies instead of dependencies
- `--peer, -p`: Add to peerDependencies
- `--version, -v <version>`: Specify exact version to install
- `--skip-install`: Skip running npm install after updating package.json

**Examples:**
```bash
# Add regular dependency
vibe-deps add lodash

# Add specific version
vibe-deps add react@18.2.0

# Add to devDependencies
vibe-deps add --dev jest

# Add scoped package
vibe-deps add @types/node

# Add to peerDependencies
vibe-deps add --peer react-dom

# Add without installing
vibe-deps add axios --skip-install
```

**Features:**
- Automatically fetches latest version info
- Handles scoped packages correctly
- Prevents duplicate additions (asks for confirmation to update)
- Creates package.json backup before modifications
- Runs npm install automatically (unless --skip-install is used)

### `vibe-deps remove`

Remove packages from your project.

**Arguments:**
- `<package-name>`: Package name to remove

**Options:**
- `--force, -f`: Remove without confirmation prompt
- `--skip-install`: Skip running npm uninstall after updating package.json

**Examples:**
```bash
# Remove package with confirmation
vibe-deps remove lodash

# Remove without confirmation
vibe-deps remove lodash --force

# Remove without running npm uninstall
vibe-deps remove axios --skip-install
```

**Behavior:**
- Searches all dependency types (dependencies, devDependencies, peerDependencies)
- Shows found location(s) if package exists in multiple types
- Prompts for confirmation (unless --force is used)
- Automatically runs npm uninstall after successful removal
- Removes from correct dependency type based on package.json

## Configuration

Vibe-deps automatically detects and works with your existing package.json configuration:

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "lodash": "^4.17.21",
    "axios": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "jest": "^29.0.0"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
```

## Security Features

Vibe-deps integrates with npm audit to highlight security vulnerabilities:

- **Vulnerability Detection**: Automatically runs npm audit during status checks
- **Severity Levels**: Color-coded severity indicators (critical, high, moderate, low)
- **Summary View**: Quick overview of total vulnerabilities by severity
- **Detailed Information**: Full vulnerability details with severity levels and URLs

## Error Handling

Robust error handling with clear, actionable messages:

- **Missing package.json**: Clear error when package.json is not found
- **Invalid JSON**: Helpful parsing error messages
- **Network Issues**: Graceful handling of npm registry connectivity problems
- **Permission Errors**: Clear messages for file system permission issues
- **Package Not Found**: Helpful feedback when packages don't exist
- **Version Conflicts**: Detailed semver compatibility error messages

## Safety Features

- **Automatic Backups**: Creates package.json.backup before any modifications
- **Confirmation Prompts**: Asks for confirmation before major changes
- **Dry Run Options**: --skip-install allows reviewing changes before applying
- **Rollback Capability**: Backup files available for manual recovery if needed
- **Atomic Operations**: Ensures consistent state even if operations are interrupted

## Troubleshooting

### Common Issues

**Q: "package.json not found"**
A: Run vibe-deps from your project root directory where package.json is located.

**Q: "npm audit failed"**
A: Check your internet connection and npm configuration. Some networks may block audit requests.

**Q: "Permission denied"**
A: Ensure you have write permissions to package.json and can run npm commands.

**Q: "Package not found"**
A: Verify the package name is correct and exists on npm registry.

### Debug Mode

For debugging, you can see detailed error information:
```bash
# The CLI automatically shows helpful error messages
# No special debug flags needed
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Changelog

### v1.0.0
- Initial release
- Status monitoring with security audit integration
- Smart dependency updates with semver compatibility
- Easy package addition and removal
- Beautiful formatted output with color coding
- Robust error handling and safety features