#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const status_1 = require("./commands/status");
const update_1 = require("./commands/update");
const add_1 = require("./commands/add");
const remove_1 = require("./commands/remove");
const output_1 = require("./utils/output");
const program = new commander_1.Command();
// Configure program
program
    .name('vibe-deps')
    .description('A CLI tool for efficient Node.js dependency management')
    .version('1.0.0');
// status command
program
    .command('status')
    .description('Show dependency status and security vulnerabilities')
    .option('-j, --json', 'Output in JSON format')
    .action(async (options) => {
    try {
        await status_1.StatusCommand.execute();
    }
    catch (error) {
        output_1.OutputFormatter.formatError(error.message);
        process.exit(1);
    }
});
// update command
program
    .command('update')
    .description('Update dependencies to their latest compatible versions')
    .argument('[package-name]', 'Specific package to update (updates all if not provided)')
    .option('-f, --force', 'Force update even for breaking changes')
    .option('--skip-install', 'Skip running npm install after updating package.json')
    .action(async (packageName, options) => {
    try {
        await update_1.UpdateCommand.execute(packageName, options);
    }
    catch (error) {
        output_1.OutputFormatter.formatError(error.message);
        process.exit(1);
    }
});
// add command
program
    .command('add')
    .description('Add a new dependency')
    .argument('<package-name>', 'Package name to add (e.g., lodash@4.17.21 or @scope/package@latest)')
    .option('-d, --dev', 'Add to devDependencies')
    .option('-p, --peer', 'Add to peerDependencies')
    .option('-v, --version <version>', 'Specific version to install')
    .option('--skip-install', 'Skip running npm install after updating package.json')
    .action(async (packageName, options) => {
    try {
        await add_1.AddCommand.execute(packageName, options);
    }
    catch (error) {
        output_1.OutputFormatter.formatError(error.message);
        process.exit(1);
    }
});
// remove command
program
    .command('remove')
    .description('Remove a dependency')
    .argument('<package-name>', 'Package name to remove')
    .option('-f, --force', 'Remove without confirmation')
    .option('--skip-install', 'Skip running npm uninstall after updating package.json')
    .action(async (packageName, options) => {
    try {
        await remove_1.RemoveCommand.execute(packageName, options);
    }
    catch (error) {
        output_1.OutputFormatter.formatError(error.message);
        process.exit(1);
    }
});
// Handle no command provided
if (process.argv.length === 2) {
    console.log(chalk_1.default.cyan.bold('📦 vibe-deps'));
    console.log(chalk_1.default.gray('Node.js dependency management CLI\n'));
    console.log('Usage: vibe-deps <command> [options]\n');
    console.log('Commands:');
    console.log('  status               Show dependency status and vulnerabilities');
    console.log('  update [package]     Update dependencies');
    console.log('  add <package>        Add a new dependency');
    console.log('  remove <package>     Remove a dependency\n');
    console.log('Options:');
    console.log('  -h, --help          Show help information');
    console.log('  -v, --version       Show version');
    process.exit(0);
}
// Global error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk_1.default.red.bold('Unhandled Rejection:'), reason);
    process.exit(1);
});
process.on('uncaughtException', (error) => {
    console.error(chalk_1.default.red.bold('Uncaught Exception:'), error.message);
    process.exit(1);
});
// Parse and execute command
program.parse(process.argv);
//# sourceMappingURL=cli.js.map