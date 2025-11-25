import chalk from 'chalk';
import { PackageJsonManager } from '../utils/packageJson';
import { NpmManager } from '../utils/npm';
import { OutputFormatter } from '../utils/output';
import { RemoveOptions } from '../types';

export class RemoveCommand {
  static async execute(packageName: string, options: RemoveOptions): Promise<void> {
    try {
      if (!packageName) {
        OutputFormatter.formatError('Package name is required');
        process.exit(1);
      }

      // Check if package exists in any dependency type
      const packageData = PackageJsonManager.readPackageJson();
      let foundInTypes: string[] = [];

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
        OutputFormatter.formatError(`Package "${packageName}" not found in any dependency type`);
        process.exit(1);
      }

      // Show found locations and ask for confirmation
      if (foundInTypes.length > 1) {
        console.log(chalk.yellow(`Found ${packageName} in multiple dependency types:`));
        for (const type of foundInTypes) {
          const version = packageData[type][packageName];
          console.log(`  ${chalk.cyan(type)}: ${version}`);
        }
      }

      const dependencyType = (foundInTypes.length === 1 ? foundInTypes[0] : 'dependencies') as 'dependencies' | 'devDependencies' | 'peerDependencies';
      const version = packageData[dependencyType]?.[packageName] || 'unknown';

      if (!options.force) {
        const answer = await this.promptUser(`Remove ${chalk.cyan(packageName)} (${version}) from ${chalk.cyan(dependencyType)}? (y/N): `);
        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
          OutputFormatter.formatInfo('Remove cancelled');
          return;
        }
      }

      // Remove from package.json
      PackageJsonManager.removeDependency(packageName, dependencyType);
      OutputFormatter.formatRemoveMessage(packageName);

      // Run npm uninstall if not skipped
      if (!options.skipInstall) {
        try {
          await NpmManager.uninstallPackage(packageName);
          OutputFormatter.formatSuccess(`${packageName} removed from ${dependencyType}`);
        } catch (error) {
          OutputFormatter.formatError(`Failed to uninstall ${packageName}: ${(error as Error).message}`);
          process.exit(1);
        }
      } else {
        console.log(chalk.yellow('⚠️ Skipping npm uninstall - run "npm uninstall ' + packageName + '" manually'));
      }

    } catch (error) {
      OutputFormatter.formatError(`Remove command failed: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  private static async promptUser(question: string): Promise<string> {
    return new Promise((resolve) => {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question(question, (answer: string) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }
}