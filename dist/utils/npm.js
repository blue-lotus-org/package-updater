"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NpmManager = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const ora_1 = __importDefault(require("ora"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class NpmManager {
    static async getLatestVersion(packageName) {
        try {
            const { stdout } = await execAsync(`npm view ${packageName} version --json`);
            return JSON.parse(stdout.trim());
        }
        catch (error) {
            throw new Error(`Failed to get latest version for ${packageName}: ${error.message}`);
        }
    }
    static async getInstalledVersion(packageName) {
        try {
            const { stdout } = await execAsync(`npm list ${packageName} --depth=0 --json`);
            const data = JSON.parse(stdout);
            return data.dependencies?.[packageName]?.version || null;
        }
        catch (error) {
            // If package is not installed, npm list returns error code 1
            return null;
        }
    }
    static async getMultipleInstalledVersions(packageNames) {
        try {
            const { stdout } = await execAsync(`npm list ${packageNames.join(' ')} --depth=0 --json`);
            const data = JSON.parse(stdout);
            const versions = {};
            for (const name of packageNames) {
                versions[name] = data.dependencies?.[name]?.version || null;
            }
            return versions;
        }
        catch (error) {
            // If some packages are not installed, handle gracefully
            const versions = {};
            for (const name of packageNames) {
                versions[name] = null;
            }
            return versions;
        }
    }
    static async runAudit() {
        try {
            const { stdout } = await execAsync('npm audit --json');
            const auditData = JSON.parse(stdout);
            let totalVulnerabilities = 0;
            let high = 0;
            let moderate = 0;
            let low = 0;
            const details = [];
            if (auditData.vulnerabilities) {
                for (const [vulnId, vulnData] of Object.entries(auditData.vulnerabilities)) {
                    const vuln = vulnData;
                    const severity = vuln.severity;
                    details.push({
                        id: vulnId,
                        title: vuln.title || 'Unknown vulnerability',
                        severity,
                        url: vuln.url
                    });
                    totalVulnerabilities++;
                    switch (severity) {
                        case 'high':
                        case 'critical':
                            high++;
                            break;
                        case 'moderate':
                            moderate++;
                            break;
                        case 'low':
                            low++;
                            break;
                    }
                }
            }
            return {
                vulnerabilities: totalVulnerabilities,
                high,
                moderate,
                low,
                details
            };
        }
        catch (error) {
            // If no vulnerabilities found, npm returns error but with clean output
            if (error.message.includes('npm audit found 0 vulnerabilities')) {
                return {
                    vulnerabilities: 0,
                    high: 0,
                    moderate: 0,
                    low: 0,
                    details: []
                };
            }
            throw new Error(`Failed to run npm audit: ${error.message}`);
        }
    }
    static async install() {
        return new Promise((resolve, reject) => {
            const spinner = (0, ora_1.default)('Running npm install...').start();
            const child = (0, child_process_1.spawn)('npm', ['install'], {
                stdio: 'inherit',
                shell: true
            });
            child.on('close', (code) => {
                if (code === 0) {
                    spinner.succeed('Dependencies installed successfully');
                    resolve();
                }
                else {
                    spinner.fail('npm install failed');
                    reject(new Error(`npm install exited with code ${code}`));
                }
            });
            child.on('error', (error) => {
                spinner.fail('npm install failed');
                reject(new Error(`npm install failed: ${error.message}`));
            });
        });
    }
    static async installPackage(packageName) {
        return new Promise((resolve, reject) => {
            const spinner = (0, ora_1.default)(`Installing ${packageName}...`).start();
            const child = (0, child_process_1.spawn)('npm', ['install', packageName], {
                stdio: 'inherit',
                shell: true
            });
            child.on('close', (code) => {
                if (code === 0) {
                    spinner.succeed(`${packageName} installed successfully`);
                    resolve();
                }
                else {
                    spinner.fail(`Failed to install ${packageName}`);
                    reject(new Error(`npm install ${packageName} exited with code ${code}`));
                }
            });
            child.on('error', (error) => {
                spinner.fail(`Failed to install ${packageName}`);
                reject(new Error(`npm install ${packageName} failed: ${error.message}`));
            });
        });
    }
    static async uninstallPackage(packageName) {
        return new Promise((resolve, reject) => {
            const spinner = (0, ora_1.default)(`Uninstalling ${packageName}...`).start();
            const child = (0, child_process_1.spawn)('npm', ['uninstall', packageName], {
                stdio: 'inherit',
                shell: true
            });
            child.on('close', (code) => {
                if (code === 0) {
                    spinner.succeed(`${packageName} uninstalled successfully`);
                    resolve();
                }
                else {
                    spinner.fail(`Failed to uninstall ${packageName}`);
                    reject(new Error(`npm uninstall ${packageName} exited with code ${code}`));
                }
            });
            child.on('error', (error) => {
                spinner.fail(`Failed to uninstall ${packageName}`);
                reject(new Error(`npm uninstall ${packageName} failed: ${error.message}`));
            });
        });
    }
}
exports.NpmManager = NpmManager;
//# sourceMappingURL=npm.js.map