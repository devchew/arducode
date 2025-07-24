// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { getPlayerWebviewHtml } from "./playerWebView";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  vscode.commands.registerCommand("arduboy-emulator.openEmulator", () => {
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

    // Setup the webview panel
    setupWebviewPanel(panel, context);
  });


  // Register webview serializer for panel revival
  vscode.window.registerWebviewPanelSerializer("arduboyEmulator", {
    async deserializeWebviewPanel(
      webviewPanel: vscode.WebviewPanel
    ) {
      // Re-setup the webview panel when VS Code restarts
      webviewPanel.webview.options = {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, "src", "ardens"),
        ],
      };

      // Re-setup all the functionality
      setupWebviewPanel(webviewPanel, context);
    },
  });
}

// Function to setup webview panel functionality
function setupWebviewPanel(
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

  // Function to load firmware
  const loadFirmware = async (): Promise<Uint8Array | undefined> => {
    try {
      // Find the workspace folder
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace folder found");
        return;
      }

      // Construct path to firmware.hex
      const firmwarePath = vscode.Uri.joinPath(
        workspaceFolder.uri,
        ".pio",
        "build",
        "arduboy",
        "firmware.hex"
      );

      // Read the firmware file
      const firmwareData = await vscode.workspace.fs.readFile(firmwarePath);

	  return firmwareData;
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to load firmware.hex: ${error}`);
    }
  };

  // Handle messages from the webview
  panel.webview.onDidReceiveMessage(
    async (message) => {
      if (message.command === "loadFirmware") {
        const data = await loadFirmware();
		if (!data) {
			return;
		}
        panel.webview.postMessage({
			command: "firmwareData",
			data: Array.from(data),
		});
      }
    },
    undefined,
    context.subscriptions
  );

  // Set up file watcher for auto-reload
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (workspaceFolder) {
    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(
        workspaceFolder,
        ".pio/build/arduboy/firmware.hex"
      )
    );

    watcher.onDidChange(async () => {
      console.log("Firmware file changed, reloading...");
      await loadFirmware();
      panel.webview.postMessage({
        command: "showReloadMessage",
      });
    });

    watcher.onDidCreate(async () => {
      console.log("Firmware file created, loading...");
      await loadFirmware();
    });

    // Clean up watcher when panel is disposed
    panel.onDidDispose(() => {
      watcher.dispose();
    });

    context.subscriptions.push(watcher);
  }

  panel.webview.html = getPlayerWebviewHtml({
	ardensUri,
	panel
  })
}

// This method is called when your extension is deactivated
export function deactivate() {}
