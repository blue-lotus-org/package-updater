"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveCommand = void 0;
const chalk_1 = __importDefault(require("chalk"));
const packageJson_1 = require("../utils/packageJson");
const npm_1 = require("../utils/npm");
const output_1 = require("../utils/output");
class RemoveCommand {
    static async execute(packageName, options) {
        try {
            if (!packageName) {
                output_1.OutputFormatter.formatError('Package name is required');
                process.exit(1);
            }
            // Check if package exists in any dependency type
            const packageData = packageJson_1.PackageJsonManager.readPackageJson();
            let foundInTypes = [];
            if (packageData.dependencies && packageData.dependencies[packageName]) {
                foundInTypes.push('dependencies');
            }
            if (packageData.devDependencies && packageData.devDependencies[packageName]) {
                foundInTypes.push('devDependencies');
            }
            if (packageData.peerDependencies && packageData.peerDependencies[packageName]) {
                foundInTypes.push('peerDependencies');
            }
            if (foundInTypes.length === 0) {
                output_1.OutputFormatter.formatError(`Package "${packageName}" not found in any dependency type`);
                process.exit(1);
            }
            // Show found locations and ask for confirmation
            if (foundInTypes.length > 1) {
                console.log(chalk_1.default.yellow(`Found ${packageName} in multiple dependency types:`));
                for (const type of foundInTypes) {
                    const version = packageData[type][packageName];
                    console.log(`  ${chalk_1.default.cyan(type)}: ${version}`);
                }
            }
            const dependencyType = (foundInTypes.length === 1 ? foundInTypes[0] : 'dependencies');
            const version = packageData[dependencyType]?.[packageName] || 'unknown';
            if (!options.force) {
                const answer = await this.promptUser(`Remove ${chalk_1.default.cyan(packageName)} (${version}) from ${chalk_1.default.cyan(dependencyType)}? (y/N): `);
                if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                    output_1.OutputFormatter.formatInfo('Remove cancelled');
                    return;
                }
            }
            // Remove from package.json
            packageJson_1.PackageJsonManager.removeDependency(packageName, dependencyType);
            output_1.OutputFormatter.formatRemoveMessage(packageName);
            // Run npm uninstall if not skipped
            if (!options.skipInstall) {
                try {
                    await npm_1.NpmManager.uninstallPackage(packageName);
                    output_1.OutputFormatter.formatSuccess(`${packageName} removed from ${dependencyType}`);
                }
                catch (error) {
                    output_1.OutputFormatter.formatError(`Failed to uninstall ${packageName}: ${error.message}`);
                    process.exit(1);
                }
            }
            else {
                console.log(chalk_1.default.yellow('⚠️ Skipping npm uninstall - run "npm uninstall ' + packageName + '" manually'));
            }
        }
        catch (error) {
            output_1.OutputFormatter.formatError(`Remove command failed: ${error.message}`);
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
exports.RemoveCommand = RemoveCommand;
//# sourceMappingURL=remove.js.map