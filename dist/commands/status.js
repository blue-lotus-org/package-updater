"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusCommand = void 0;
const chalk_1 = __importDefault(require("chalk"));
const packageJson_1 = require("../utils/packageJson");
const npm_1 = require("../utils/npm");
const output_1 = require("../utils/output");
const ora_1 = __importDefault(require("ora"));
class StatusCommand {
    static async execute() {
        try {
            // Check if package.json exists
            let packageData;
            try {
                packageData = packageJson_1.PackageJsonManager.readPackageJson();
            }
            catch (error) {
                output_1.OutputFormatter.formatError(error.message);
                process.exit(1);
            }
            // Get all dependencies
            const dependencies = {
                ...(packageData.dependencies || {}),
                ...(packageData.devDependencies || {}),
                ...(packageData.peerDependencies || {})
            };
            if (Object.keys(dependencies).length === 0) {
                output_1.OutputFormatter.formatInfo('No dependencies found in package.json');
                return;
            }
            // Check if we should run audit
            let auditResult = { vulnerabilities: 0, high: 0, moderate: 0, low: 0, details: [] };
            console.log(chalk_1.default.blue.bold('📦 Analyzing dependencies...'));
            // Create progress spinner
            const spinner = (0, ora_1.default)('Fetching package information...').start();
            try {
                // Get latest versions for all packages
                const dependencyList = Object.keys(dependencies);
                const latestVersions = {};
                const installedVersions = {};
                // Fetch latest versions
                for (const name of dependencyList) {
                    try {
                        latestVersions[name] = await npm_1.NpmManager.getLatestVersion(name);
                    }
                    catch (error) {
                        latestVersions[name] = 'unknown';
                    }
                }
                // Fetch installed versions
                const versions = await npm_1.NpmManager.getMultipleInstalledVersions(dependencyList);
                for (const name of dependencyList) {
                    installedVersions[name] = versions[name] || null;
                }
                // Run audit
                try {
                    const auditData = await npm_1.NpmManager.runAudit();
                    auditResult = { ...auditResult, ...auditData };
                }
                catch (error) {
                    // Audit might fail if no vulnerabilities or network issues
                    console.log(chalk_1.default.yellow('⚠️ Could not fetch audit information'));
                }
                spinner.succeed('Package information fetched');
                // Build dependency info
                const dependencyInfos = [];
                for (const [name, semver] of Object.entries(dependencies)) {
                    const currentVersion = installedVersions[name];
                    const latestVersion = latestVersions[name] || 'unknown';
                    const isOutdated = Boolean(currentVersion && latestVersion !== 'unknown' && currentVersion !== latestVersion);
                    // Determine dependency type
                    let type = 'dependency';
                    if (packageData.peerDependencies && packageData.peerDependencies[name]) {
                        type = 'peerDependency';
                    }
                    else if (packageData.devDependencies && packageData.devDependencies[name]) {
                        type = 'devDependency';
                    }
                    // Check for vulnerabilities
                    const hasVulnerability = auditResult.details.some((vuln) => vuln.id?.includes(name) ||
                        // This is a simplified check - in a real implementation, you'd want to map vulnerabilities to specific packages
                        false);
                    dependencyInfos.push({
                        name,
                        currentVersion: currentVersion || 'not installed',
                        latestVersion,
                        semver,
                        type,
                        isOutdated,
                        hasVulnerability,
                        vulnerabilityLevel: hasVulnerability ? 'moderate' : undefined,
                        vulnerabilityCount: hasVulnerability ? 1 : 0
                    });
                }
                // Sort by dependency type, then by name
                dependencyInfos.sort((a, b) => {
                    const typeOrder = { dependency: 0, devDependency: 1, peerDependency: 2 };
                    const typeDiff = typeOrder[a.type] - typeOrder[b.type];
                    if (typeDiff !== 0)
                        return typeDiff;
                    return a.name.localeCompare(b.name);
                });
                output_1.OutputFormatter.formatStatusOutput(dependencyInfos, auditResult);
            }
            catch (error) {
                spinner.fail('Failed to fetch package information');
                throw error;
            }
        }
        catch (error) {
            output_1.OutputFormatter.formatError(`Status command failed: ${error.message}`);
            process.exit(1);
        }
    }
}
exports.StatusCommand = StatusCommand;
//# sourceMappingURL=status.js.map