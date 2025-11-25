import fs from 'fs';
import path from 'path';
import { PackageJson } from '../types';

const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');

export class PackageJsonManager {
  static readPackageJson(): PackageJson {
    try {
      const packageJsonPath = path.resolve(process.cwd(), 'package.json');
      
      if (!fs.existsSync(packageJsonPath)) {
        throw new Error('package.json not found in current directory');
      }

      const content = fs.readFileSync(packageJsonPath, 'utf8');
      const data = JSON.parse(content);
      
      return {
        name: data.name || '',
        version: data.version || '',
        dependencies: data.dependencies || {},
        devDependencies: data.devDependencies || {},
        peerDependencies: data.peerDependencies || {},
        ...data
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid package.json format');
      }
      throw new Error(`Failed to read package.json: ${(error as Error).message}`);
    }
  }

  static writePackageJson(data: PackageJson): void {
    try {
      const packageJsonPath = path.resolve(process.cwd(), 'package.json');
      
      // Create backup
      if (fs.existsSync(packageJsonPath)) {
        fs.writeFileSync(
          packageJsonPath + '.backup',
          fs.readFileSync(packageJsonPath, 'utf8')
        );
      }

      // Write new package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(data, null, 2) + '\n');
      
      // Remove backup on success
      if (fs.existsSync(packageJsonPath + '.backup')) {
        fs.unlinkSync(packageJsonPath + '.backup');
      }
    } catch (error) {
      throw new Error(`Failed to write package.json: ${(error as Error).message}`);
    }
  }

  static addDependency(name: string, version: string, type: 'dependencies' | 'devDependencies' | 'peerDependencies' = 'dependencies'): void {
    const packageData = this.readPackageJson();
    
    if (!packageData[type]) {
      packageData[type] = {};
    }

    // Check if dependency already exists
    if (packageData[type][name]) {
      console.log(`Package ${name} already exists in ${type}. Updating version...`);
    }

    packageData[type][name] = version;
    this.writePackageJson(packageData);
  }

  static removeDependency(name: string, type?: 'dependencies' | 'devDependencies' | 'peerDependencies'): void {
    const packageData = this.readPackageJson();
    let removed = false;

    if (type) {
      // Remove from specific dependency type
      if (packageData[type] && packageData[type][name]) {
        delete packageData[type][name];
        removed = true;
      }
    } else {
      // Remove from any dependency type
      const types = ['dependencies', 'devDependencies', 'peerDependencies'] as const;
      for (const depType of types) {
        if (packageData[depType] && packageData[depType][name]) {
          delete packageData[depType][name];
          removed = true;
          console.log(`Removed ${name} from ${depType}`);
        }
      }
    }

    if (!removed) {
      throw new Error(`Package ${name} not found in any dependency type`);
    }

    this.writePackageJson(packageData);
  }

  static updateDependency(name: string, version: string, type?: 'dependencies' | 'devDependencies' | 'peerDependencies'): void {
    const packageData = this.readPackageJson();
    let updated = false;

    if (type) {
      // Update in specific dependency type
      if (packageData[type] && packageData[type][name]) {
        packageData[type][name] = version;
        updated = true;
      }
    } else {
      // Find and update in any dependency type
      const types = ['dependencies', 'devDependencies', 'peerDependencies'] as const;
      for (const depType of types) {
        if (packageData[depType] && packageData[depType][name]) {
          packageData[depType][name] = version;
          updated = true;
          console.log(`Updated ${name} in ${depType}`);
        }
      }
    }

    if (!updated) {
      throw new Error(`Package ${name} not found in any dependency type`);
    }

    this.writePackageJson(packageData);
  }

  static getAllDependencies(): { [key: string]: string } {
    const packageData = this.readPackageJson();
    const allDeps: { [key: string]: string } = {};

    if (packageData.dependencies) {
      Object.assign(allDeps, packageData.dependencies);
    }
    
    if (packageData.devDependencies) {
      Object.assign(allDeps, packageData.devDependencies);
    }
    
    if (packageData.peerDependencies) {
      Object.assign(allDeps, packageData.peerDependencies);
    }

    return allDeps;
  }
}