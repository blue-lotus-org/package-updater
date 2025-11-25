"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCommand = void 0;
const chalk_1 = __importDefault(require("chalk"));
const packageJson_1 = require("../utils/packageJson");
const npm_1 = require("../utils/npm");
const output_1 = require("../utils/output");
class AddCommand {
    static async execute(packageName, options) {
        try {
            if (!packageName) {
                output_1.OutputFormatter.formatError('Package name is required');
                process.exit(1);
            }
            // Determine dependency type
            let dependencyType = 'dependencies';
            if (options.peer) {
                dependencyType = 'peerDependencies';
            }
            else if (options.dev) {
                dependencyType = 'devDependencies';
            }
            // Parse package name and version
            let name = packageName;
            let version = 'latest';
            // Handle scoped packages (@scope/package@version)
            const scopedMatch = packageName.match(/^(@[^/]+\/[^@]+)(?:@(.+))?$/);
            if (scopedMatch) {
                name = scopedMatch[1];
                version = scopedMatch[2] || 'latest';
            }
            else {
                // Handle regular packages (package@version)
                const match = packageName.match(/^([^@]+)(?:@(.+))?$/);
                if (match) {
                    name = match[1];
                    version = match[2] || 'latest';
                }
            }
            // Use specific version if provided
            if (options.version) {
                version = options.version;
            }
            // Check if package already exists
            const packageData = packageJson_1.PackageJsonManager.readPackageJson();
            const existingVersion = packageData[dependencyType]?.[name];
            if (existingVersion && !options.skipInstall) {
                const answer = await this.promptUser(`Package ${name} already exists in ${dependencyType}. Update version? (y/N): `);
                if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                    output_1.OutputFormatter.formatInfo('Add cancelled');
                    return;
                }
            }
            // Get latest version info for display
            console.log(chalk_1.default.blue.bold('📦 Adding package...'));
            let displayVersion = version;
            if (version === 'latest') {
                try {
                    displayVersion = await npm_1.NpmManager.getLatestVersion(name);
                    console.log(chalk_1.default.gray(`Latest version: ${displayVersion}`));
                }
                catch (error) {
                    console.log(chalk_1.default.yellow('⚠️ Could not fetch latest version, using "latest"'));
                }
            }
            // Add to package.json
            const finalVersion = version === 'latest' ? `^${displayVersion}` : version;
            packageJson_1.PackageJsonManager.addDependency(name, finalVersion, dependencyType);
            output_1.OutputFormatter.formatInstallMessage(name, dependencyType);
            // Run npm install if not skipped
            if (!options.skipInstall) {
                try {
                    await npm_1.NpmManager.installPackage(name);
                    output_1.OutputFormatter.formatSuccess(`${name} installed and added to ${dependencyType}`);
                }
                catch (error) {
                    output_1.OutputFormatter.formatError(`Failed to install ${name}: ${error.message}`);
                    process.exit(1);
                }
            }
            else {
                console.log(chalk_1.default.yellow('⚠️ Skipping npm install - run "npm install" manually to install dependencies'));
            }
        }
        catch (error) {
            output_1.OutputFormatter.formatError(`Add command failed: ${error.message}`);
            process.exit(1);
        }
    }
    static async promptUser(question) {
        return new Promise((resolve) => {
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.question(question, (answer) => {
                rl.close();
                resolve(answer.trim());
            });
        });
    }
}
exports.AddCommand = AddCommand;
//# sourceMappingURL=add.js.map