import { DependencyInfo } from '../types';
export declare class SemverManager {
    static isCompatible(currentRange: string, newVersion: string): boolean;
    static isMajorUpdate(currentRange: string, newVersion: string): boolean;
    static isMinorUpdate(currentRange: string, newVersion: string): boolean;
    static isPatchUpdate(currentRange: string, newVersion: string): boolean;
    static extractVersion(range: string): string | null;
    static getUpdateType(currentRange: string, newVersion: string): 'major' | 'minor' | 'patch' | 'incompatible' | 'same';
    static formatUpdateMessage(dep: DependencyInfo): string;
}
//# sourceMappingURL=semver.d.ts.map