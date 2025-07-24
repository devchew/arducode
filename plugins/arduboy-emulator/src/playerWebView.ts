import * as vscode from "vscode";

export const getPlayerWebviewHtml = ({
  panel,
  ardensUri,
}: {
  panel: vscode.WebviewPanel;
  ardensUri: vscode.Uri;
}) =>
  `
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${panel.webview.cspSource} https: data:; script-src ${panel.webview.cspSource} 'unsafe-inline'; style-src ${panel.webview.cspSource} 'unsafe-inline'; connect-src https://github.com;">
    <title>Ardens Player</title>
</head>

<style>
body {
    margin: 0;
    padding: 0;
    background-color: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
    font-family: var(--vscode-font-family);
    font-size: var(--vscode-font-size);
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}

#canvas {
    margin: 0px;
    border: 0;
    width: 100%;
    flex: 1;
    overflow: hidden;
    display: block;
    image-rendering: optimizeSpeed;
    image-rendering: -moz-crisp-edges;
    image-rendering: -o-crisp-edges;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: optimize-contrast;
    image-rendering: crisp-edges;
    image-rendering: pixelated;
    -ms-interpolation-mode: nearest-neighbor;
    background-color: var(--vscode-editor-background);
}

#controls {
    background-color: var(--vscode-sideBar-background);
    padding: 8px 12px;
    border-top: 1px solid var(--vscode-panel-border);
    font-size: calc(var(--vscode-font-size) * 0.9);
}

.controls-title {
    font-size: calc(var(--vscode-font-size) * 0.95);
    font-weight: 600;
    margin-bottom: 6px;
    color: var(--vscode-sideBarTitle-foreground);
    text-align: center;
    letter-spacing: 0.02em;
}

.controls-grid {
    display: flex;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
}

.control-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 140px;
}

.control-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 2px 4px;
    border-radius: 3px;
    transition: background-color 0.1s ease;
}

.control-row:hover {
    background-color: var(--vscode-list-hoverBackground);
}

.control-keys {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 18px;
    padding: 0 6px;
    font-family: var(--vscode-editor-font-family);
    font-size: calc(var(--vscode-font-size) * 0.85);
    font-weight: 500;
    background-color: var(--vscode-keybindingLabel-background);
    color: var(--vscode-keybindingLabel-foreground);
    border: 1px solid var(--vscode-keybindingLabel-border);
    border-radius: 3px;
    box-shadow: 0 1px 1px var(--vscode-widget-shadow);
    white-space: nowrap;
}

.control-description {
    color: var(--vscode-foreground);
    font-size: calc(var(--vscode-font-size) * 0.9);
    line-height: 1.2;
}

.credits {
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid var(--vscode-panel-border);
    text-align: center;
    font-size: calc(var(--vscode-font-size) * 0.8);
    color: var(--vscode-descriptionForeground);
}

.credits-text {
    margin-bottom: 4px;
}

.credits-link {
    color: var(--vscode-textLink-foreground);
    text-decoration: none;
    transition: color 0.1s ease;
}

.credits-link:hover {
    color: var(--vscode-textLink-activeForeground);
    text-decoration: underline;
}

.credits-link:visited {
    color: var(--vscode-textLink-foreground);
}

/* Fallback colors for older VS Code versions */
:root {
    --vscode-editor-background: #1e1e1e;
    --vscode-editor-foreground: #d4d4d4;
    --vscode-sideBar-background: #252526;
    --vscode-sideBarTitle-foreground: #cccccc;
    --vscode-panel-border: #3e3e42;
    --vscode-list-hoverBackground: #2a2d2e;
    --vscode-keybindingLabel-background: #8080802b;
    --vscode-keybindingLabel-foreground: #cccccc;
    --vscode-keybindingLabel-border: #33333344;
    --vscode-widget-shadow: #0000001a;
    --vscode-foreground: #cccccc;
    --vscode-descriptionForeground: #999999;
    --vscode-textLink-foreground: #3794ff;
    --vscode-textLink-activeForeground: #4daafc;
    --vscode-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    --vscode-font-size: 13px;
    --vscode-editor-font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}
</style>

<body>
   <canvas id="canvas" tabindex="0" ondrop="dropHandler(event)" ondragover="event.preventDefault()" oncontextmenu="event.preventDefault()" width="100%" height="100%"></canvas>
   
   <div id="controls">
       <div class="controls-title">Arduboy Controls</div>
       <div class="controls-grid">
           <div class="control-group">
               <div class="control-row">
                   <span class="control-keys">↑</span>
                     <span class="control-keys">↓</span>
                     <span class="control-keys">←</span>
                        <span class="control-keys">→</span>
                   <span class="control-description">D-Pad</span>
               </div>
           </div>
        </div>
        <div class="controls-grid">
           <div class="control-group">
               <div class="control-row">
                   <span class="control-keys">A</span>
                   <span class="control-keys">Z</span>
                   <span class="control-description">A Button</span>
               </div>
           </div>
           <div class="control-group">
               <div class="control-row">
                   <span class="control-keys">S</span>
                   <span class="control-keys">X</span>
                   <span class="control-keys">B</span>
                   <span class="control-description">B Button</span>
               </div>
           </div>
       </div>
       <div class="credits">
           <div class="credits-text">Powered by Ardens Arduboy Emulator</div>
           <div>
               <a href="https://github.com/tiberiusbrown/Ardens" class="credits-link" target="_blank" rel="noopener noreferrer">
                   github.com/tiberiusbrown/Ardens
               </a>
           </div>
       </div>
   </div>

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
            const vscode = acquireVsCodeApi();
            vscode.postMessage({ command: 'loadFirmware' });
        };
        
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'firmwareData') {
                const fdata = new Uint8Array(message.data);
                loadFile('file', 'firmware.hex', fdata);
            }
        });
    </script>

    <script src="${ardensUri}"></script>

</body>

</html>
`;
