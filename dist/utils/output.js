"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputFormatter = void 0;
const chalk_1 = __importDefault(require("chalk"));
const table_1 = require("table");
const semver_1 = require("./semver");
class OutputFormatter {
    static formatStatusOutput(dependencies, auditResult) {
        if (dependencies.length === 0) {
            console.log(chalk_1.default.yellow('No dependencies found in package.json'));
            return;
        }
        // Create table data
        const tableData = [
            [
                chalk_1.default.bold('Package'),
                chalk_1.default.bold('Current'),
                chalk_1.default.bold('Latest'),
                chalk_1.default.bold('Type'),
                chalk_1.default.bold('Status'),
                chalk_1.default.bold('Security')
            ]
        ];
        for (const dep of dependencies) {
            const currentVersion = dep.currentVersion || chalk_1.default.gray('not installed');
            const latestVersion = dep.latestVersion;
            // Format status
            let statusText = '';
            let statusColor = chalk_1.default.gray;
            if (dep.isOutdated) {
                const updateType = semver_1.SemverManager.getUpdateType(dep.semver, dep.latestVersion);
                switch (updateType) {
                    case 'major':
                        statusText = 'Major update available';
                        statusColor = chalk_1.default.red;
                        break;
                    case 'minor':
                        statusText = 'Minor update available';
                        statusColor = chalk_1.default.yellow;
                        break;
                    case 'patch':
                        statusText = 'Patch update available';
                        statusColor = chalk_1.default.green;
                        break;
                    default:
                        statusText = 'Update available';
                        statusColor = chalk_1.default.cyan;
                }
            }
            else {
                statusText = 'Up to date';
                statusColor = chalk_1.default.green;
            }
            // Format security status
            let securityText = '';
            let securityColor = chalk_1.default.green;
            if (dep.hasVulnerability) {
                securityText = `${dep.vulnerabilityCount || ''} ${dep.vulnerabilityLevel || ''}`.trim();
                switch (dep.vulnerabilityLevel) {
                    case 'critical':
                        securityColor = chalk_1.default.red.bold;
                        break;
                    case 'high':
                        securityColor = chalk_1.default.red;
                        break;
                    case 'moderate':
                        securityColor = chalk_1.default.yellow;
                        break;
                    case 'low':
                        securityColor = chalk_1.default.blue;
                        break;
                }
            }
            else {
                securityText = '✓ Secure';
            }
            tableData.push([
                dep.name,
                currentVersion,
                latestVersion,
                dep.type,
                statusColor(statusText),
                securityColor(securityText)
            ]);
        }
        console.log('\n' + (0, table_1.table)(tableData, {
            border: {
                topBody: '─',
                topJoin: '┬',
                topLeft: '┌',
                topRight: '┐',
                bottomBody: '─',
                bottomJoin: '┴',
                bottomLeft: '└',
                bottomRight: '┘',
                bodyLeft: '│',
                bodyRight: '│',
                bodyJoin: '│',
                joinBody: '─',
                joinLeft: '├',
                joinRight: '┤',
                joinJoin: '┼'
            }
        }));
        // Print audit summary
        if (auditResult.vulnerabilities > 0) {
            console.log('\n' + chalk_1.default.red.bold(`🔒 Security Audit: ${auditResult.vulnerabilities} vulnerabilities found`));
            if (auditResult.high > 0) {
                console.log(`   ${chalk_1.default.red.bold('High/Critical:')} ${auditResult.high}`);
            }
            if (auditResult.moderate > 0) {
                console.log(`   ${chalk_1.default.yellow('Moderate:')} ${auditResult.moderate}`);
            }
            if (auditResult.low > 0) {
                console.log(`   ${chalk_1.default.blue('Low:')} ${auditResult.low}`);
            }
            console.log(chalk_1.default.gray('Run ') + chalk_1.default.cyan('npm audit fix') + chalk_1.default.gray(' to fix some vulnerabilities automatically.'));
        }
        else {
            console.log('\n' + chalk_1.default.green.bold('🔒 Security Audit: No vulnerabilities found'));
        }
        // Print summary
        const outdatedCount = dependencies.filter(d => d.isOutdated).length;
        const vulnCount = dependencies.filter(d => d.hasVulnerability).length;
        console.log(`\n${chalk_1.default.gray('Summary:')} ${dependencies.length} total packages`);
        if (outdatedCount > 0) {
            console.log(`${chalk_1.default.gray('  Outdated:')} ${outdatedCount}`);
        }
        if (vulnCount > 0) {
            console.log(`${chalk_1.default.gray('  With vulnerabilities:')} ${vulnCount}`);
        }
    }
    static formatVulnerabilityDetails(vulnerabilities) {
        if (vulnerabilities.length === 0) {
            console.log(chalk_1.default.green('No vulnerabilities found!'));
            return;
        }
        console.log(chalk_1.default.red.bold(`\n🔒 Found ${vulnerabilities.length} vulnerabilities:\n`));
        for (const vuln of vulnerabilities) {
            let color = chalk_1.default.white;
            switch (vuln.severity) {
                case 'critical':
                    color = chalk_1.default.red.bold;
                    break;
                case 'high':
                    color = chalk_1.default.red;
                    break;
                case 'moderate':
                    color = chalk_1.default.yellow;
                    break;
                case 'low':
                    color = chalk_1.default.blue;
                    break;
            }
            console.log(`${color(vuln.severity.toUpperCase())} ${chalk_1.default.bold(vuln.id)}`);
            console.log(`   ${vuln.title}`);
            if (vuln.url) {
                console.log(`   ${chalk_1.default.gray(vuln.url)}`);
            }
            console.log('');
        }
    }
    static formatUpdateSummary(updates, failed) {
        if (updates.length > 0) {
            console.log(chalk_1.default.green.bold('\n✅ Successfully updated packages:'));
            for (const update of updates) {
                console.log(`  ${chalk_1.default.cyan(update.name)}: ${chalk_1.default.gray(update.oldVersion)} → ${update.newVersion}`);
            }
        }
        if (failed.length > 0) {
            console.log(chalk_1.default.red.bold('\n❌ Failed to update packages:'));
            for (const fail of failed) {
                console.log(`  ${chalk_1.default.cyan(fail.name)}: ${fail.error}`);
            }
        }
    }
    static formatInstallMessage(packageName, type) {
        const typeColors = {
            dependencies: chalk_1.default.blue,
            devDependencies: chalk_1.default.green,
            peerDependencies: chalk_1.default.magenta
        };
        const color = typeColors[type] || chalk_1.default.white;
        console.log(`${color('✓')} Added ${chalk_1.default.cyan(packageName)} to ${color(type)}`);
    }
    static formatRemoveMessage(packageName) {
        console.log(`${chalk_1.default.green('✓')} Removed ${chalk_1.default.cyan(packageName)} from dependencies`);
    }
    static formatError(message) {
        console.error(chalk_1.default.red.bold('Error: ') + chalk_1.default.red(message));
    }
    static formatInfo(message) {
        console.log(chalk_1.default.blue.bold('Info: ') + chalk_1.default.blue(message));
    }
    static formatSuccess(message) {
        console.log(chalk_1.default.green.bold('Success: ') + chalk_1.default.green(message));
    }
}
exports.OutputFormatter = OutputFormatter;
//# sourceMappingURL=output.js.map