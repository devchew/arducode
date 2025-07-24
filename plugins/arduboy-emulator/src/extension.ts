import * as vscode from "vscode";

import { generateDefaultConfig } from "./config";
import { setupWebviewPanel } from "./webviewPanel";

export function activate(context: vscode.ExtensionContext) {
  const activePanels = new Set<vscode.WebviewPanel>();

  vscode.commands.registerCommand("arduboy-emulator.openEmulator", async () => {
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

    activePanels.add(panel);

    panel.onDidDispose(() => {
      activePanels.delete(panel);
    });

    await setupWebviewPanel(panel, context);
  });

  vscode.commands.registerCommand(
    "arduboy-emulator.generateConfig",
    async () => {
      await generateDefaultConfig();
    }
  );

  vscode.window.registerWebviewPanelSerializer("arduboyEmulator", {
    async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel) {
      activePanels.add(webviewPanel);

      webviewPanel.onDidDispose(() => {
        activePanels.delete(webviewPanel);
      });

      webviewPanel.webview.options = {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, "src", "ardens"),
        ],
      };

      await setupWebviewPanel(webviewPanel, context);
    },
  });
}

export function deactivate() {}
