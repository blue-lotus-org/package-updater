import semver from 'semver';
import { DependencyInfo } from '../types';

export class SemverManager {
  static isCompatible(currentRange: string, newVersion: string): boolean {
    try {
      const range = semver.validRange(currentRange);
      if (!range) {
        return false;
      }
      
      return semver.satisfies(newVersion, range);
    } catch (error) {
      return false;
    }
  }

  static isMajorUpdate(currentRange: string, newVersion: string): boolean {
    try {
      const currentVersion = this.extractVersion(currentRange);
      if (!currentVersion) {
        return false;
      }
      
      return semver.major(currentVersion) < semver.major(newVersion);
    } catch (error) {
      return false;
    }
  }

  static isMinorUpdate(currentRange: string, newVersion: string): boolean {
    try {
      const currentVersion = this.extractVersion(currentRange);
      if (!currentVersion) {
        return false;
      }
      
      return semver.major(currentVersion) === semver.major(newVersion) && 
             semver.minor(currentVersion) < semver.minor(newVersion);
    } catch (error) {
      return false;
    }
  }

  static isPatchUpdate(currentRange: string, newVersion: string): boolean {
    try {
      const currentVersion = this.extractVersion(currentRange);
      if (!currentVersion) {
        return false;
      }
      
      return semver.major(currentVersion) === semver.major(newVersion) && 
             semver.minor(currentVersion) === semver.minor(newVersion) && 
             semver.patch(currentVersion) < semver.patch(newVersion);
    } catch (error) {
      return false;
    }
  }

  static extractVersion(range: string): string | null {
    try {
      // If it's a specific version, return it
      if (semver.valid(range)) {
        return range;
      }
      
      // If it's a range, try to get the highest satisfying version
      // For now, we'll just extract the first valid version found
      const versions = range.match(/\d+\.\d+\.\d+/g);
      if (versions && versions.length > 0) {
        return versions[0];
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  static getUpdateType(currentRange: string, newVersion: string): 'major' | 'minor' | 'patch' | 'incompatible' | 'same' {
    if (this.isMajorUpdate(currentRange, newVersion)) {
      return 'major';
    }
    
    if (this.isMinorUpdate(currentRange, newVersion)) {
      return 'minor';
    }
    
    if (this.isPatchUpdate(currentRange, newVersion)) {
      return 'patch';
    }
    
    if (!this.isCompatible(currentRange, newVersion)) {
      return 'incompatible';
    }
    
    return 'same';
  }

  static formatUpdateMessage(dep: DependencyInfo): string {
    const updateType = this.getUpdateType(dep.semver, dep.latestVersion);
    
    switch (updateType) {
      case 'major':
        return `^${dep.latestVersion} (major update)`;
      case 'minor':
        return `^${dep.latestVersion} (minor update)`;
      case 'patch':
        return `^${dep.latestVersion} (patch update)`;
      case 'incompatible':
        return `${dep.latestVersion} (breaking changes - manual update required)`;
      case 'same':
        return 'Already latest';
      default:
        return dep.latestVersion;
    }
  }
}