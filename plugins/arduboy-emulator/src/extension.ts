// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { getPlayerWebviewHtml } from "./playerWebView";
import { generateDefaultConfig, getFirmwarePath } from "./config";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Keep track of active emulator panels
  const activePanels = new Set<vscode.WebviewPanel>();

  vscode.commands.registerCommand("arduboy-emulator.openEmulator", async () => {
    // open new webview panel or editor for the emulator
    const panel = vscode.window.createWebviewPanel(
      "arduboyEmulator",
      "Arduboy Emulator",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, "src", "ardens"),
        ],
      }
    );

    // Add panel to active panels set
    activePanels.add(panel);

    // Remove panel from set when disposed
    panel.onDidDispose(() => {
      activePanels.delete(panel);
    });

    // Setup the webview panel
    await setupWebviewPanel(panel, context);
  });

  // Register command to generate default config file
  vscode.commands.registerCommand(
    "arduboy-emulator.generateConfig",
    async () => {
      await generateDefaultConfig();
    }
  );

  // Register webview serializer for panel revival
  vscode.window.registerWebviewPanelSerializer("arduboyEmulator", {
    async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel) {
      // Add panel to active panels set
      activePanels.add(webviewPanel);

      // Remove panel from set when disposed
      webviewPanel.onDidDispose(() => {
        activePanels.delete(webviewPanel);
      });

      // Re-setup the webview panel when VS Code restarts
      webviewPanel.webview.options = {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, "src", "ardens"),
        ],
      };

      // Re-setup all the functionality
      await setupWebviewPanel(webviewPanel, context);
    },
  });
}

const loadFirmware = async (): Promise<Uint8Array | undefined> => {
  try {
    const firmwarePath = await getFirmwarePath();
    if (!firmwarePath) {
      vscode.window.showErrorMessage("No workspace folder found");
      return;
    }

    // Read the firmware file
    const firmwareData = await vscode.workspace.fs.readFile(firmwarePath);

    return firmwareData;
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to load firmware.hex: ${error}`);
  }
};

const loadFile = async (panel: vscode.WebviewPanel) => {
  const data = await loadFirmware();
  if (data) {
    panel.webview.postMessage({
      command: "firmwareData",
      data: Array.from(data),
    });
  }
};

// Function to setup webview panel functionality
async function setupWebviewPanel(
  panel: vscode.WebviewPanel,
  context: vscode.ExtensionContext
) {
  const ardensJsPath = vscode.Uri.joinPath(
    context.extensionUri,
    "src",
    "ardens",
    "ArdensPlayer.js"
  );

  // And get the special URI to use with the webview
  const ardensUri = panel.webview.asWebviewUri(ardensJsPath);

  panel.webview.options = {
    enableScripts: true,
    localResourceRoots: [
      vscode.Uri.joinPath(context.extensionUri, "src", "ardens"),
    ],
  };

  // Handle messages from the webview
  panel.webview.onDidReceiveMessage(
    async (message) => {
      if (message.command === "loadFirmware") {
        await loadFile(panel);
        vscode.window.showInformationMessage("Emulator firmware reloaded!");
      }
    },
    undefined,
    context.subscriptions
  );

  // Set up file watcher for auto-reload
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (workspaceFolder) {
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
  }

  panel.webview.html = getPlayerWebviewHtml({
    ardensUri,
    panel,
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
