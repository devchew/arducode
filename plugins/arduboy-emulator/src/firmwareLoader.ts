import * as vscode from "vscode";
import { getFirmwarePath } from "./config";

export const loadFirmware = async (): Promise<Uint8Array | undefined> => {
  try {
    const firmwarePath = await getFirmwarePath();
    if (!firmwarePath) {
      vscode.window.showErrorMessage("No workspace folder found");
      return;
    }

    const firmwareData = await vscode.workspace.fs.readFile(firmwarePath);

    return firmwareData;
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to load firmware.hex: ${error}`);
  }
};

export const loadFile = async (panel: vscode.WebviewPanel) => {
  const data = await loadFirmware();
  if (data) {
    panel.webview.postMessage({
      command: "firmwareData",
      data: Array.from(data),
    });
  }
};
