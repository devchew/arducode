import * as vscode from "vscode";
import { getFirmwarePath } from "./config";

// Function to load firmware from the configured path
export const loadFirmware = async (): Promise<Uint8Array | undefined> => {
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

// Function to load firmware and send it to the webview panel
export const loadFile = async (panel: vscode.WebviewPanel) => {
  const data = await loadFirmware();
  if (data) {
    panel.webview.postMessage({
      command: "firmwareData",
      data: Array.from(data),
    });
  }
};
