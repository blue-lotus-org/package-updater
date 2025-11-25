import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import ora from 'ora';
import { AuditResult, VulnerabilityInfo } from '../types';

const execAsync = promisify(exec);

export class NpmManager {
  static async getLatestVersion(packageName: string): Promise<string> {
    try {
      const { stdout } = await execAsync(`npm view ${packageName} version --json`);
      return JSON.parse(stdout.trim());
    } catch (error) {
      throw new Error(`Failed to get latest version for ${packageName}: ${(error as Error).message}`);
    }
  }

  static async getInstalledVersion(packageName: string): Promise<string | null> {
    try {
      const { stdout } = await execAsync(`npm list ${packageName} --depth=0 --json`);
      const data = JSON.parse(stdout);
      return data.dependencies?.[packageName]?.version || null;
    } catch (error) {
      // If package is not installed, npm list returns error code 1
      return null;
    }
  }

  static async getMultipleInstalledVersions(packageNames: string[]): Promise<{ [key: string]: string | null }> {
    try {
      const { stdout } = await execAsync(`npm list ${packageNames.join(' ')} --depth=0 --json`);
      const data = JSON.parse(stdout);
      const versions: { [key: string]: string | null } = {};
      
      for (const name of packageNames) {
        versions[name] = data.dependencies?.[name]?.version || null;
      }
      
      return versions;
    } catch (error) {
      // If some packages are not installed, handle gracefully
      const versions: { [key: string]: string | null } = {};
      for (const name of packageNames) {
        versions[name] = null;
      }
      return versions;
    }
  }

  static async runAudit(): Promise<AuditResult> {
    try {
      const { stdout } = await execAsync('npm audit --json');
      const auditData = JSON.parse(stdout);
      
      let totalVulnerabilities = 0;
      let high = 0;
      let moderate = 0;
      let low = 0;
      const details: VulnerabilityInfo[] = [];

      if (auditData.vulnerabilities) {
        for (const [vulnId, vulnData] of Object.entries(auditData.vulnerabilities)) {
          const vuln = vulnData as any;
          const severity = vuln.severity as 'low' | 'moderate' | 'high' | 'critical';
          
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
    } catch (error) {
      // If no vulnerabilities found, npm returns error but with clean output
      if ((error as Error).message.includes('npm audit found 0 vulnerabilities')) {
        return {
          vulnerabilities: 0,
          high: 0,
          moderate: 0,
          low: 0,
          details: []
        };
      }
      throw new Error(`Failed to run npm audit: ${(error as Error).message}`);
    }
  }

  static async install(): Promise<void> {
    return new Promise((resolve, reject) => {
      const spinner = ora('Running npm install...').start();
      
      const child = spawn('npm', ['install'], {
        stdio: 'inherit',
        shell: true
      });

      child.on('close', (code) => {
        if (code === 0) {
          spinner.succeed('Dependencies installed successfully');
          resolve();
        } else {
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

  static async installPackage(packageName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const spinner = ora(`Installing ${packageName}...`).start();
      
      const child = spawn('npm', ['install', packageName], {
        stdio: 'inherit',
        shell: true
      });

      child.on('close', (code) => {
        if (code === 0) {
          spinner.succeed(`${packageName} installed successfully`);
          resolve();
        } else {
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

  static async uninstallPackage(packageName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const spinner = ora(`Uninstalling ${packageName}...`).start();
      
      const child = spawn('npm', ['uninstall', packageName], {
        stdio: 'inherit',
        shell: true
      });

      child.on('close', (code) => {
        if (code === 0) {
          spinner.succeed(`${packageName} uninstalled successfully`);
          resolve();
        } else {
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