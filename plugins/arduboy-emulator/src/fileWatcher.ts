import * as vscode from "vscode";
import { getFirmwarePath } from "./config";
import { loadFile } from "./firmwareLoader";

// Function to setup file watchers for auto-reload functionality
export const setupFileWatchers = async (
  panel: vscode.WebviewPanel,
  context: vscode.ExtensionContext
) => {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return;
  }

  // Get the firmware path from config or use default
  const firmwarePath = await getFirmwarePath();
  if (firmwarePath) {
    // Create relative pattern from the firmware path
    const relativePath = vscode.workspace.asRelativePath(firmwarePath);
    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(workspaceFolder, relativePath)
    );

    watcher.onDidChange(() => loadFile(panel));
    watcher.onDidCreate(() => loadFile(panel));

    // Clean up watcher when panel is disposed
    panel.onDidDispose(() => watcher.dispose());

    context.subscriptions.push(watcher);
  }

  // Also watch for changes to the config file itself
  const configWatcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(workspaceFolder, "arduboy.ini")
  );

  configWatcher.onDidChange(() => loadFile(panel));
  configWatcher.onDidCreate(() => loadFile(panel));

  // Clean up config watcher when panel is disposed
  panel.onDidDispose(() => configWatcher.dispose());

  context.subscriptions.push(configWatcher);
};
