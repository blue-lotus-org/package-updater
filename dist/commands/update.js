"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCommand = void 0;
const chalk_1 = __importDefault(require("chalk"));
const packageJson_1 = require("../utils/packageJson");
const npm_1 = require("../utils/npm");
const semver_1 = require("../utils/semver");
const output_1 = require("../utils/output");
const ora_1 = __importDefault(require("ora"));
class UpdateCommand {
    static async execute(packageName, force = false) {
        try {
            const packageData = packageJson_1.PackageJsonManager.readPackageJson();
            const allDeps = packageJson_1.PackageJsonManager.getAllDependencies();
            if (Object.keys(allDeps).length === 0) {
                output_1.OutputFormatter.formatInfo('No dependencies found to update');
                return;
            }
            const depsToUpdate = packageName ? { [packageName]: allDeps[packageName] } : allDeps;
            if (packageName && !allDeps[packageName]) {
                output_1.OutputFormatter.formatError(`Package "${packageName}" not found in dependencies`);
                process.exit(1);
            }
            const updates = [];
            const failed = [];
            console.log(chalk_1.default.blue.bold('🔄 Checking for updates...'));
            // Check each package for updates
            for (const [name, semver] of Object.entries(depsToUpdate)) {
                try {
                    const latestVersion = await npm_1.NpmManager.getLatestVersion(name);
                    const installedVersion = await npm_1.NpmManager.getInstalledVersion(name);
                    const updateType = semver_1.SemverManager.getUpdateType(semver, latestVersion);
                    if (updateType !== 'same') {
                        // Check if it's a breaking change
                        if ((updateType === 'major' || updateType === 'incompatible') && !force) {
                            console.log(chalk_1.default.yellow(`⚠️  ${name}: Major version change detected (${semver} → ${latestVersion})`));
                            console.log(chalk_1.default.gray('  Use --force to update anyway'));
                            continue;
                        }
                        updates.push({
                            name,
                            oldVersion: semver,
                            newVersion: latestVersion,
                            type: updateType
                        });
                    }
                }
                catch (error) {
                    failed.push({
                        name,
                        error: `Failed to check version: ${error.message}`
                    });
                }
            }
            if (updates.length === 0) {
                if (failed.length === 0) {
                    output_1.OutputFormatter.formatInfo('All dependencies are already up to date');
                }
                else {
                    output_1.OutputFormatter.formatError('No valid updates found, but some packages had errors');
                }
                return;
            }
            // Show what will be updated
            console.log(chalk_1.default.green.bold(`\nFound ${updates.length} package(s) to update:`));
            for (const update of updates) {
                let icon = '📦';
                switch (update.type) {
                    case 'major':
                        icon = '⚠️';
                        break;
                    case 'minor':
                        icon = '🔧';
                        break;
                    case 'patch':
                        icon = '🔨';
                        break;
                }
                console.log(`  ${icon} ${chalk_1.default.cyan(update.name)}: ${chalk_1.default.gray(update.oldVersion)} → ${chalk_1.default.green(update.newVersion)}`);
            }
            if (failed.length > 0) {
                console.log(chalk_1.default.yellow.bold(`\n⚠️ ${failed.length} package(s) could not be checked:`));
                for (const fail of failed) {
                    console.log(`  ${chalk_1.default.red(fail.name)}: ${fail.error}`);
                }
            }
            // Ask for confirmation for major updates
            const hasMajorUpdates = updates.some(update => update.type === 'major' || update.type === 'incompatible');
            if (hasMajorUpdates && !force) {
                console.log(chalk_1.default.yellow.bold('\n⚠️ Major updates may contain breaking changes!'));
                const answer = await this.promptUser('Continue with major updates? (y/N): ');
                if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                    output_1.OutputFormatter.formatInfo('Update cancelled');
                    return;
                }
            }
            // Perform updates
            const updateSpinner = (0, ora_1.default)('Updating dependencies...').start();
            let updated = 0;
            let skipped = 0;
            for (const update of updates) {
                try {
                    packageJson_1.PackageJsonManager.updateDependency(update.name, `^${update.newVersion}`);
                    updated++;
                }
                catch (error) {
                    failed.push({
                        name: update.name,
                        error: `Failed to update package.json: ${error.message}`
                    });
                    skipped++;
                }
            }
            updateSpinner.succeed(`Updated ${updated} package(s) in package.json`);
            // Run npm install
            try {
                console.log(chalk_1.default.blue('Running npm install...'));
                await npm_1.NpmManager.install();
            }
            catch (error) {
                output_1.OutputFormatter.formatError(`npm install failed: ${error.message}`);
            }
            // Show results
            output_1.OutputFormatter.formatUpdateSummary(updates.filter(u => !failed.some(f => f.name === u.name)), failed);
        }
        catch (error) {
            output_1.OutputFormatter.formatError(`Update command failed: ${error.message}`);
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
exports.UpdateCommand = UpdateCommand;
//# sourceMappingURL=update.js.map