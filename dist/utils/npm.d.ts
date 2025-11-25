import { AuditResult } from '../types';
export declare class NpmManager {
    static getLatestVersion(packageName: string): Promise<string>;
    static getInstalledVersion(packageName: string): Promise<string | null>;
    static getMultipleInstalledVersions(packageNames: string[]): Promise<{
        [key: string]: string | null;
    }>;
    static runAudit(): Promise<AuditResult>;
    static install(): Promise<void>;
    static installPackage(packageName: string): Promise<void>;
    static uninstallPackage(packageName: string): Promise<void>;
}
//# sourceMappingURL=npm.d.ts.map