import { DependencyInfo, VulnerabilityInfo } from '../types';
export declare class OutputFormatter {
    static formatStatusOutput(dependencies: DependencyInfo[], auditResult: any): void;
    static formatVulnerabilityDetails(vulnerabilities: VulnerabilityInfo[]): void;
    static formatUpdateSummary(updates: {
        name: string;
        oldVersion: string;
        newVersion: string;
        type: string;
    }[], failed: {
        name: string;
        error: string;
    }[]): void;
    static formatInstallMessage(packageName: string, type: string): void;
    static formatRemoveMessage(packageName: string): void;
    static formatError(message: string): void;
    static formatInfo(message: string): void;
    static formatSuccess(message: string): void;
}
//# sourceMappingURL=output.d.ts.map