import * as vscode from "vscode";
import { getFirmwarePath } from "./config";
import { loadFile } from "./firmwareLoader";

export const setupFileWatchers = async (
  panel: vscode.WebviewPanel,
  context: vscode.ExtensionContext
) => {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return;
  }

  const firmwarePath = await getFirmwarePath();
  if (firmwarePath) {
    const relativePath = vscode.workspace.asRelativePath(firmwarePath);
    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(workspaceFolder, relativePath)
    );

    watcher.onDidChange(() => loadFile(panel));
    watcher.onDidCreate(() => loadFile(panel));

    panel.onDidDispose(() => watcher.dispose());

    context.subscriptions.push(watcher);
  }

  const configWatcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(workspaceFolder, "arduboy.ini")
  );

  configWatcher.onDidChange(() => loadFile(panel));
  configWatcher.onDidCreate(() => loadFile(panel));

  panel.onDidDispose(() => configWatcher.dispose());

  context.subscriptions.push(configWatcher);
};
