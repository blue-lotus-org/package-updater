import chalk from 'chalk';
import { table } from 'table';
import { DependencyInfo, VulnerabilityInfo } from '../types';
import { SemverManager } from './semver';

export class OutputFormatter {
  static formatStatusOutput(dependencies: DependencyInfo[], auditResult: any): void {
    if (dependencies.length === 0) {
      console.log(chalk.yellow('No dependencies found in package.json'));
      return;
    }

    // Create table data
    const tableData: string[][] = [
      [
        chalk.bold('Package'),
        chalk.bold('Current'),
        chalk.bold('Latest'),
        chalk.bold('Type'),
        chalk.bold('Status'),
        chalk.bold('Security')
      ]
    ];

    for (const dep of dependencies) {
      const currentVersion = dep.currentVersion || chalk.gray('not installed');
      const latestVersion = dep.latestVersion;
      
      // Format status
      let statusText = '';
      let statusColor = chalk.gray;
      
      if (dep.isOutdated) {
        const updateType = SemverManager.getUpdateType(dep.semver, dep.latestVersion);
        switch (updateType) {
          case 'major':
            statusText = 'Major update available';
            statusColor = chalk.red;
            break;
          case 'minor':
            statusText = 'Minor update available';
            statusColor = chalk.yellow;
            break;
          case 'patch':
            statusText = 'Patch update available';
            statusColor = chalk.green;
            break;
          default:
            statusText = 'Update available';
            statusColor = chalk.cyan;
        }
      } else {
        statusText = 'Up to date';
        statusColor = chalk.green;
      }

      // Format security status
      let securityText = '';
      let securityColor = chalk.green;
      
      if (dep.hasVulnerability) {
        securityText = `${dep.vulnerabilityCount || ''} ${dep.vulnerabilityLevel || ''}`.trim();
        switch (dep.vulnerabilityLevel) {
          case 'critical':
            securityColor = chalk.red.bold;
            break;
          case 'high':
            securityColor = chalk.red;
            break;
          case 'moderate':
            securityColor = chalk.yellow;
            break;
          case 'low':
            securityColor = chalk.blue;
            break;
        }
      } else {
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

    console.log('\n' + table(tableData, {
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
      console.log('\n' + chalk.red.bold(`🔒 Security Audit: ${auditResult.vulnerabilities} vulnerabilities found`));
      
      if (auditResult.high > 0) {
        console.log(`   ${chalk.red.bold('High/Critical:')} ${auditResult.high}`);
      }
      if (auditResult.moderate > 0) {
        console.log(`   ${chalk.yellow('Moderate:')} ${auditResult.moderate}`);
      }
      if (auditResult.low > 0) {
        console.log(`   ${chalk.blue('Low:')} ${auditResult.low}`);
      }
      
      console.log(chalk.gray('Run ') + chalk.cyan('npm audit fix') + chalk.gray(' to fix some vulnerabilities automatically.'));
    } else {
      console.log('\n' + chalk.green.bold('🔒 Security Audit: No vulnerabilities found'));
    }

    // Print summary
    const outdatedCount = dependencies.filter(d => d.isOutdated).length;
    const vulnCount = dependencies.filter(d => d.hasVulnerability).length;
    
    console.log(`\n${chalk.gray('Summary:')} ${dependencies.length} total packages`);
    if (outdatedCount > 0) {
      console.log(`${chalk.gray('  Outdated:')} ${outdatedCount}`);
    }
    if (vulnCount > 0) {
      console.log(`${chalk.gray('  With vulnerabilities:')} ${vulnCount}`);
    }
  }

  static formatVulnerabilityDetails(vulnerabilities: VulnerabilityInfo[]): void {
    if (vulnerabilities.length === 0) {
      console.log(chalk.green('No vulnerabilities found!'));
      return;
    }

    console.log(chalk.red.bold(`\n🔒 Found ${vulnerabilities.length} vulnerabilities:\n`));

    for (const vuln of vulnerabilities) {
      let color = chalk.white;
      switch (vuln.severity) {
        case 'critical':
          color = chalk.red.bold;
          break;
        case 'high':
          color = chalk.red;
          break;
        case 'moderate':
          color = chalk.yellow;
          break;
        case 'low':
          color = chalk.blue;
          break;
      }

      console.log(`${color(vuln.severity.toUpperCase())} ${chalk.bold(vuln.id)}`);
      console.log(`   ${vuln.title}`);
      if (vuln.url) {
        console.log(`   ${chalk.gray(vuln.url)}`);
      }
      console.log('');
    }
  }

  static formatUpdateSummary(updates: { name: string; oldVersion: string; newVersion: string; type: string }[], failed: { name: string; error: string }[]): void {
    if (updates.length > 0) {
      console.log(chalk.green.bold('\n✅ Successfully updated packages:'));
      for (const update of updates) {
        console.log(`  ${chalk.cyan(update.name)}: ${chalk.gray(update.oldVersion)} → ${update.newVersion}`);
      }
    }

    if (failed.length > 0) {
      console.log(chalk.red.bold('\n❌ Failed to update packages:'));
      for (const fail of failed) {
        console.log(`  ${chalk.cyan(fail.name)}: ${fail.error}`);
      }
    }
  }

  static formatInstallMessage(packageName: string, type: string): void {
    const typeColors: { [key: string]: any } = {
      dependencies: chalk.blue,
      devDependencies: chalk.green,
      peerDependencies: chalk.magenta
    };

    const color = typeColors[type] || chalk.white;
    console.log(`${color('✓')} Added ${chalk.cyan(packageName)} to ${color(type)}`);
  }

  static formatRemoveMessage(packageName: string): void {
    console.log(`${chalk.green('✓')} Removed ${chalk.cyan(packageName)} from dependencies`);
  }

  static formatError(message: string): void {
    console.error(chalk.red.bold('Error: ') + chalk.red(message));
  }

  static formatInfo(message: string): void {
    console.log(chalk.blue.bold('Info: ') + chalk.blue(message));
  }

  static formatSuccess(message: string): void {
    console.log(chalk.green.bold('Success: ') + chalk.green(message));
  }
}