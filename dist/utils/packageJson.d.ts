import { PackageJson } from '../types';
export declare class PackageJsonManager {
    static readPackageJson(): PackageJson;
    static writePackageJson(data: PackageJson): void;
    static addDependency(name: string, version: string, type?: 'dependencies' | 'devDependencies' | 'peerDependencies'): void;
    static removeDependency(name: string, type?: 'dependencies' | 'devDependencies' | 'peerDependencies'): void;
    static updateDependency(name: string, version: string, type?: 'dependencies' | 'devDependencies' | 'peerDependencies'): void;
    static getAllDependencies(): {
        [key: string]: string;
    };
}
//# sourceMappingURL=packageJson.d.ts.map