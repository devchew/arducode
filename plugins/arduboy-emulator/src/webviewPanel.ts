import * as vscode from "vscode";
import { getPlayerWebviewHtml } from "./playerWebView";
import { loadFile } from "./firmwareLoader";
import { setupFileWatchers } from "./fileWatcher";

// Function to setup webview panel functionality
export const setupWebviewPanel = async (
  panel: vscode.WebviewPanel,
  context: vscode.ExtensionContext
) => {
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

  // Set up file watchers for auto-reload
  await setupFileWatchers(panel, context);

  // Set the webview HTML content
  panel.webview.html = getPlayerWebviewHtml({
    ardensUri,
    panel,
  });
};
