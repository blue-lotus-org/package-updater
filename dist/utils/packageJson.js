"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageJsonManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const PACKAGE_JSON_PATH = path_1.default.join(process.cwd(), 'package.json');
class PackageJsonManager {
    static readPackageJson() {
        try {
            const packageJsonPath = path_1.default.resolve(process.cwd(), 'package.json');
            if (!fs_1.default.existsSync(packageJsonPath)) {
                throw new Error('package.json not found in current directory');
            }
            const content = fs_1.default.readFileSync(packageJsonPath, 'utf8');
            const data = JSON.parse(content);
            return {
                name: data.name || '',
                version: data.version || '',
                dependencies: data.dependencies || {},
                devDependencies: data.devDependencies || {},
                peerDependencies: data.peerDependencies || {},
                ...data
            };
        }
        catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error('Invalid package.json format');
            }
            throw new Error(`Failed to read package.json: ${error.message}`);
        }
    }
    static writePackageJson(data) {
        try {
            const packageJsonPath = path_1.default.resolve(process.cwd(), 'package.json');
            // Create backup
            if (fs_1.default.existsSync(packageJsonPath)) {
                fs_1.default.writeFileSync(packageJsonPath + '.backup', fs_1.default.readFileSync(packageJsonPath, 'utf8'));
            }
            // Write new package.json
            fs_1.default.writeFileSync(packageJsonPath, JSON.stringify(data, null, 2) + '\n');
            // Remove backup on success
            if (fs_1.default.existsSync(packageJsonPath + '.backup')) {
                fs_1.default.unlinkSync(packageJsonPath + '.backup');
            }
        }
        catch (error) {
            throw new Error(`Failed to write package.json: ${error.message}`);
        }
    }
    static addDependency(name, version, type = 'dependencies') {
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
    static removeDependency(name, type) {
        const packageData = this.readPackageJson();
        let removed = false;
        if (type) {
            // Remove from specific dependency type
            if (packageData[type] && packageData[type][name]) {
                delete packageData[type][name];
                removed = true;
            }
        }
        else {
            // Remove from any dependency type
            const types = ['dependencies', 'devDependencies', 'peerDependencies'];
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
    static updateDependency(name, version, type) {
        const packageData = this.readPackageJson();
        let updated = false;
        if (type) {
            // Update in specific dependency type
            if (packageData[type] && packageData[type][name]) {
                packageData[type][name] = version;
                updated = true;
            }
        }
        else {
            // Find and update in any dependency type
            const types = ['dependencies', 'devDependencies', 'peerDependencies'];
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
    static getAllDependencies() {
        const packageData = this.readPackageJson();
        const allDeps = {};
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
exports.PackageJsonManager = PackageJsonManager;
//# sourceMappingURL=packageJson.js.map