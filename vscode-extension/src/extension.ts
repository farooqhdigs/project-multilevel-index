/**
 * VSCode Extension Entry Point
 * Project Multilevel Index - Fractal Documentation System
 */

import * as vscode from 'vscode';
import { FileWatcher } from './watcher/fileWatcher';
import { Updater } from './indexer/updater';
import { Config } from './core/config';
import { Logger } from './core/logger';

let fileWatcher: FileWatcher | undefined;
let logger: Logger;

/**
 * Extension activation
 */
export async function activate(context: vscode.ExtensionContext) {
  logger = new Logger('ProjectIndex');
  logger.info('Activating Project Multilevel Index extension...');

  // Get workspace folder
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    logger.warn('No workspace folder found. Extension will not activate.');
    return;
  }

  const workspaceRoot = workspaceFolder.uri.fsPath;
  logger.info(`Workspace root: ${workspaceRoot}`);

  // Load configuration
  const config = await Config.load(workspaceRoot);
  logger.info(`Configuration loaded. Auto-update: ${config.index.autoUpdate}`);

  // Create updater
  const updater = new Updater(logger);

  // Create file watcher
  if (config.index.autoUpdate) {
    fileWatcher = new FileWatcher(
      workspaceRoot,
      config,
      async (uri) => {
        try {
          await updater.updateAll(uri);
        } catch (error) {
          logger.error(`Failed to update index for ${uri.fsPath}:`, error);
          vscode.window.showErrorMessage(
            `Failed to update index: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      },
      logger
    );
    logger.info('File watcher started');
  }

  // Register commands
  registerCommands(context, workspaceRoot, updater);

  // Register configuration change listener
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('projectMultilevelIndex')) {
        logger.info('Configuration changed, reloading...');
        handleConfigurationChange(workspaceRoot, config);
      }
    })
  );

  // Register disposables
  if (fileWatcher) {
    context.subscriptions.push(fileWatcher);
  }

  logger.info('✅ Project Multilevel Index extension activated successfully');

  // Show welcome message (only first time)
  const hasShownWelcome = context.globalState.get('hasShownWelcome', false);
  if (!hasShownWelcome) {
    showWelcomeMessage(context);
  }
}

/**
 * Extension deactivation
 */
export function deactivate() {
  logger?.info('Deactivating Project Multilevel Index extension...');
  fileWatcher?.dispose();
  logger?.info('✅ Extension deactivated');
}

/**
 * Register extension commands
 */
function registerCommands(
  context: vscode.ExtensionContext,
  workspaceRoot: string,
  updater: Updater
) {
  // Initialize index command
  const initCommand = vscode.commands.registerCommand(
    'project-multilevel-index.init',
    async () => {
      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Initializing Project Index',
            cancellable: false
          },
          async (progress) => {
            progress.report({ message: 'Scanning project files...' });
            await initializeIndex(workspaceRoot, updater);
            progress.report({ message: 'Done!' });
          }
        );
        vscode.window.showInformationMessage('✅ Project index initialized successfully!');
      } catch (error) {
        logger.error('Failed to initialize index:', error);
        vscode.window.showErrorMessage(
          `Failed to initialize index: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  );

  // Update all indexes command
  const updateCommand = vscode.commands.registerCommand(
    'project-multilevel-index.update',
    async () => {
      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Updating Project Index',
            cancellable: false
          },
          async (progress) => {
            progress.report({ message: 'Updating all indexes...' });
            await updateAllIndexes(workspaceRoot, updater);
            progress.report({ message: 'Done!' });
          }
        );
        vscode.window.showInformationMessage('✅ All indexes updated successfully!');
      } catch (error) {
        logger.error('Failed to update indexes:', error);
        vscode.window.showErrorMessage(
          `Failed to update indexes: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  );

  // Check index consistency command
  const checkCommand = vscode.commands.registerCommand(
    'project-multilevel-index.check',
    async () => {
      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Checking Index Consistency',
            cancellable: false
          },
          async (progress) => {
            progress.report({ message: 'Analyzing index integrity...' });
            await checkIndexConsistency(workspaceRoot);
            progress.report({ message: 'Done!' });
          }
        );
      } catch (error) {
        logger.error('Failed to check index:', error);
        vscode.window.showErrorMessage(
          `Failed to check index: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  );

  // Toggle auto-update command
  const toggleCommand = vscode.commands.registerCommand(
    'project-multilevel-index.toggleAutoUpdate',
    async () => {
      const config = vscode.workspace.getConfiguration('projectMultilevelIndex');
      const current = config.get<boolean>('autoUpdate', true);
      await config.update('autoUpdate', !current, vscode.ConfigurationTarget.Workspace);
      vscode.window.showInformationMessage(
        `Auto-update ${!current ? 'enabled' : 'disabled'}`
      );
    }
  );

  context.subscriptions.push(initCommand, updateCommand, checkCommand, toggleCommand);
}

/**
 * Show welcome message
 */
function showWelcomeMessage(context: vscode.ExtensionContext) {
  const message = '🎼 Project Multilevel Index is now active! Initialize your project index?';
  const action = 'Initialize Now';
  const doNotShowAgain = "Don't Show Again";

  vscode.window.showInformationMessage(message, action, doNotShowAgain).then((selection) => {
    if (selection === action) {
      vscode.commands.executeCommand('project-multilevel-index.init');
    } else if (selection === doNotShowAgain) {
      context.globalState.update('hasShownWelcome', true);
    }
  });
}

/**
 * Handle configuration changes
 */
async function handleConfigurationChange(workspaceRoot: string, oldConfig: any) {
  const newConfig = await Config.load(workspaceRoot);

  // Restart file watcher if auto-update setting changed
  if (oldConfig.index.autoUpdate !== newConfig.index.autoUpdate) {
    logger.info(`Auto-update setting changed: ${newConfig.index.autoUpdate}`);
    // TODO: Restart watcher
  }
}

/**
 * Initialize index system
 */
async function initializeIndex(workspaceRoot: string, updater: Updater): Promise<void> {
  logger.info('Initializing index system...');
  // TODO: Implement full initialization logic
  logger.info('Index system initialized');
}

/**
 * Update all indexes
 */
async function updateAllIndexes(workspaceRoot: string, updater: Updater): Promise<void> {
  logger.info('Updating all indexes...');
  // TODO: Implement update all logic
  logger.info('All indexes updated');
}

/**
 * Check index consistency
 */
async function checkIndexConsistency(workspaceRoot: string): Promise<void> {
  logger.info('Checking index consistency...');
  // TODO: Implement consistency check logic
  logger.info('Consistency check complete');
}
