import * as vscode from "vscode";
import { getPlayerWebviewHtml } from "./playerWebView";
import { loadFile } from "./firmwareLoader";
import { setupFileWatchers } from "./fileWatcher";

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

  const ardensUri = panel.webview.asWebviewUri(ardensJsPath);

  panel.webview.options = {
    enableScripts: true,
    localResourceRoots: [
      vscode.Uri.joinPath(context.extensionUri, "src", "ardens"),
    ],
  };

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

  await setupFileWatchers(panel, context);

  panel.webview.html = getPlayerWebviewHtml({
    ardensUri,
    panel,
  });
};
