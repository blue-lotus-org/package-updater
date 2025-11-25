export interface PackageJson {
    name?: string;
    version?: string;
    dependencies?: {
        [key: string]: string;
    };
    devDependencies?: {
        [key: string]: string;
    };
    peerDependencies?: {
        [key: string]: string;
    };
    [key: string]: any;
}
export interface DependencyInfo {
    name: string;
    currentVersion: string;
    latestVersion: string;
    semver: string;
    type: 'dependency' | 'devDependency' | 'peerDependency';
    isOutdated: boolean;
    hasVulnerability: boolean;
    vulnerabilityLevel?: 'low' | 'moderate' | 'high' | 'critical';
    vulnerabilityCount?: number;
}
export interface VulnerabilityInfo {
    id: string;
    title: string;
    severity: 'low' | 'moderate' | 'high' | 'critical';
    url?: string;
}
export interface UpdateOptions {
    packageName?: string;
    force?: boolean;
    skipInstall?: boolean;
}
export interface AddOptions {
    dev?: boolean;
    peer?: boolean;
    version?: string;
    skipInstall?: boolean;
}
export interface RemoveOptions {
    force?: boolean;
    skipInstall?: boolean;
}
export interface AuditResult {
    vulnerabilities: number;
    high: number;
    moderate: number;
    low: number;
    details: VulnerabilityInfo[];
}
//# sourceMappingURL=index.d.ts.map