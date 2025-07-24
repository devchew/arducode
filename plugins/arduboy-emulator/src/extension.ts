// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { generateDefaultConfig } from "./config";
import { setupWebviewPanel } from "./webviewPanel";

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

// This method is called when your extension is deactivated
export function deactivate() {}
