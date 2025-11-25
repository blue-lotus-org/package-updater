import chalk from 'chalk';
import { PackageJsonManager } from '../utils/packageJson';
import { NpmManager } from '../utils/npm';
import { OutputFormatter } from '../utils/output';
import { AddOptions } from '../types';

export class AddCommand {
  static async execute(packageName: string, options: AddOptions): Promise<void> {
    try {
      if (!packageName) {
        OutputFormatter.formatError('Package name is required');
        process.exit(1);
      }

      // Determine dependency type
      let dependencyType: 'dependencies' | 'devDependencies' | 'peerDependencies' = 'dependencies';
      if (options.peer) {
        dependencyType = 'peerDependencies';
      } else if (options.dev) {
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
      } else {
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
      const packageData = PackageJsonManager.readPackageJson();
      const existingVersion = packageData[dependencyType]?.[name];

      if (existingVersion && !options.skipInstall) {
        const answer = await this.promptUser(`Package ${name} already exists in ${dependencyType}. Update version? (y/N): `);
        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
          OutputFormatter.formatInfo('Add cancelled');
          return;
        }
      }

      // Get latest version info for display
      console.log(chalk.blue.bold('📦 Adding package...'));
      
      let displayVersion = version;
      if (version === 'latest') {
        try {
          displayVersion = await NpmManager.getLatestVersion(name);
          console.log(chalk.gray(`Latest version: ${displayVersion}`));
        } catch (error) {
          console.log(chalk.yellow('⚠️ Could not fetch latest version, using "latest"'));
        }
      }

      // Add to package.json
      const finalVersion = version === 'latest' ? `^${displayVersion}` : version;
      PackageJsonManager.addDependency(name, finalVersion, dependencyType);
      OutputFormatter.formatInstallMessage(name, dependencyType);

      // Run npm install if not skipped
      if (!options.skipInstall) {
        try {
          await NpmManager.installPackage(name);
          OutputFormatter.formatSuccess(`${name} installed and added to ${dependencyType}`);
        } catch (error) {
          OutputFormatter.formatError(`Failed to install ${name}: ${(error as Error).message}`);
          process.exit(1);
        }
      } else {
        console.log(chalk.yellow('⚠️ Skipping npm install - run "npm install" manually to install dependencies'));
      }

    } catch (error) {
      OutputFormatter.formatError(`Add command failed: ${(error as Error).message}`);
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