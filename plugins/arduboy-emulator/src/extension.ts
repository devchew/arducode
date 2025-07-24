// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { tempGameHex } from "./temp";

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
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, "src", "ardens"),
        ],
      }
    );

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
    const loadFirmware = async () => {
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

        // Send the firmware data back to the webview
        panel.webview.postMessage({
          command: "firmwareData",
          data: Array.from(firmwareData),
        });
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to load firmware.hex: ${error}`);
      }
    };

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
      async (message) => {
        if (message.command === "loadFirmware") {
          await loadFirmware();
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

    panel.webview.html = `
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${panel.webview.cspSource} https: data:; script-src ${panel.webview.cspSource} 'unsafe-inline'; style-src ${panel.webview.cspSource} 'unsafe-inline';">
    <title>Ardens Player</title>
</head>

<style>
#canvas {
    position: absolute;
    top: 0px;
    left: 0px;
    margin: 0px;
    border: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: block;
    image-rendering: optimizeSpeed;
    image-rendering: -moz-crisp-edges;
    image-rendering: -o-crisp-edges;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: optimize-contrast;
    image-rendering: crisp-edges;
    image-rendering: pixelated;
    -ms-interpolation-mode: nearest-neighbor;}
</style>

<body>

<h1>hello world</h1>
<div id="notification" style="position: fixed; top: 10px; right: 10px; background: #4CAF50; color: white; padding: 10px; border-radius: 4px; display: none; z-index: 1000;">
    Firmware reloaded!
</div>

    <canvas id="canvas" tabindex="0" ondrop="dropHandler(event)" ondragover="event.preventDefault()" oncontextmenu="event.preventDefault()" width="100%" height="100%"></canvas>

    <script type='text/javascript'>
        var Module = {
            canvas: (function() { return document.getElementById('canvas'); })()
        };
        
        Module.canvas.addEventListener("click", (e) => { Module.canvas.focus(); });
        
        function loadFile(param, fname, fdata) {
            var ptr = Module._malloc(fdata.length);
            Module.HEAPU8.set(fdata, ptr)
            Module.ccall('load_file', 'number', ['string', 'string', 'number', 'number'], [param, fname, ptr, fdata.length]);
            Module._free(ptr)
        }
        
        function dropHandler(ev) {
            ev.preventDefault();
            [...ev.dataTransfer.files].forEach((f, i) => {
                
                var fr = new FileReader();
                fr.onloadend = evt => {
                    const fdata = new Uint8Array(evt.target.result);
                    loadFile('file', f.name, fdata)
                };
                fr.readAsArrayBuffer(f);
                
                console.log(f);
            });
        }
        
        Module['onRuntimeInitialized'] = function() {
            // Request the firmware.hex file from the extension
            const vscode = acquireVsCodeApi();
            vscode.postMessage({ command: 'loadFirmware' });
        };
        
        // Listen for messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'firmwareData') {
                const fdata = new Uint8Array(message.data);
                loadFile('file', 'firmware.hex', fdata);
            } else if (message.command === 'showReloadMessage') {
                // Show reload notification
                const notification = document.getElementById('notification');
                notification.style.display = 'block';
                setTimeout(() => {
                    notification.style.display = 'none';
                }, 3000);
            }
        });
    </script>

    <script src="${ardensUri}"></script>

</body>

</html>
`;
  });

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "arduboy-emulator.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage(
        "Hello World from arduboy-emulator!"
      );
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
