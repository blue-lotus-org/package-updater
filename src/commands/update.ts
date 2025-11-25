import chalk from 'chalk';
import { PackageJsonManager } from '../utils/packageJson';
import { NpmManager } from '../utils/npm';
import { SemverManager } from '../utils/semver';
import { OutputFormatter } from '../utils/output';
import ora from 'ora';

interface UpdateInfo {
  name: string;
  oldVersion: string;
  newVersion: string;
  type: 'major' | 'minor' | 'patch' | 'incompatible' | 'same';
}

export class UpdateCommand {
  static async execute(packageName?: string, force: boolean = false): Promise<void> {
    try {
      const packageData = PackageJsonManager.readPackageJson();
      const allDeps = PackageJsonManager.getAllDependencies();

      if (Object.keys(allDeps).length === 0) {
        OutputFormatter.formatInfo('No dependencies found to update');
        return;
      }

      const depsToUpdate = packageName ? { [packageName]: allDeps[packageName] } : allDeps;

      if (packageName && !allDeps[packageName]) {
        OutputFormatter.formatError(`Package "${packageName}" not found in dependencies`);
        process.exit(1);
      }

      const updates: UpdateInfo[] = [];
      const failed: { name: string; error: string }[] = [];

      console.log(chalk.blue.bold('🔄 Checking for updates...'));

      // Check each package for updates
      for (const [name, semver] of Object.entries(depsToUpdate)) {
        try {
          const latestVersion = await NpmManager.getLatestVersion(name);
          const installedVersion = await NpmManager.getInstalledVersion(name);
          const updateType = SemverManager.getUpdateType(semver, latestVersion);

          if (updateType !== 'same') {
            // Check if it's a breaking change
            if ((updateType === 'major' || updateType === 'incompatible') && !force) {
              console.log(chalk.yellow(`⚠️  ${name}: Major version change detected (${semver} → ${latestVersion})`));
              console.log(chalk.gray('  Use --force to update anyway'));
              continue;
            }

            updates.push({
              name,
              oldVersion: semver,
              newVersion: latestVersion,
              type: updateType
            });
          }
        } catch (error) {
          failed.push({
            name,
            error: `Failed to check version: ${(error as Error).message}`
          });
        }
      }

      if (updates.length === 0) {
        if (failed.length === 0) {
          OutputFormatter.formatInfo('All dependencies are already up to date');
        } else {
          OutputFormatter.formatError('No valid updates found, but some packages had errors');
        }
        return;
      }

      // Show what will be updated
      console.log(chalk.green.bold(`\nFound ${updates.length} package(s) to update:`));
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
        console.log(`  ${icon} ${chalk.cyan(update.name)}: ${chalk.gray(update.oldVersion)} → ${chalk.green(update.newVersion)}`);
      }

      if (failed.length > 0) {
        console.log(chalk.yellow.bold(`\n⚠️ ${failed.length} package(s) could not be checked:`));
        for (const fail of failed) {
          console.log(`  ${chalk.red(fail.name)}: ${fail.error}`);
        }
      }

      // Ask for confirmation for major updates
      const hasMajorUpdates = updates.some(update => update.type === 'major' || update.type === 'incompatible');
      if (hasMajorUpdates && !force) {
        console.log(chalk.yellow.bold('\n⚠️ Major updates may contain breaking changes!'));
        const answer = await this.promptUser('Continue with major updates? (y/N): ');
        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
          OutputFormatter.formatInfo('Update cancelled');
          return;
        }
      }

      // Perform updates
      const updateSpinner = ora('Updating dependencies...').start();
      let updated = 0;
      let skipped = 0;

      for (const update of updates) {
        try {
          PackageJsonManager.updateDependency(update.name, `^${update.newVersion}`);
          updated++;
        } catch (error) {
          failed.push({
            name: update.name,
            error: `Failed to update package.json: ${(error as Error).message}`
          });
          skipped++;
        }
      }

      updateSpinner.succeed(`Updated ${updated} package(s) in package.json`);

      // Run npm install
      try {
        console.log(chalk.blue('Running npm install...'));
        await NpmManager.install();
      } catch (error) {
        OutputFormatter.formatError(`npm install failed: ${(error as Error).message}`);
      }

      // Show results
      OutputFormatter.formatUpdateSummary(
        updates.filter(u => !failed.some(f => f.name === u.name)),
        failed
      );

    } catch (error) {
      OutputFormatter.formatError(`Update command failed: ${(error as Error).message}`);
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