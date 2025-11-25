import chalk from 'chalk';
import { PackageJsonManager } from '../utils/packageJson';
import { NpmManager } from '../utils/npm';
import { OutputFormatter } from '../utils/output';
import { DependencyInfo } from '../types';
import ora from 'ora';

export class StatusCommand {
  static async execute(): Promise<void> {
    try {
      // Check if package.json exists
      let packageData;
      try {
        packageData = PackageJsonManager.readPackageJson();
      } catch (error) {
        OutputFormatter.formatError((error as Error).message);
        process.exit(1);
      }

      // Get all dependencies
      const dependencies = {
        ...(packageData.dependencies || {}),
        ...(packageData.devDependencies || {}),
        ...(packageData.peerDependencies || {})
      };

      if (Object.keys(dependencies).length === 0) {
        OutputFormatter.formatInfo('No dependencies found in package.json');
        return;
      }

      // Check if we should run audit
      let auditResult: any = { vulnerabilities: 0, high: 0, moderate: 0, low: 0, details: [] };
      
      console.log(chalk.blue.bold('📦 Analyzing dependencies...'));
      
      // Create progress spinner
      const spinner = ora('Fetching package information...').start();

      try {
        // Get latest versions for all packages
        const dependencyList = Object.keys(dependencies);
        const latestVersions: { [key: string]: string } = {};
        const installedVersions: { [key: string]: string | null } = {};

        // Fetch latest versions
        for (const name of dependencyList) {
          try {
            latestVersions[name] = await NpmManager.getLatestVersion(name);
          } catch (error) {
            latestVersions[name] = 'unknown';
          }
        }

        // Fetch installed versions
        const versions = await NpmManager.getMultipleInstalledVersions(dependencyList);
        for (const name of dependencyList) {
          installedVersions[name] = versions[name] || null;
        }

        // Run audit
        try {
          const auditData = await NpmManager.runAudit();
          auditResult = { ...auditResult, ...auditData };
        } catch (error) {
          // Audit might fail if no vulnerabilities or network issues
          console.log(chalk.yellow('⚠️ Could not fetch audit information'));
        }

        spinner.succeed('Package information fetched');

        // Build dependency info
        const dependencyInfos: DependencyInfo[] = [];
        
        for (const [name, semver] of Object.entries(dependencies)) {
          const currentVersion = installedVersions[name];
          const latestVersion = latestVersions[name] || 'unknown';
          const isOutdated = Boolean(currentVersion && latestVersion !== 'unknown' && currentVersion !== latestVersion);
          
          // Determine dependency type
          let type: 'dependency' | 'devDependency' | 'peerDependency' = 'dependency';
          if (packageData.peerDependencies && packageData.peerDependencies[name]) {
            type = 'peerDependency';
          } else if (packageData.devDependencies && packageData.devDependencies[name]) {
            type = 'devDependency';
          }

          // Check for vulnerabilities
          const hasVulnerability = auditResult.details.some((vuln: any) => 
            vuln.id?.includes(name) || 
            // This is a simplified check - in a real implementation, you'd want to map vulnerabilities to specific packages
            false
          );

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
          if (typeDiff !== 0) return typeDiff;
          return a.name.localeCompare(b.name);
        });

        OutputFormatter.formatStatusOutput(dependencyInfos, auditResult);

      } catch (error) {
        spinner.fail('Failed to fetch package information');
        throw error;
      }

    } catch (error) {
      OutputFormatter.formatError(`Status command failed: ${(error as Error).message}`);
      process.exit(1);
    }
  }
}