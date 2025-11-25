"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemverManager = void 0;
const semver_1 = __importDefault(require("semver"));
class SemverManager {
    static isCompatible(currentRange, newVersion) {
        try {
            const range = semver_1.default.validRange(currentRange);
            if (!range) {
                return false;
            }
            return semver_1.default.satisfies(newVersion, range);
        }
        catch (error) {
            return false;
        }
    }
    static isMajorUpdate(currentRange, newVersion) {
        try {
            const currentVersion = this.extractVersion(currentRange);
            if (!currentVersion) {
                return false;
            }
            return semver_1.default.major(currentVersion) < semver_1.default.major(newVersion);
        }
        catch (error) {
            return false;
        }
    }
    static isMinorUpdate(currentRange, newVersion) {
        try {
            const currentVersion = this.extractVersion(currentRange);
            if (!currentVersion) {
                return false;
            }
            return semver_1.default.major(currentVersion) === semver_1.default.major(newVersion) &&
                semver_1.default.minor(currentVersion) < semver_1.default.minor(newVersion);
        }
        catch (error) {
            return false;
        }
    }
    static isPatchUpdate(currentRange, newVersion) {
        try {
            const currentVersion = this.extractVersion(currentRange);
            if (!currentVersion) {
                return false;
            }
            return semver_1.default.major(currentVersion) === semver_1.default.major(newVersion) &&
                semver_1.default.minor(currentVersion) === semver_1.default.minor(newVersion) &&
                semver_1.default.patch(currentVersion) < semver_1.default.patch(newVersion);
        }
        catch (error) {
            return false;
        }
    }
    static extractVersion(range) {
        try {
            // If it's a specific version, return it
            if (semver_1.default.valid(range)) {
                return range;
            }
            // If it's a range, try to get the highest satisfying version
            // For now, we'll just extract the first valid version found
            const versions = range.match(/\d+\.\d+\.\d+/g);
            if (versions && versions.length > 0) {
                return versions[0];
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    static getUpdateType(currentRange, newVersion) {
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
    static formatUpdateMessage(dep) {
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
exports.SemverManager = SemverManager;
//# sourceMappingURL=semver.js.map